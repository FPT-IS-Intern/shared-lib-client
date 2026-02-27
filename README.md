# @goat-bravos/shared-lib-client

A specialized TypeScript library for InternHub micro-frontend applications. This library provides shared utilities, global state management (Signals), authentication interceptors, and standardized API interfaces.

## 🚀 Features

- 🚦 **Global Store**: Shared application state (User, Theme, Loading, Language) using Angular Signals.
- 🔐 **Auth Interceptor**: Automatic JWT token injection and smart token refresh mechanism.
- 🌍 **I18n Support**: Standardized language management with persistent storage.
- 📦 **Type-Safe API**: Consistent `ResponseApi<T>` interfaces and HTTP enums.
- 💾 **Storage Utils**: Type-safe wrapper for `localStorage`.

---

## 📦 Installation

```bash
npm install @goat-bravos/shared-lib-client
```

### Peer Dependencies

Ensure you have the following dependencies installed in your project:

- `@angular/core` (>= 18.0.0)
- `@angular/common` (>= 18.0.0)
- `rxjs` (>= 7.0.0)

---

## 🛠 Usage Guide

### 1. Global Store (Manager State)

The `GlobalStoreService` uses **Angular Signals** to provide a reactive state that can be shared across multiple micro-frontends.

```typescript
import { inject } from "@angular/core";
import { GlobalStoreService, Language } from "@goat-bravos/shared-lib-client";

export class AppSidebarComponent {
  private globalStore = inject(GlobalStoreService);

  // Read state
  user = this.globalStore.user;
  language = this.globalStore.language;

  // Update state
  changeLanguage(lang: Language) {
    this.globalStore.setLanguage(lang);
  }

  logout() {
    this.globalStore.clearState();
  }
}
```

### 2. Internationalization (i18n)

Management of language state is built into the `GlobalStoreService`.

- **Enums**: Use the `Language` enum (`VI`, `EN`).
- **Initial State**: Automatically loads from `localStorage` on initialization.
- **Syncing**: Calling `setLanguage()` updates both the signal and `localStorage`.

**Usage with Ng-Zorro or other libraries:**

```typescript
import { GlobalStoreService, Language } from "@goat-bravos/shared-lib-client";
import { en_US, vi_VN, NzI18nService } from "ng-zorro-antd/i18n";

// In your AppComponent or localized component
effect(() => {
  const currentLang = this.globalStore.language();
  this.i18n.setLocale(currentLang === Language.VI ? vi_VN : en_US);
});
```

### 3. Authentication Interceptor

Standardize your API calls by providing the `authInterceptor` in your `app.config.ts`.

```typescript
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "@goat-bravos/shared-lib-client";

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
};
```

_The interceptor automatically handles 401 Unauthorized errors by dispatching a `AUTH_TOKEN_EXPIRED` event and waiting for a refresh._

### 4. Storage Utilities

Access local storage safely using `StorageUtil`.

```typescript
import { StorageUtil, Language } from "@goat-bravos/shared-lib-client";

// Get tokens
const token = StorageUtil.getAccessToken();

// Set language
StorageUtil.setLanguage(Language.VI);
```

### 5. API Response Formatting

Ensure consistency across all backend responses.

```typescript
import { ResponseApi, SuccessResponse } from '@goat-bravos/shared-lib-client';

interface UserData {
  id: string;
  name: string;
}

// In your service
getProfile(): Observable<ResponseApi<UserData>> {
  return this.http.get<ResponseApi<UserData>>('/api/profile');
}
```

---

## 📂 Project Structure

```text
src/
├── enums/            # Http status codes, error codes, storage keys, language
├── interceptors/     # Shared Auth & Error interceptors
├── interfaces/       # Standardized API response & pagination models
├── store/            # Global Signals Store (Singleton)
├── utils/            # Storage & helper utilities
└── index.ts          # Public API exports
```

---

## 🛡️ License

MIT
