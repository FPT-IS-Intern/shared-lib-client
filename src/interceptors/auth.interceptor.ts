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

// ============================================================================
// CONFIGURATION & STATE
// ============================================================================

// Hằng số nội bộ dùng để nhận diện tín hiệu hủy làm mới token.
export const CANCEL_REFRESH_TOKEN = "CANCEL_REFRESH_TOKEN";

// Cờ và subject dùng để đồng bộ các request khi access token hết hạn.
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Cấu hình cho auth interceptor.
 */
export interface AuthInterceptorConfig {
  /**
   * Danh sách các path pattern sẽ KHÔNG gắn Bearer token.
   * Mỗi phần tử là một chuỗi mà interceptor sẽ kiểm tra bằng `url.includes(pattern)`.
   *
   * Ví dụ: ['/login', '/password-reset', '/public/products']
   */
  excludedPaths?: string[];
}

/**
 * Danh sách path đang được sử dụng (có thể được cấu hình từ bên ngoài).
 */
let activeExcludedPaths: string[] = [];

// ============================================================================
// PUBLIC API (CONFIGURATION & UTILS)
// ============================================================================

/**
 * Cấu hình auth interceptor từ bên ngoài (thường gọi ở Shell App).
 *
 * @example
 * // Trong app.config.ts của Shell App:
 * import { configureAuthInterceptor } from 'shared-lib-client';
 *
 * configureAuthInterceptor({
 *   excludedPaths: [
 *     '/login',
 *     '/password-reset',
 *     '/refresh',
 *     '/public/products',
 *     '/public/categories',
 *   ],
 * });
 */
export function configureAuthInterceptor(config: AuthInterceptorConfig): void {
  if (config.excludedPaths && config.excludedPaths.length > 0) {
    activeExcludedPaths = [...config.excludedPaths];
  }
}

/**
 * Thêm các path vào danh sách loại trừ mà không ghi đè danh sách mặc định.
 */
export function addExcludedPaths(paths: string[]): void {
  const newPaths = paths.filter((p) => !activeExcludedPaths.includes(p));
  activeExcludedPaths = [...activeExcludedPaths, ...newPaths];
}

/**
 * Lấy danh sách các path đang bị loại trừ (dùng cho debug/testing).
 */
export function getExcludedPaths(): string[] {
  return [...activeExcludedPaths];
}

/**
 * Kiểm tra một URL có thuộc danh sách loại trừ hay không.
 */
function isExcluded(url: string): boolean {
  return activeExcludedPaths.some((pattern) => url.includes(pattern));
}

// ============================================================================
// INTERCEPTOR CORE
// ============================================================================

/**
 * Auth interceptor dùng chung cho các micro-frontend.
 * - Tự gắn header Authorization nếu có access token
 * - Khi gặp lỗi 401 thì phát event để Shell/Auth xử lý refresh token
 * - Các request đang chờ sẽ được đồng bộ qua `notifyTokenRefreshed`
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Lấy access token từ localStorage
  const token = StorageUtil.getAccessToken() || " ";
  let authReq = req;

  const isExcludedRequest = isExcluded(req.url);

  // 2. Gắn Authorization header nếu request không nằm trong nhóm loại trừ
  if (!isExcludedRequest) {
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

      // Nếu Refresh Token đã hỏng hoặc không hợp lệ -> Báo thẳng cho Shell App/Auth để Đăng xuất ngay
      if (errorCode === ErrorCode.REFRESH_TOKEN_INVALID) {
        window.dispatchEvent(new CustomEvent("FORCE_LOGOUT"));
        return throwError(() => error);
      }

      // Token hết hạn (hoặc mã 401 chung)
      const isAccessTokenExpired =
        error.status === 401 || errorCode === ErrorCode.ACCESS_TOKEN_EXPIRED;

      // Chỉ xử lý refresh cho các request nghiệp vụ, không áp dụng cho request login/hệ thống đã cấu hình loại trừ.
      if (isAccessTokenExpired && !isExcludedRequest) {
        return handle401Error(authReq, next);
      }
      return throwError(() => error);
    }),
  );
};

// ============================================================================
// TOKEN REFRESH LOGIC
// ============================================================================

/**
 * Khi access token hết hạn, thư viện không tự gọi API refresh.
 * Thay vào đó nó phát event `AUTH_TOKEN_EXPIRED` để Shell/Auth MFE chủ động refresh.
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
        if (token === CANCEL_REFRESH_TOKEN) {
          return throwError(
            () => new Error("Refresh process was cancelled. Request dropped."),
          );
        }
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
        if (token === CANCEL_REFRESH_TOKEN) {
          return throwError(
            () => new Error("Refresh process was cancelled. Request dropped."),
          );
        }
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

/**
 * Được Shell/Auth MFE gọi khi refresh token thất bại
 * để giải phóng toàn bộ các request đang nằm chờ trong hàng đợi
 * tránh rò rỉ bộ nhớ (memory leak).
 */
export function cancelTokenRefresh(): void {
  refreshTokenSubject.next(CANCEL_REFRESH_TOKEN);
  isRefreshing = false;
}
