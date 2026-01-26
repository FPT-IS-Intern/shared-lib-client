import { ResponseApi } from "./api-response.interface";
/**
 * Paginated Response
 */
export interface PaginatedData<T = any> {
    items: T[];
    totalItems: number;
    totalPages: number;
}
export interface PaginatedResponse<T = any> extends ResponseApi<PaginatedData<T>> {
    data: PaginatedData<T> | null;
}
//# sourceMappingURL=pagination.interface.d.ts.map