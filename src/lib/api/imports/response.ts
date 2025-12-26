// Pure TypeScript types for API responses

// Base import response structure (shared between tickets and visitors)
export type BaseImportResponse = {
	total: number;
	created: {
		count: number;
		data: Array<Record<string, unknown> & { model: string; id: string }>;
	};
	updated?: {
		count: number;
		data: Array<
			Record<string, unknown> & {
				model: string;
				id: string;
				changed_fields?: string[];
			}
		>;
	};
	skipped: {
		count: number;
		data: Array<Record<string, unknown> & { model: string; id: string }>;
	};
	duplicates_in_file?: {
		count: number;
		data: Array<Record<string, unknown> & { model: string; id: string }>;
	};
	errors: {
		count: number;
		data: string[];
	};
};

// Frontend types (transformed from backend)
export type ImportTicketsResponse = BaseImportResponse;
export type ImportVisitorsResponse = BaseImportResponse;

// Generic import response type for use in hooks
export type ImportResponse = BaseImportResponse;

// Backend import response (raw API response)
export type BackendImportTicketsResponse = {
	success: boolean;
	message: string;
	data: {
		total: number;
		created: {
			count: number;
			data: Array<Record<string, unknown> & { model: string; id: string }>;
		};
		updated?: {
			count: number;
			data: Array<
				Record<string, unknown> & {
					model: string;
					id: string;
					changed_fields?: string[];
				}
			>;
		};
		skipped: {
			count: number;
			data: Array<Record<string, unknown> & { model: string; id: string }>;
		};
		duplicates_in_file?: {
			count: number;
			data: Array<Record<string, unknown> & { model: string; id: string }>;
		};
		errors: {
			count: number;
			data: string[];
		};
	};
};

// Backend visitor import response (same structure)
export type BackendImportVisitorsResponse = BackendImportTicketsResponse;
