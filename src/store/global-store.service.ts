import { Injectable, signal } from "@angular/core";

export interface UserInfo {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  [key: string]: any;
}

@Injectable({
  providedIn: "root",
})
export class GlobalStoreService {
  // Global signals for all MFEs
  readonly user = signal<UserInfo | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly theme = signal<"light" | "dark">("light");

  /**
   * Update user info across all apps
   */
  setUser(userInfo: UserInfo | null): void {
    this.user.set(userInfo);
  }

  /**
   * Update loading state
   */
  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  /**
   * Toggle global theme
   */
  setTheme(theme: "light" | "dark"): void {
    this.theme.set(theme);
  }

  /**
   * Clear all global state (useful on logout)
   */
  clearState(): void {
    this.user.set(null);
    this.isLoading.set(false);
  }
}
