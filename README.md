# @intern-hub/shared-lib-client

A TypeScript library for Angular applications that provides shared utilities, interfaces, and services for making HTTP requests with a standardized API response format.

## Features

- 🚀 **REST Service**: A powerful HTTP client wrapper with and without interceptors
- 🔐 **Built-in Authentication**: Automatic token handling with configurable storage key
- 🔄 **Auto-Retry**: Configurable retry mechanism for failed requests
- 📦 **Type-Safe Interfaces**: Standardized API response formats with TypeScript
- 🔢 **Enums**: Pre-defined HTTP status codes, error codes, and storage keys
- 🎯 **Angular Integration**: Built specifically for Angular applications with dependency injection support
- 📝 **Full TypeScript Support**: Complete type definitions included

## Installation

```bash
npm install @intern-hub/shared-lib-client
```

### Peer Dependencies

This library requires the following peer dependencies:

```json
{
  "@angular/common": "21.0.1",
  "@angular/core": "21.1.0-rc.0",
  "@angular/router": "21.0.1"
}
```

## Configuration

### Step 1: Provide REST_CONFIG in Your Application

Before using the `RestService`, you need to provide the `REST_CONFIG` injection token in your Angular application:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { REST_CONFIG, RestConfig } from '@intern-hub/shared-lib-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      // Add your interceptors here if needed
      withInterceptors([yourInterceptor])
    ),
    provideRouter(routes),
    {
      provide: REST_CONFIG,
      useValue: {
        apiBaseUrl: 'https://api.example.com',
        enableLogging: true,
        internalAutoRetry: true,
        retryAttempts: 3,
        retryIntervalMs: 1000,
        loginPath: '/login',
        tokenKey: 'accessToken'
      } as RestConfig
    }
  ]
};
```

Or in a traditional NgModule:

```typescript
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { REST_CONFIG, RestConfig } from '@intern-hub/shared-lib-client';

@NgModule({
  imports: [HttpClientModule, RouterModule],
  providers: [
    {
      provide: REST_CONFIG,
      useValue: {
        apiBaseUrl: 'https://api.example.com',
        enableLogging: true,
        internalAutoRetry: true,
        retryAttempts: 3,
        retryIntervalMs: 1000,
        loginPath: '/login',
        tokenKey: 'accessToken'
      } as RestConfig
    }
  ]
})
export class AppModule { }
```

### REST_CONFIG Interface

```typescript
interface RestConfig {
  apiBaseUrl: string;         // Base URL for internal API calls
  enableLogging: boolean;     // Enable/disable error logging
  internalAutoRetry: boolean; // Enable auto-retry for internal calls
  retryAttempts: number;      // Number of retry attempts
  retryIntervalMs: number;    // Interval between retries in milliseconds
  loginPath: string;          // Path to redirect when no auth token found
  tokenKey: string;           // LocalStorage key for the authentication token
}
```

## Usage

### RestService

The `RestService` provides two sets of HTTP methods:

1. **External Methods** (`get`, `post`, `put`, `patch`, `delete`): Make requests without Angular interceptors - useful for third-party APIs
2. **Internal Methods** (`getInternal`, `postInternal`, `putInternal`, `patchInternal`, `deleteInternal`): Make requests with Angular interceptors, automatically prepend the `apiBaseUrl`, and support automatic authentication

#### Example: External API Calls (Without Interceptors)

```typescript
import { Component, inject } from '@angular/core';
import { RestService, ResponseApi } from '@intern-hub/shared-lib-client';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user',
  template: `...`
})
export class UserComponent {
  private restService = inject(RestService);

  loadExternalUser() {
    // GET request to external API (no interceptors)
    this.restService.get<User>('https://external-api.com/users/1')
      .subscribe({
        next: (user) => console.log('User:', user),
        error: (err) => console.error('Error:', err)
      });
  }

  createExternalUser() {
    const newUser = { name: 'John Doe', email: 'john@example.com' };
    
    this.restService.post<User>(
      'https://external-api.com/users',
      newUser
    ).subscribe({
      next: (user) => console.log('Created:', user),
      error: (err) => console.error('Error:', err)
    });
  }
}
```

#### Example: Internal API Calls (With Interceptors)

```typescript
import { Component, inject } from '@angular/core';
import { RestService, ResponseApi, SuccessResponse } from '@intern-hub/shared-lib-client';

interface Product {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-product',
  template: `...`
})
export class ProductComponent {
  private restService = inject(RestService);

  // If apiBaseUrl is 'https://api.example.com'
  // This will call: https://api.example.com/api/products
  loadProducts() {
    // Second parameter `credentials: false` - no auth token required
    this.restService.getInternal<ResponseApi<Product[]>>('/api/products', false)
      .subscribe({
        next: (response) => {
          if (response.data) {
            console.log('Products:', response.data);
          }
        },
        error: (err) => console.error('Error:', err)
      });
  }

  // With authentication - automatically adds Bearer token from localStorage
  loadMyProducts() {
    // Second parameter `credentials: true` - auth token will be added
    this.restService.getInternal<ResponseApi<Product[]>>('/api/my-products', true)
      .subscribe({
        next: (response) => {
          if (response.data) {
            console.log('My Products:', response.data);
          }
        },
        error: (err) => console.error('Error:', err)
      });
  }

  createProduct() {
    const newProduct = { name: 'Laptop', price: 999.99 };
    
    // POST with authentication
    this.restService.postInternal<ResponseApi<Product>>(
      '/api/products',
      newProduct,
      true  // credentials: true
    ).subscribe({
      next: (response) => console.log('Created:', response.data),
      error: (err) => console.error('Error:', err)
    });
  }

  updateProduct(id: number) {
    const updates = { price: 899.99 };
    
    this.restService.patchInternal<ResponseApi<Product>>(
      `/api/products/${id}`,
      updates,
      true  // credentials: true
    ).subscribe({
      next: (response) => console.log('Updated:', response.data),
      error: (err) => console.error('Error:', err)
    });
  }

  deleteProduct(id: number) {
    this.restService.deleteInternal<ResponseApi<void>>(
      `/api/products/${id}`,
      true  // credentials: true
    ).subscribe({
      next: () => console.log('Deleted successfully'),
      error: (err) => console.error('Error:', err)
    });
  }
}
```

#### Example: With Custom Headers and Query Params

```typescript
loadProductsWithParams() {
  const params = { category: 'electronics', sort: 'price' };
  const headers = { 'X-Custom-Header': 'custom-value' };

  // getInternal(path, credentials, params, headers)
  this.restService.getInternal<ResponseApi<Product[]>>(
    '/api/products',
    true,     // credentials
    params,   // query params
    headers   // custom headers
  ).subscribe({
    next: (response) => console.log('Products:', response.data),
    error: (err) => console.error('Error:', err)
  });
}
```

### Interfaces

#### API Response Interfaces

```typescript
import { 
  ResponseApi, 
  SuccessResponse, 
  ErrorResponse,
  ApiStatus,
  ApiMetadata,
  PaginatedResponse,
  PaginatedData
} from '@intern-hub/shared-lib-client';

// Generic response structure
const response: ResponseApi<User> = {
  status: null,
  data: { id: 1, name: 'John' },
  metaData: null
};

// Success response
const success: SuccessResponse<User> = {
  status: null,
  data: { id: 1, name: 'John' },
  metaData: null
};

// Error response
const error: ErrorResponse = {
  status: {
    code: 'validation.error',
    message: 'Validation failed',
    errors: {
      email: ['Email is required'],
      name: ['Name must be at least 3 characters']
    }
  },
  data: null,
  metaData: {
    requestId: 'abc-123',
    traceId: 'xyz-789',
    timestamp: 1234567890
  }
};

// Paginated response
const paginated: PaginatedResponse<User> = {
  status: null,
  data: {
    items: [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ],
    totalItems: 100,
    totalPages: 10
  },
  metaData: null
};
```

#### HTTP Client Headers

```typescript
import { HttpClientHeaders } from '@intern-hub/shared-lib-client';

const headers: HttpClientHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer token123',
  'X-Custom-Header': 'custom-value'
};
```

### Enums

#### HTTP Status Codes

```typescript
import { HttpStatus } from '@intern-hub/shared-lib-client';

if (response.status === HttpStatus.OK) {
  console.log('Success!');
}

// Available statuses:
// HttpStatus.OK = 200
// HttpStatus.CREATED = 201
// HttpStatus.NO_CONTENT = 204
// HttpStatus.BAD_REQUEST = 400
// HttpStatus.UNAUTHORIZED = 401
// HttpStatus.FORBIDDEN = 403
// HttpStatus.NOT_FOUND = 404
// HttpStatus.CONFLICT = 409
// HttpStatus.INTERNAL_SERVER_ERROR = 500
// HttpStatus.SERVICE_UNAVAILABLE = 503
```

#### Error Codes

```typescript
import { ErrorCode } from '@intern-hub/shared-lib-client';

if (error.status?.code === ErrorCode.UNAUTHORIZED) {
  // Handle unauthorized
}

// Available error codes:
// ErrorCode.RESOURCE_NOT_FOUND = 'resource.not.found'
// ErrorCode.UNAUTHORIZED = 'unauthorized'
// ErrorCode.FORBIDDEN = 'forbidden'
// ErrorCode.BAD_REQUEST = 'bad.request'
// ErrorCode.INTERNAL_SERVER_ERROR = 'internal.server.error'
// ErrorCode.VALIDATION_ERROR = 'validation.error'
// ErrorCode.CONFLICT = 'conflict'
// ErrorCode.SERVICE_UNAVAILABLE = 'service.unavailable'
```

#### Storage Keys

```typescript
import { StorageKey } from '@intern-hub/shared-lib-client';

localStorage.setItem(StorageKey.ACCESS_TOKEN, 'token123');
const token = localStorage.getItem(StorageKey.ACCESS_TOKEN);

// Available keys:
// StorageKey.ACCESS_TOKEN = 'accessToken'
// StorageKey.CONTENT_TYPE = 'application/json'
```

## Complete Example: User Service

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { 
  RestService, 
  ResponseApi, 
  ErrorCode 
} from '@intern-hub/shared-lib-client';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private restService = inject(RestService);

  // Public endpoint - no authentication needed
  getUsers(): Observable<User[]> {
    return this.restService.getInternal<ResponseApi<User[]>>('/api/users', false)
      .pipe(
        map(response => response.data || []),
        catchError(this.handleError)
      );
  }

  // Protected endpoint - requires authentication
  getCurrentUser(): Observable<User> {
    return this.restService.getInternal<ResponseApi<User>>('/api/users/me', true)
      .pipe(
        map(response => {
          if (!response.data) {
            throw new Error('User not found');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.restService.postInternal<ResponseApi<User>>(
      '/api/users',
      user,
      true  // requires auth
    ).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Failed to create user');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  updateUser(id: number, updates: Partial<User>): Observable<User> {
    return this.restService.patchInternal<ResponseApi<User>>(
      `/api/users/${id}`,
      updates,
      true  // requires auth
    ).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Failed to update user');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.restService.deleteInternal<ResponseApi<void>>(
      `/api/users/${id}`,
      true  // requires auth
    ).pipe(
      map(() => undefined),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    if (error.status?.code === ErrorCode.UNAUTHORIZED) {
      // User will be automatically redirected to loginPath
    }
    
    return throwError(() => error);
  }
}
```

## API Reference

### RestService Methods

#### External Methods (Without Interceptors)

| Method | Signature |
|--------|-----------|
| `get` | `get<T>(path: string, params?: object, headers?: object): Observable<T>` |
| `post` | `post<T>(path: string, body: unknown, params?: object, headers?: object): Observable<T>` |
| `put` | `put<T>(path: string, body: unknown, params?: object, headers?: object): Observable<T>` |
| `patch` | `patch<T>(path: string, body: unknown, params?: object, headers?: object): Observable<T>` |
| `delete` | `delete<T>(path: string, params?: object, headers?: object): Observable<T>` |

#### Internal Methods (With Interceptors)

| Method | Signature |
|--------|-----------|
| `getInternal` | `getInternal<T>(path: string, credentials?: boolean, params?: object, headers?: object): Observable<T>` |
| `postInternal` | `postInternal<T>(path: string, body: unknown, credentials?: boolean, params?: object, headers?: object): Observable<T>` |
| `putInternal` | `putInternal<T>(path: string, body: unknown, credentials?: boolean, params?: object, headers?: object): Observable<T>` |
| `patchInternal` | `patchInternal<T>(path: string, body: unknown, credentials?: boolean, params?: object, headers?: object): Observable<T>` |
| `deleteInternal` | `deleteInternal<T>(path: string, credentials?: boolean, params?: object, headers?: object): Observable<T>` |

**Note:** When `credentials` is `true`, the service automatically:
1. Retrieves the token from `localStorage` using the configured `tokenKey`
2. Adds an `Authorization: Bearer <token>` header to the request
3. Redirects to `loginPath` if no token is found

## Development

### Build the Library

```bash
npm run build
```

This will compile the TypeScript files and generate the distributable files in the `dist` folder.

### Project Structure

```
intern-fe-library/
├── src/
│   ├── enums/
│   │   ├── error-code.enum.ts
│   │   ├── http-status.enum.ts
│   │   └── localstorage-key.enum.ts
│   ├── interfaces/
│   │   ├── api-response.interface.ts
│   │   ├── http-heades.interface.ts
│   │   └── pagination.interface.ts
│   ├── services/
│   │   └── rest/
│   │       ├── rest.config.ts
│   │       └── rest.service.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## TypeScript Configuration

This library is built with the following TypeScript features:

- **Decorators**: Full support for Angular decorators (`experimentalDecorators`, `emitDecoratorMetadata`)
- **Strict Mode**: Enabled for better type safety
- **Module System**: Uses `NodeNext` for modern ES modules
- **Declaration Files**: Generates `.d.ts` files for TypeScript consumers

## License

ISC

## Author

intern-hub

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
