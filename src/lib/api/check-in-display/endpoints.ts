/**
 * Check-In Display API Endpoints
 * Manages welcome screen settings for events
 */

import { extractErrorMessage } from "@/utils/error-handler";
import { publicRestClient, restClient } from "@/utils/rest-api";
import type { CheckInDisplay, CheckInDisplayFormData } from "./types";

/**
 * Fetch public check-in display settings (no auth required)
 * GET /v1/public/events/:slug/check_in_display
 */
export async function fetchPublicCheckInDisplay(
	slug: string,
): Promise<CheckInDisplay> {
	try {
		const response = await publicRestClient.get<{ data: CheckInDisplay }>(
			`v1/public/events/${slug}/check_in_display`,
		);
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Fetch check-in display settings (authenticated)
 * GET /v1/events/:eventId/check_in_display
 */
export async function fetchCheckInDisplay(
	eventId: string,
): Promise<CheckInDisplay> {
	try {
		const response = await restClient.get<{ data: CheckInDisplay }>(
			`v1/events/${eventId}/check_in_display`,
		);
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Update check-in display settings
 * PATCH /v1/events/:eventId/check_in_display
 */
export async function updateCheckInDisplay(
	eventId: string,
	data: CheckInDisplayFormData,
): Promise<CheckInDisplay> {
	try {
		const formData = new FormData();
		formData.append(
			"check_in_display[font_family]",
			data.font_family,
		);
		formData.append(
			"check_in_display[font_size]",
			data.font_size.toString(),
		);
		formData.append(
			"check_in_display[animation_type]",
			data.animation_type,
		);
		formData.append(
			"check_in_display[is_bold]",
			data.is_bold.toString(),
		);
		formData.append(
			"check_in_display[name_color]",
			data.name_color,
		);

		if (data.background_image) {
			formData.append(
				"check_in_display[background_image]",
				data.background_image,
			);
		}

		if (data.voice_enabled !== undefined) {
			formData.append(
				"check_in_display[voice_enabled]",
				data.voice_enabled.toString(),
			);
		}

		if (data.voice_type) {
			formData.append(
				"check_in_display[voice_type]",
				data.voice_type,
			);
		}

		if (data.remove_background_image) {
			formData.append(
				"check_in_display[remove_background_image]",
				"true",
			);
		}

		const response = await restClient.patchFormData<CheckInDisplay>(
			`v1/events/${eventId}/check_in_display`,
			formData,
		);
		return response;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}
