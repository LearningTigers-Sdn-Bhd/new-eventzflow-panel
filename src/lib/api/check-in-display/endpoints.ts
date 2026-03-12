/**
 * Check-In Display API Endpoints
 * Manages welcome screen settings for events
 */

import { extractErrorMessage } from "@/utils/error-handler";
import { publicRestClient, restClient } from "@/utils/rest-api";
import type {
	AnnounceGuestResponse,
	CheckInDisplay,
	CheckInDisplayFormData,
} from "./types";

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
		
		if (data.font_family) {
			formData.append("check_in_display[font_family]", data.font_family);
		}
		if (data.font_size !== undefined) {
			formData.append("check_in_display[font_size]", data.font_size.toString());
		}
		if (data.animation_type) {
			formData.append("check_in_display[animation_type]", data.animation_type);
		}
		if (data.is_bold !== undefined) {
			formData.append("check_in_display[is_bold]", data.is_bold.toString());
		}
		if (data.name_color) {
			formData.append("check_in_display[name_color]", data.name_color);
		}

		if (data.voice_enabled !== undefined) {
			formData.append("check_in_display[voice_enabled]", data.voice_enabled.toString());
		}
		if (data.voice_type) {
			formData.append("check_in_display[voice_type]", data.voice_type);
		}
		if (data.welcome_text !== undefined) {
			formData.append("check_in_display[welcome_text]", data.welcome_text);
		}

		// Modes & Duration
		if (data.idle_mode) {
			formData.append("check_in_display[idle_mode]", data.idle_mode);
		}
		if (data.announcement_mode) {
			formData.append("check_in_display[announcement_mode]", data.announcement_mode);
		}
		if (data.announcement_duration) {
			formData.append("check_in_display[announcement_duration]", data.announcement_duration.toString());
		}

		// Seating Plan
		if (data.show_seating_plan !== undefined) {
			formData.append("check_in_display[show_seating_plan]", data.show_seating_plan.toString());
		}
		if (data.seating_plan_sidebar_position) {
			formData.append("check_in_display[seating_plan_sidebar_position]", data.seating_plan_sidebar_position);
		}
		if (data.seating_plan_duration) {
			formData.append("check_in_display[seating_plan_duration]", data.seating_plan_duration.toString());
		}
		if (data.active_plan_id !== undefined) {
			formData.append("check_in_display[active_plan_id]", data.active_plan_id ? data.active_plan_id.toString() : "");
		}
		if (data.seating_announcement_template) {
			formData.append("check_in_display[seating_announcement_template]", data.seating_announcement_template);
		}

		// // Photo Booth
		// if (data.photo_booth_enabled !== undefined) {
		// 	formData.append("check_in_display[photo_booth_enabled]", data.photo_booth_enabled.toString());
		// }
		// if (data.photo_booth_countdown !== undefined) {
		// 	formData.append("check_in_display[photo_booth_countdown]", data.photo_booth_countdown.toString());
		// }
		// if (data.photo_booth_webhook_url !== undefined) {
		// 	formData.append("check_in_display[photo_booth_webhook_url]", data.photo_booth_webhook_url);
		// }

		// Idle Assets
		if (data.background_image) {
			formData.append("check_in_display[background_image]", data.background_image);
		}
		if (data.remove_background_image) {
			formData.append("check_in_display[remove_background_image]", "true");
		}
		if (data.idle_video) {
			formData.append("check_in_display[idle_video]", data.idle_video);
		}
		if (data.remove_idle_video) {
			formData.append("check_in_display[remove_idle_video]", "true");
		}

		// Announcement Assets
		if (data.announcement_image) {
			formData.append("check_in_display[announcement_image]", data.announcement_image);
		}
		if (data.remove_announcement_image) {
			formData.append("check_in_display[remove_announcement_image]", "true");
		}
		if (data.announcement_video) {
			formData.append("check_in_display[announcement_video]", data.announcement_video);
		}
		if (data.remove_announcement_video) {
			formData.append("check_in_display[remove_announcement_video]", "true");
		}

		// // Photo Booth Assets
		// if (data.branding_frame) {
		// 	formData.append("check_in_display[branding_frame]", data.branding_frame);
		// }
		// if (data.remove_branding_frame) {
		// 	formData.append("check_in_display[remove_branding_frame]", "true");
		// }

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

/**
 * Announce a guest name on the welcome screen
 * POST /v1/events/:eventId/check_in_display/announce
 */
export async function announceGuest(
	eventId: string,
	name: string,
	customFieldsData?: Record<string, string>,
): Promise<AnnounceGuestResponse> {
	try {
		const response = await restClient.post<{ data: AnnounceGuestResponse }>(
			`v1/events/${eventId}/check_in_display/announce`,
			{ name, custom_fields_data: customFieldsData },
		);
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}
