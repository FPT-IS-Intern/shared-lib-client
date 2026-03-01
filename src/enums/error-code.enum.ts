export enum ErrorCode {
  RESOURCE_NOT_FOUND = "resource.not.found",
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
  BAD_REQUEST = "bad.request",
  INTERNAL_SERVER_ERROR = "internal.server.error",
  VALIDATION_ERROR = "validation.error",
  CONFLICT = "conflict",
  SERVICE_UNAVAILABLE = "service.unavailable",
  REFRESH_TOKEN_INVALID = "auth.exception.refresh_token_invalid",
  ACCESS_TOKEN_EXPIRED = "auth.exception.access_token_expired",
}
