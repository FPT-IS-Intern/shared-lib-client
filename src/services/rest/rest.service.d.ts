import { HttpBackend, HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import type { RestConfig } from "./rest.config";
export declare class RestService {
    private config;
    private readonly httpBackend;
    private readonly httpClient;
    constructor(config: RestConfig, httpClient: HttpClient, httpBackend: HttpBackend);
    private requestWithoutInterceptor;
    get<T>(path: string, params?: {
        [param: string]: string | string[];
    }, headers?: {
        [header: string]: string;
    }): Observable<T>;
    post<T>(path: string, body: unknown, params?: {
        [param: string]: string | string[];
    }, headers?: {
        [header: string]: string;
    }): Observable<T>;
    put<T>(path: string, body: unknown, params?: {
        [param: string]: string | string[];
    }, headers?: {
        [header: string]: string;
    }): Observable<T>;
    patch<T>(path: string, body: unknown, params?: {
        [param: string]: string | string[];
    }, headers?: {
        [header: string]: string;
    }): Observable<T>;
    delete<T>(path: string, params?: {
        [param: string]: string | string[];
    }, headers?: {
        [header: string]: string;
    }): Observable<T>;
    private requestWithInterceptor;
    getInternal<T>(path: string, params?: {
        [param: string]: string | string[];
    }, headers?: {
        [header: string]: string;
    }): Observable<T>;
    postInternal<T>(path: string, body: unknown, params?: {
        [param: string]: string | string[];
    }, headers?: {
        [header: string]: string;
    }): Observable<T>;
    putInternal<T>(path: string, body: unknown, params?: {
        [param: string]: string | string[];
    }, headers?: {
        [header: string]: string;
    }): Observable<T>;
    patchInternal<T>(path: string, body: unknown, params?: {
        [param: string]: string | string[];
    }, headers?: {
        [header: string]: string;
    }): Observable<T>;
    deleteInternal<T>(path: string, params?: {
        [param: string]: string | string[];
    }, headers?: {
        [header: string]: string;
    }): Observable<T>;
}
//# sourceMappingURL=rest.service.d.ts.map