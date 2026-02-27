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

// Cờ và subject dùng để đồng bộ các request khi access token hết hạn.
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Auth interceptor dùng chung cho các micro-frontend.
 * - Tự gắn header Authorization nếu có access token
 * - Khi gặp lỗi 401 thì phát event để Shell/Auth xử lý refresh token
 * - Các request đang chờ sẽ được đồng bộ qua `notifyTokenRefreshed`
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Lấy access token từ localStorage
  const token = StorageUtil.getAccessToken();
  let authReq = req;

  const isExcludedRequest =
    req.url.includes("/login") ||
    req.url.includes("/password-reset") ||
    req.url.includes("/refresh");

  // 2. Gắn Authorization header nếu request không nằm trong nhóm loại trừ
  if (token && !isExcludedRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // 3. Thực thi request và xử lý lỗi xác thực nếu có
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const responseBody = error.error as ResponseApi;
      const errorCode = responseBody?.status?.code;

      // 401 là trường hợp chuẩn; ngoài ra backend có thể trả mã REFRESH_TOKEN_INVALID.
      const isAuthError =
        error.status === 401 || errorCode === ErrorCode.REFRESH_TOKEN_INVALID;

      // Chỉ xử lý refresh cho các request nghiệp vụ, không áp dụng cho login/refresh.
      if (isAuthError && !isExcludedRequest) {
        return handle401Error(authReq, next);
      }
      return throwError(() => error);
    }),
  );
};

/**
 * Khi access token hết hạn, thư viện không tự gọi API refresh.
 * Thay vào đó nó phát event `AUTH_TOKEN_EXPIRED` để Shell/Auth MFE chủ động refresh,
 * sau đó đợi token mới được đẩy ngược lại qua `notifyTokenRefreshed`.
 */
function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    // Phát tín hiệu để Shell/Auth MFE thực hiện API refresh token thật sự.
    window.dispatchEvent(new CustomEvent("AUTH_TOKEN_EXPIRED"));

    // Đợi access token mới, sau đó phát lại request cũ.
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
    // Các request đến sau sẽ chờ cùng một đợt refresh đang diễn ra.
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
 * Được Shell/Auth MFE gọi sau khi refresh token thành công
 * để đánh thức các request đang chờ.
 */
export function notifyTokenRefreshed(newToken: string): void {
  refreshTokenSubject.next(newToken);
  isRefreshing = false;
}
