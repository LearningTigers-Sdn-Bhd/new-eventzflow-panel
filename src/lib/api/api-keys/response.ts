// Backend API response type for API Key (GET /v1/api_keys)
export type BackendApiKey = {
	id: string;
	name: string;
	last_used_at: string | null;
	created_at: string;
	is_active: boolean;
};

// Backend API response type for API Key creation (POST /v1/api_keys)
export type BackendApiKeyCreation = {
	id: string;
	name: string;
	raw_key: string;
	message: string;
};

// Frontend API key type (for list display)
export type ApiKey = {
	id: string;
	name: string;
	lastUsedAt: string | null;
	createdAt: string;
	isActive: boolean;
};

// Frontend API key creation response
export type ApiKeyCreation = {
	id: string;
	name: string;
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
