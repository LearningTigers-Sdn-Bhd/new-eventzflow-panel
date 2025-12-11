import { restClient, kyPublicClient } from "@/utils/rest-api";
import type {
	GenerateInviteLinkResponse,
	VerifyInviteTokenResponse,
	CheckAccountResponse,
	RegisterInvitedVendorResponse,
} from "./response";
import type { RegisterInvitedVendorRequest } from "./request";
import { registerInvitedVendorSchema } from "./request";

/**
 * Generate vendor invitation link for an event (organizer only)
 * @param eventId - The event ID
 * @param groupId - Optional group ID to auto-assign vendor to group on registration
 * @param organizerId - Optional organizer ID (for org_owner to specify which organizer)
 */
export async function generateVendorInviteLink(
	eventId: number,
	groupId?: number,
	organizerId?: string,
): Promise<GenerateInviteLinkResponse> {
	const body: Record<string, unknown> = {};
	if (groupId) {
		body.group_id = groupId;
	}
	if (organizerId) {
		body.organizer_id = organizerId;
	}
	return restClient.post<GenerateInviteLinkResponse>(
		`v1/events/${eventId}/vendor_invitations/generate_link`,
		body,
	);
}

/**
 * Verify vendor invitation token (public endpoint - optionally pass auth token to check assignment)
 */
export async function verifyVendorInviteToken(
	eventId: number,
	token: string,
	accessToken?: string,
): Promise<VerifyInviteTokenResponse> {
	const headers: Record<string, string> = {};
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	return kyPublicClient
		.get(
			`v1/events/${eventId}/vendor_invitations/verify?token=${encodeURIComponent(token)}`,
			{ headers },
		)
		.json<VerifyInviteTokenResponse>();
}

/**
 * Check if account exists by email or phone (public endpoint - no auth required)
 */
export async function checkVendorAccount(
	identifier: string,
): Promise<CheckAccountResponse> {
	const isEmail = identifier.includes("@");
	const param = isEmail
		? `email=${encodeURIComponent(identifier)}`
		: `phone=${encodeURIComponent(identifier)}`;

	return kyPublicClient
		.get(`v1/auth/check_account?${param}`)
		.json<CheckAccountResponse>();
}

/**
 * Register as vendor via invitation (public endpoint - no auth required)
 */
export async function registerInvitedVendor(
	data: RegisterInvitedVendorRequest,
): Promise<RegisterInvitedVendorResponse> {
	const validated = registerInvitedVendorSchema.parse(data);

	const payload: Record<string, unknown> = {
		token: validated.token,
		user: {
			full_name: validated.full_name,
			email: validated.email,
			phone: validated.phone,
			password: validated.password,
			password_confirmation: validated.password_confirmation,
		},
	};

	// Add vendor_profile if provided
	if (validated.vendor_profile) {
		const vendorProfile: Record<string, string> = {};
		if (validated.vendor_profile.description)
			vendorProfile.description = validated.vendor_profile.description;
		if (validated.vendor_profile.category)
			vendorProfile.category = validated.vendor_profile.category;
		if (validated.vendor_profile.person_in_charge)
			vendorProfile.person_in_charge = validated.vendor_profile.person_in_charge;
		if (validated.vendor_profile.address)
			vendorProfile.address = validated.vendor_profile.address;
		if (validated.vendor_profile.notes)
			vendorProfile.notes = validated.vendor_profile.notes;

		if (Object.keys(vendorProfile).length > 0) {
			payload.vendor_profile = vendorProfile;
		}
	}

	// Add event_vendor if provided
	if (validated.event_vendor) {
		const eventVendor: Record<string, string> = {};
		if (validated.event_vendor.redirect_url)
			eventVendor.redirect_url = validated.event_vendor.redirect_url;
		if (validated.event_vendor.poster_url)
			eventVendor.poster_url = validated.event_vendor.poster_url;
		if (validated.event_vendor.qr_url)
			eventVendor.qr_url = validated.event_vendor.qr_url;

		if (Object.keys(eventVendor).length > 0) {
			payload.event_vendor = eventVendor;
		}
	}

	// Add exhibitor_kit if provided (for exhibitor events)
	if (validated.exhibitor_kit) {
		const exhibitorKit: Record<string, string> = {};
		if (validated.exhibitor_kit.booth_number)
			exhibitorKit.booth_number = validated.exhibitor_kit.booth_number;
		if (validated.exhibitor_kit.booth_type)
			exhibitorKit.booth_type = validated.exhibitor_kit.booth_type;
		if (validated.exhibitor_kit.name_on_fascia)
			exhibitorKit.name_on_fascia = validated.exhibitor_kit.name_on_fascia;
		if (validated.exhibitor_kit.company_name)
			exhibitorKit.company_name = validated.exhibitor_kit.company_name;
		if (validated.exhibitor_kit.company_address)
			exhibitorKit.company_address = validated.exhibitor_kit.company_address;
		if (validated.exhibitor_kit.pic_full_name)
			exhibitorKit.pic_full_name = validated.exhibitor_kit.pic_full_name;
		if (validated.exhibitor_kit.pic_contact_number)
			exhibitorKit.pic_contact_number = validated.exhibitor_kit.pic_contact_number;
		if (validated.exhibitor_kit.pic_email_address)
			exhibitorKit.pic_email_address = validated.exhibitor_kit.pic_email_address;

		if (Object.keys(exhibitorKit).length > 0) {
			payload.exhibitor_kit = exhibitorKit;
		}
	}

	return kyPublicClient
		.post("v1/auth/register_invited_vendor", { json: payload })
		.json<RegisterInvitedVendorResponse>();
}
