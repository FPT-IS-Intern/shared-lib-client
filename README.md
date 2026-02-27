# @goat-bravos/shared-lib-client

Thư viện TypeScript dùng chung cho hệ sinh thái micro-frontend của InternHub. Thư viện cung cấp utility tái sử dụng, global state bằng Signals, auth interceptor và các interface API chuẩn hóa.

## 🚀 Tính năng

- 🚦 **Global Store**: Quản lý state dùng chung (User, Theme, Loading, Language) bằng Angular Signals.
- 🔐 **Auth Interceptor**: Tự gắn JWT vào header và đồng bộ luồng refresh token qua event.
- 🌍 **I18n Support**: Quản lý ngôn ngữ thống nhất và lưu bền vững trong localStorage.
- 📦 **Type-Safe API**: Chuẩn hóa `ResponseApi<T>` và các enum HTTP.
- 💾 **Storage Utils**: Wrapper an toàn kiểu dữ liệu cho `localStorage`.

---

## 📦 Cài đặt

```bash
npm install @goat-bravos/shared-lib-client
```

### Dependency đồng cấp

Đảm bảo project đang có các dependency sau:

- `@angular/core` (>= 18.0.0)
- `@angular/common` (>= 18.0.0)
- `rxjs` (>= 7.0.0)

---

## 🛠 Hướng dẫn sử dụng

### 1. Global Store (Quản lý state)

`GlobalStoreService` dùng **Angular Signals** để cung cấp state phản ứng có thể chia sẻ giữa nhiều micro-frontend.

```typescript
import { inject } from "@angular/core";
import { GlobalStoreService, Language } from "@goat-bravos/shared-lib-client";

export class AppSidebarComponent {
  private globalStore = inject(GlobalStoreService);

  // Đọc state
  user = this.globalStore.user;
  language = this.globalStore.language;

  // Cập nhật state
  changeLanguage(lang: Language) {
    this.globalStore.setLanguage(lang);
  }

  logout() {
    this.globalStore.clearState();
  }
}
```

### 2. Quốc tế hóa (i18n)

Việc quản lý ngôn ngữ được tích hợp sẵn trong `GlobalStoreService`.

- **Enum**: Dùng `Language` (`VI`, `EN`).
- **Khởi tạo**: Tự đọc từ `localStorage` khi service khởi tạo.
- **Đồng bộ**: Gọi `setLanguage()` sẽ cập nhật cả signal lẫn `localStorage`.

**Ví dụ với Ng-Zorro hoặc thư viện khác:**

```typescript
import { GlobalStoreService, Language } from "@goat-bravos/shared-lib-client";
import { en_US, vi_VN, NzI18nService } from "ng-zorro-antd/i18n";

// Trong AppComponent hoặc component có xử lý i18n
effect(() => {
  const currentLang = this.globalStore.language();
  this.i18n.setLocale(currentLang === Language.VI ? vi_VN : en_US);
});
```

### 3. Bộ chặn xác thực (Authentication Interceptor)

Chuẩn hóa các API call bằng cách đăng ký `authInterceptor` trong `app.config.ts`.

```typescript
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "@goat-bravos/shared-lib-client";

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
};
```

Interceptor này không tự gọi API refresh token. Khi gặp `401 Unauthorized`, nó sẽ phát event `AUTH_TOKEN_EXPIRED` để Shell/Auth MFE xử lý refresh token, sau đó chờ access token mới được đẩy lại qua `notifyTokenRefreshed(...)`.

Ví dụ ở Shell/Auth MFE:

```typescript
import { notifyTokenRefreshed } from "@goat-bravos/shared-lib-client";

window.addEventListener("AUTH_TOKEN_EXPIRED", async () => {
  const newAccessToken = await refreshTokenFromApi();
  notifyTokenRefreshed(newAccessToken);
});
```

### 4. Tiện ích Storage

Truy cập `localStorage` an toàn thông qua `StorageUtil`.

```typescript
import { StorageUtil, Language } from "@goat-bravos/shared-lib-client";

// Lấy token
const token = StorageUtil.getAccessToken();

// Cập nhật ngôn ngữ
StorageUtil.setLanguage(Language.VI);
```

### 5. Chuẩn hóa phản hồi API

Giữ format phản hồi thống nhất giữa các backend service.

```typescript
import { ResponseApi, SuccessResponse } from '@goat-bravos/shared-lib-client';

interface UserData {
  id: string;
  name: string;
}

// Trong service
getProfile(): Observable<ResponseApi<UserData>> {
  return this.http.get<ResponseApi<UserData>>('/api/profile');
}
```

---

## 📂 Cấu trúc thư mục

```text
src/
├── enums/            # Các enum mã HTTP, mã lỗi, khóa localStorage, ngôn ngữ
├── interceptors/     # Các interceptor dùng chung cho auth và lỗi
├── interfaces/       # Các interface chuẩn hóa cho response API và phân trang
├── store/            # Global store dùng Angular Signals (singleton)
├── utils/            # Các utility cho storage và helper
└── index.ts          # Điểm export public của thư viện
```

---

## 🛡️ Giấy phép

MIT
