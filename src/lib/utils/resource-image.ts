import type { ResourceImageVariants } from "@/lib/api/resource/response";

/**
 * Image variant sizes for resource images
 */
export type ResourceImageSize = "thumbnail" | "medium" | "large" | "original";

/**
 * Get the appropriate resource image URL based on the desired size
 * Supports both legacy format (string) and new format (object with variants)
 *
 * @param headerImgUrl - The header_img_url from the resource (can be string, object, or null)
 * @param size - The desired image size variant
 * @returns The image URL string or null if no image is available
 *
 * @example
 * // New format (with variants)
 * const url = getResourceImage(resource.headerImgUrl, "medium");
 *
 * // Legacy format (string URL) - returns the original
 * const url = getResourceImage(resource.headerImgUrl, "medium");
 *
 * // No image
 * const url = getResourceImage(null, "medium"); // returns null
 */
export function getResourceImage(
	headerImgUrl: string | ResourceImageVariants | null | undefined,
	size: ResourceImageSize = "medium"
): string | null {
	if (!headerImgUrl) {
		return null;
	}

	// If it's a string (legacy format), return as-is
	if (typeof headerImgUrl === "string") {
		return headerImgUrl;
	}

	// If it's an object with variants, return the requested size
	if (typeof headerImgUrl === "object" && size in headerImgUrl) {
		return headerImgUrl[size];
	}

	// Fallback to original or null
	if (typeof headerImgUrl === "object" && "original" in headerImgUrl) {
		return headerImgUrl.original;
	}

	return null;
}

/**
 * Check if the resource has an image attached
 *
 * @param headerImgUrl - The header_img_url from the resource
 * @returns True if an image is available, false otherwise
 */
export function hasResourceImage(
	headerImgUrl: string | ResourceImageVariants | null | undefined
): boolean {
	return getResourceImage(headerImgUrl, "original") !== null;
}

/**
 * Get all available image variants for a resource
 * Useful for generating responsive image srcsets
 *
 * @param headerImgUrl - The header_img_url from the resource
 * @returns Object with all available variants or null if no image
 */
export function getAllResourceImageVariants(
	headerImgUrl: string | ResourceImageVariants | null | undefined
): ResourceImageVariants | null {
	if (!headerImgUrl) {
		return null;
	}

	// If it's already the variants object, return it
	if (typeof headerImgUrl === "object") {
		return headerImgUrl;
	}

	// If it's a string (legacy format), create a variants object using the same URL
	if (typeof headerImgUrl === "string") {
		return {
			thumbnail: headerImgUrl,
			medium: headerImgUrl,
			large: headerImgUrl,
			original: headerImgUrl,
		};
	}

	return null;
}
