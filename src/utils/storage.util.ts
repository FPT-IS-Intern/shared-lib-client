import { StorageKey } from "../enums/localstorage-key.enum";
import { Language } from "../enums/language.enum";

export class StorageUtil {
  private static readonly DEVICE_ID_KEY = "X-Device-ID";

  // Device ID
  static getDeviceId(): string | null {
    return localStorage.getItem(this.DEVICE_ID_KEY);
  }

  static setDeviceId(id: string): void {
    localStorage.setItem(this.DEVICE_ID_KEY, id);
  }

  // Access Token
  static getAccessToken(): string | null {
    return localStorage.getItem(StorageKey.ACCESS_TOKEN);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(StorageKey.ACCESS_TOKEN, token);
  }

  static removeAccessToken(): void {
    localStorage.removeItem(StorageKey.ACCESS_TOKEN);
  }

  // Refresh Token
  static getRefreshToken(): string | null {
    return localStorage.getItem(StorageKey.REFRESH_TOKEN);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(StorageKey.REFRESH_TOKEN, token);
  }

  static removeRefreshToken(): void {
    localStorage.removeItem(StorageKey.REFRESH_TOKEN);
  }

  // User ID
  static getUserId(): string | null {
    return localStorage.getItem("userId");
  }

  static setUserId(id: string): void {
    localStorage.setItem("userId", id);
  }

  static removeUserId(): void {
    localStorage.removeItem("userId");
  }

  // Language
  static getLanguage(): Language | null {
    return localStorage.getItem(StorageKey.LANGUAGE) as Language | null;
  }

  static setLanguage(lang: Language): void {
    localStorage.setItem(StorageKey.LANGUAGE, lang);
  }

  // Clear all Auth data
  static clearAuthData(): void {
    localStorage.removeItem(StorageKey.ACCESS_TOKEN);
    localStorage.removeItem(StorageKey.REFRESH_TOKEN);
    localStorage.removeItem("userId");
  }

  // Clear everything including Device ID and Language
  static clearAll(): void {
    localStorage.removeItem(StorageKey.ACCESS_TOKEN);
    localStorage.removeItem(StorageKey.REFRESH_TOKEN);
    localStorage.removeItem("userId");
    localStorage.removeItem(this.DEVICE_ID_KEY);
    localStorage.removeItem(StorageKey.LANGUAGE);
  }
}
