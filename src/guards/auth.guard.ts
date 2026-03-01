import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { StorageUtil } from "../utils/storage.util";

/**
 * Guard mặc định: chưa login thì bay về '/auth'
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = StorageUtil.getAccessToken();

  if (token && token.trim().length > 0) {
    return true;
  }

  // Chuyển hướng người dùng về trang đăng nhập mặc định
  router.navigate(["/auth"]);
  return false;
};

/**
 * Guard tùy chỉnh: truyền URL để chuyển hướng khi chưa login
 * HDSD: canActivate: [createAuthGuard('/custom-login')]
 */
export const createAuthGuard = (
  redirectUrl: string = "/auth",
): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const token = StorageUtil.getAccessToken();

    if (token && token.trim().length > 0) {
      return true;
    }

    router.navigate([redirectUrl]);
    return false;
  };
};
