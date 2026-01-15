export interface BackendPaginationMeta {
	current_page: number;
	per_page: number;
	total_pages: number;
	total_count: number;
	prev_page?: number | null;
	next_page?: number | null;
	first_page?: number;
	last_page?: number;
	from?: number;
	to?: number;
}

export interface BackendSuccess<T> {
	success?: boolean;
	message?: string;
	data?: T;
	meta?: {
		pagination?: BackendPaginationMeta;
		[key: string]: unknown;
	};
}

export interface PaginationInfo {
	currentPage: number;
	perPage: number;
	totalPages: number;
	totalCount: number;
}

export interface PaginatedResult<T> {
	items: T;
	pagination?: PaginationInfo;
	message?: string;
}

function normalizePagination(
	meta?: BackendPaginationMeta,
): PaginationInfo | undefined {
	if (!meta) return undefined;
	const currentPage =
		typeof meta.current_page === "number" ? meta.current_page : 1;
	const perPage = typeof meta.per_page === "number" ? meta.per_page : 15;
	const totalPages =
		typeof meta.total_pages === "number" ? meta.total_pages : 1;
	const totalCount =
		typeof meta.total_count === "number" ? meta.total_count : 0;
	return { currentPage, perPage, totalPages, totalCount };
}

export function parseSuccess<T>(raw: unknown): PaginatedResult<T> {
	if (Array.isArray(raw)) {
		return { items: raw as unknown as T };
	}

	if (raw && typeof raw === "object") {
		const obj = raw as BackendSuccess<T>;
		if ("data" in obj) {
			return {
				items: (obj.data as T) ?? ([] as unknown as T),
				pagination: normalizePagination(obj.meta?.pagination),
				message: obj.message,
			};
		}
	}

	return { items: raw as T };
}
