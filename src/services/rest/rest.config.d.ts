import { InjectionToken } from "@angular/core";
export interface RestConfig {
    apiBaseUrl: string;
    enableLogging: boolean;
    internalAutoRetry: boolean;
    retryAttempts: number;
    retryIntervalMs: number;
}
export declare const REST_CONFIG: InjectionToken<RestConfig>;
//# sourceMappingURL=rest.config.d.ts.map