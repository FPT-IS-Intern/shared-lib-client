export class StorageUtil {
  private static readonly DEVICE_ID_KEY = "X-Device-ID";
  private static readonly ACCESS_TOKEN_KEY = "accessToken";
  private static readonly REFRESH_TOKEN_KEY = "refreshToken";
  private static readonly USER_ID_KEY = "userId";

  // Device ID
  static getDeviceId(): string | null {
    return localStorage.getItem(this.DEVICE_ID_KEY);
  }

  static setDeviceId(id: string): void {
    localStorage.setItem(this.DEVICE_ID_KEY, id);
  }

  // Access Token
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static removeAccessToken(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  // Refresh Token
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // User ID
  static getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  static setUserId(id: string): void {
    localStorage.setItem(this.USER_ID_KEY, id);
  }

  static removeUserId(): void {
    localStorage.removeItem(this.USER_ID_KEY);
  }

  // Clear all Auth data
  static clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
  }

  // Clear everything including Device ID
  static clearAll(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.DEVICE_ID_KEY);
  }
}
