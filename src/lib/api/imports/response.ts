// Pure TypeScript types for API responses

// Frontend types (transformed from backend)
export type ImportTicketsResponse = {
	total: number;
	created: {
		count: number;
		data: Array<Record<string, unknown> & { model: string; id: string }>;
	};
	updated?: {
		count: number;
		data: Array<Record<string, unknown> & { model: string; id: string }>;
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
			data: Array<Record<string, unknown> & { model: string; id: string }>;
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
