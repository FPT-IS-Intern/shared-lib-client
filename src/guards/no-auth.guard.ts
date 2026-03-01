import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { StorageUtil } from "../utils/storage.util";

/**
 * Guard mặc định: đã login thì bay vào '/homePage'
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = StorageUtil.getAccessToken();

  if (token && token.trim().length > 0) {
    router.navigate(["/homePage"]);
    return false;
  }

  return true;
};

/**
 * Guard tùy chỉnh: truyền URL để chuyển hướng khi ĐÃ login
 * HDSD: canActivate: [createNoAuthGuard('/dashboard')]
 */
export const createNoAuthGuard = (
  redirectUrl: string = "/homePage",
): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const token = StorageUtil.getAccessToken();

    if (token && token.trim().length > 0) {
      router.navigate([redirectUrl]);
      return false;
    }

    return true;
  };
};
