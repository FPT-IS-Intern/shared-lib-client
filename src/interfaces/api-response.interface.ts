/**
 * API Status Interface
 */
export interface ApiStatus {
  code: string;
  message: string;
  errors?: Record<string, string[]> | null;
}

/**
 * API Metadata Interface
 */
export interface ApiMetadata {
  requestId?: string;
  traceId?: string;
  signature?: string | null;
  timestamp?: number;

  // @ts-ignore
  [key: string]: any;
}

/**
 * Base Response API Interface
 */
export interface ResponseApi<T = any> {
  status: ApiStatus | null;
  data: T | null;
  metaData: ApiMetadata | null;
}

/**
 * Success Response
 */
export interface SuccessResponse<T = any> extends ResponseApi<T> {
  status: null;
  data: T;
  metaData: null;
}

/**
 * Error Response
 */
export interface ErrorResponse extends ResponseApi<null> {
  status: ApiStatus;
  data: null;
  metaData: ApiMetadata;
}
