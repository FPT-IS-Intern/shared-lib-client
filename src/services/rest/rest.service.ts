import {HttpBackend, HttpClient, HttpParams} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError, retry} from "rxjs/operators";
import {Inject, Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {REST_CONFIG} from "./rest.config";
import type {RestConfig} from "./rest.config";

@Injectable({ providedIn: 'root' })
export class RestService {

  private readonly httpBackend: HttpClient;
  private readonly httpClient: HttpClient;

  constructor(
    @Inject(REST_CONFIG) private config: RestConfig,
    private router: Router,
    httpClient: HttpClient,
    httpBackend: HttpBackend
  ) {
    this.httpClient = httpClient;
    this.httpBackend = new HttpClient(httpBackend);
  }

  private requestWithoutInterceptor<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: { [param: string]: string | string[] },
    headers: { [header: string]: string } = { 'Content-Type': 'application/json' }
  ): Observable<T> {
    const httpParams: HttpParams = new HttpParams({
      fromObject: params || {}
    });
    return this.httpBackend.request<T>(
      method,
      path,
      {
        headers: headers,
        body: body,
        params: httpParams,
      }
    )
  }

  public get<T>(
    path: string,
    params?: { [param: string]: string | string[] },
    headers: { [header: string]: string } = { 'Content-Type': 'application/json' }
  ): Observable<T> {
    return this.requestWithoutInterceptor<T>(
      'GET',
      path,
      undefined,
      params,
      headers
    )
  }

  public post<T>(
    path: string,
    body: unknown,
    params?: { [param: string]: string | string[] },
    headers: { [header: string]: string } = { 'Content-Type': 'application/json' }
  ): Observable<T> {
    return this.requestWithoutInterceptor<T>(
      'POST',
      path,
      body,
      params,
      headers
    )
  }

  public put<T>(
    path: string,
    body: unknown,
    params?: { [param: string]: string | string[] },
    headers: { [header: string]: string } = { 'Content-Type': 'application/json' }
  ): Observable<T> {
    return this.requestWithoutInterceptor<T>(
      'PUT',
      path,
      body,
      params,
      headers
    )
  }

  public patch<T>(
    path: string,
    body: unknown,
    params?: { [param: string]: string | string[] },
    headers: { [header: string]: string } = { 'Content-Type': 'application/json' }
  ): Observable<T> {
    return this.requestWithoutInterceptor<T>(
      'PATCH',
      path,
      body,
      params,
      headers
    )
  }

  public delete<T>(
    path: string,
    params?: { [param: string]: string | string[] },
    headers: { [header: string]: string } = { 'Content-Type': 'application/json' }
  ): Observable<T> {
    return this.requestWithoutInterceptor<T>(
      'DELETE',
      path,
      undefined,
      params,
      headers
    )
  }

  private requestWithInterceptor<T>(
    method: string,
    path: string,
    credentials: boolean = false,
    body?: unknown,
    params?: { [param: string]: string | string[] },
    headers: { [header: string]: string } = { 'Content-Type': 'application/json' }
  ): Observable<T> {
    const httpParams: HttpParams = new HttpParams({
      fromObject: params || {}
    });

    if (credentials) {
      const token = localStorage.getItem(this.config.tokenKey);
      if (!token) {
        this.router.navigate([this.config.loginPath]);
        return throwError(() => new Error('No authentication token found'));
      }
      headers = { ...headers, 'Authorization': `Bearer ${token}` };
    }

    let request$ = this.httpClient.request<T>(
      method,
      this.config.apiBaseUrl + path,
      {
        headers: headers,
        body: body,
        params: httpParams,
      }
    );

    // Handle auto retry if enabled
    if (this.config.internalAutoRetry && this.config.retryAttempts > 0) {
      request$ = request$.pipe(
        retry({
          count: this.config.retryAttempts,
          delay: this.config.retryIntervalMs
        }),
        catchError((error) => {
          if (this.config.enableLogging) {
            console.error(`Request failed after ${this.config.retryAttempts} retries:`, error);
          }
          return throwError(() => error);
        })
      );
    }
    return request$;
  }

  public getInternal<T>(
    path: string,
    credentials: boolean = false,
    params?: { [param: string]: string | string[] },
    headers: { [header: string]: string } = { 'Content-Type': 'application/json' }
  ): Observable<T> {
    return this.requestWithInterceptor<T>(
      'GET',
      path,
      credentials,
      undefined,
      params,
      headers
    )
  }

  public postInternal<T>(
    path: string,
    body: unknown,
    credentials: boolean = false,
    params?: { [param: string]: string | string[] },
    headers: { [header: string]: string } = { 'Content-Type': 'application/json' }
  ): Observable<T> {
    return this.requestWithInterceptor<T>(
      'POST',
      path,
      credentials,
      body,
      params,
      headers
    )
  }

  public putInternal<T>(
    path: string,
    body: unknown,
    credentials: boolean = false,
    params?: { [param: string]: string | string[] },
    headers: { [header: string]: string } = { 'Content-Type': 'application/json' }
  ): Observable<T> {
    return this.requestWithInterceptor<T>(
      'PUT',
      path,
      credentials,
      body,
      params,
      headers
    )
  }

  public patchInternal<T>(
    path: string,
    body: unknown,
    credentials: boolean = false,
    params?: { [param: string]: string | string[] },
    headers: { [header: string]: string } = { 'Content-Type': 'application/json' }
  ): Observable<T> {
    return this.requestWithInterceptor<T>(
      'PATCH',
      path,
      credentials,
      body,
      params,
      headers
    )
  }

  public deleteInternal<T>(
    path: string,
    credentials: boolean = false,
    params?: { [param: string]: string | string[] },
    headers: { [header: string]: string } = { 'Content-Type': 'application/json' }
  ): Observable<T> {
    return this.requestWithInterceptor<T>(
      'DELETE',
      path,
      credentials,
      undefined,
      params,
      headers
    )
  }

}