// Backend API response type for API Key (GET /v1/api_keys)
export type BackendApiKey = {
	id: string;
	name: string;
	scope: ApiKeyScope;
	last_used_at: string | null;
	created_at: string;
	is_active: boolean;
	event_id: number | null;
};

// Backend API response type for API Key creation (POST /v1/api_keys)
export type BackendApiKeyCreation = {
	id: string;
	name: string;
	scope: ApiKeyScope;
	raw_key: string;
	message: string;
};

export type ApiKeyScope = "read_only" | "check_in" | "read_write";

// Frontend API key type (for list display)
export type ApiKey = {
	id: string;
	name: string;
	scope: ApiKeyScope;
	lastUsedAt: string | null;
	createdAt: string;
	isActive: boolean;
	eventId?: number | null;
};

// Frontend API key creation response
export type ApiKeyCreation = {
	id: string;
	name: string;
	scope: ApiKeyScope;
	rawKey: string;
	message: string;
};

// Response types for operations
export type CreateApiKeyResponse = {
	success: boolean;
	apiKey: ApiKeyCreation;
};

export type DeleteApiKeyResponse = {
	success: boolean;
	message: string;
};
