import { restClient } from "@/utils/rest-api";

export interface UploadResponse {
	url: string;
	signed_id: string;
	filename: string;
	content_type: string;
	byte_size: number;
}

/**
 * Uploads a file to the generic backend upload endpoint
 * @param file The file to upload
 * @param target A string identifier for where this image belongs (e.g. 'resources', 'rich-editor')
 * @returns Promise resolving to the upload response with URL and metadata
 * @throws Error if upload fails with a descriptive message
 */
export async function uploadFile(
	file: File,
	target = "general",
): Promise<UploadResponse> {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("target", target);

	try {
		const response = await restClient.postFormData<
			UploadResponse | { data: UploadResponse }
		>("v1/uploads", formData);

		if ("data" in response) {
			return response.data;
		}

		return response;
	} catch (error) {
		// Handle API errors with user-friendly messages
		if (error && typeof error === 'object' && 'message' in error) {
			const apiError = error as { message?: string; status?: number };

			// Extract error message from response if available
			if (apiError.message) {
				throw new Error(apiError.message);
			}
		}

		// Fallback error message
		throw new Error("File upload failed. Please check your connection and try again.");
	}
}
