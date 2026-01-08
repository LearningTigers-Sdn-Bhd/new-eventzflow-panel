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
 * @param target A string identifier for where this image belongs (e.g. 'resources')
 */
export async function uploadFile(
	file: File,
	target = "general",
): Promise<UploadResponse> {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("target", target);

	const response = await restClient.postFormData<
		UploadResponse | { data: UploadResponse }
	>("v1/uploads", formData);

	if ("data" in response) {
		return response.data;
	}

	return response;
}
