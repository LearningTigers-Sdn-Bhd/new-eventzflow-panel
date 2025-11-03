// Pure TypeScript types for API responses

// Frontend types (transformed from backend)
export type ImportTicketsResponse = {
	created: number;
	updated?: number;
	skipped: number;
	duplicates_in_file?: number;
	errors: string[];
};

// Backend import response (raw API response)
export type BackendImportTicketsResponse = {
	success: boolean;
	message: string;
	data: {
		created: number;
		updated?: number;
		skipped: number;
		duplicates_in_file?: number;
		errors: string[];
	};
};
