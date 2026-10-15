// Pure TypeScript types for API responses

// Base import response structure (shared between tickets and visitors)
export type ImportEventSummary = {
	title: string;
	exists: boolean;
	row_count: number;
};

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
	// Per-event breakdown for the preview: which Event Title values the file
	// targets, whether each reuses an existing event or would create a new one.
	events?: ImportEventSummary[];
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
		events?: ImportEventSummary[];
	};
};

// Backend visitor import response (same structure)
export type BackendImportVisitorsResponse = BackendImportTicketsResponse;
