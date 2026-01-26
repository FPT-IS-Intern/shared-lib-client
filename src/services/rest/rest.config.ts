import {InjectionToken} from "@angular/core";

export interface RestConfig {
  apiBaseUrl: string;
  enableLogging: boolean;
  internalAutoRetry: boolean;
  retryAttempts: number;
  retryIntervalMs: number;
  loginPath: string;
  tokenKey: string;
}

export const REST_CONFIG = new InjectionToken<RestConfig>('REST_CONFIG');