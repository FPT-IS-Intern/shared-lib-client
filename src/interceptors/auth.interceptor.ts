import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpErrorResponse,
  HttpInterceptorFn,
} from "@angular/common/http";
import { Observable, throwError, BehaviorSubject } from "rxjs";
import { catchError, filter, take, switchMap, finalize } from "rxjs/operators";

import { StorageUtil } from "../utils/storage.util";
import { ErrorCode } from "../enums/error-code.enum";
import { ResponseApi } from "../interfaces/api-response.interface";

// Flag and Subject to manage token refreshing state globally
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Shared Auth Interceptor
 * - Injects Authorization header
 * - Handles 401 errors with synchronized token refresh
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Get token from StorageUtil
  const token = StorageUtil.getAccessToken();
  let authReq = req;

  // 2. Add Authorization header if token exists
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // 3. Process the request
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const responseBody = error.error as ResponseApi;
      const errorCode = responseBody?.status?.code;

      // Check if it's an Authentication error
      // 401 is standard, but the backend also uses REFRESH_TOKEN_INVALID in some contexts
      const isAuthError =
        error.status === 401 || errorCode === ErrorCode.REFRESH_TOKEN_INVALID;

      // Handle Auth error if not on login or refresh endpoints
      if (
        isAuthError &&
        !authReq.url.includes("/auth/login") &&
        !authReq.url.includes("/auth/refresh")
      ) {
        return handle401Error(authReq, next);
      }
      return throwError(() => error);
    }),
  );
};

/**
 * Handle 401 errors by attempting to refresh the token
 */
function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = StorageUtil.getRefreshToken();

    // Here we assume the Shell/App environment has a way to call refresh token
    // For a library, we might need to pass a callback or use a known endpoint
    // Let's assume a standard endpoint or dispatch a CustomEvent for the Shell to handle

    // Dispatch event so the Shell/Auth MFE can perform the actual API call
    window.dispatchEvent(new CustomEvent("AUTH_TOKEN_EXPIRED"));

    // We wait for the new token to be emitted through the subject
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token: string) => {
        return next(
          request.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          }),
        );
      }),
      finalize(() => {
        isRefreshing = false;
      }),
    );
  } else {
    // Other requests wait in queue
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token: string) => {
        return next(
          request.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          }),
        );
      }),
    );
  }
}

/**
 * Utility to be called by the Shell/Auth MFE when a new token is received
 */
export function notifyTokenRefreshed(newToken: string): void {
  refreshTokenSubject.next(newToken);
  isRefreshing = false;
}
