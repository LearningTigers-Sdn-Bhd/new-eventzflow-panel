export interface ConnectionInput {
	baseUrl: string;
	/** Leave blank to keep the saved key (only allowed while the URL is unchanged). */
	apiKey: string;
}

export interface HallInput {
	name: string;
	floor?: string;
	/** Only org owners may send this (even null, to unlink); the API answers 403 otherwise. */
	counterVenueId?: number | null;
}
