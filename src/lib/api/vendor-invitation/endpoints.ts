import { kyPublicClient, kyPublicClientForFormData, restClient } from "@/utils/rest-api";
import type { RegisterInvitedVendorRequest } from "./request";
import { registerInvitedVendorSchema } from "./request";
import type {
	CheckAccountResponse,
	GenerateInviteLinkResponse,
	RegisterInvitedVendorResponse,
	VerifyInviteTokenResponse,
} from "./response";

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

	// Check if we have a file to upload (requires FormData)
	const hasImage = validated.vendor_profile?.image instanceof File;

	if (hasImage) {
		// Use FormData for file upload
		const formData = new FormData();

		formData.append("token", validated.token);
		formData.append("user[full_name]", validated.full_name);
		formData.append("user[email]", validated.email);
		if (validated.phone) formData.append("user[phone]", validated.phone);
		formData.append("user[password]", validated.password);
		formData.append(
			"user[password_confirmation]",
			validated.password_confirmation,
		);

		// Add vendor_profile fields
		if (validated.vendor_profile) {
			if (validated.vendor_profile.description)
				formData.append(
					"vendor_profile[description]",
					validated.vendor_profile.description,
				);
			if (validated.vendor_profile.category)
				formData.append(
					"vendor_profile[category]",
					validated.vendor_profile.category,
				);
			if (validated.vendor_profile.person_in_charge)
				formData.append(
					"vendor_profile[person_in_charge]",
					validated.vendor_profile.person_in_charge,
				);
			if (validated.vendor_profile.address)
				formData.append(
					"vendor_profile[address]",
					validated.vendor_profile.address,
				);
			if (validated.vendor_profile.notes)
				formData.append(
					"vendor_profile[notes]",
					validated.vendor_profile.notes,
				);
			if (validated.vendor_profile.company_profile)
				formData.append(
					"vendor_profile[company_profile]",
					validated.vendor_profile.company_profile,
				);
			if (validated.vendor_profile.image)
				formData.append("vendor_profile[image]", validated.vendor_profile.image);
		}

		// Add event_vendor fields
		if (validated.event_vendor) {
			if (validated.event_vendor.redirect_url)
				formData.append(
					"event_vendor[redirect_url]",
					validated.event_vendor.redirect_url,
				);
			if (validated.event_vendor.poster_url)
				formData.append(
					"event_vendor[poster_url]",
					validated.event_vendor.poster_url,
				);
			if (validated.event_vendor.qr_url)
				formData.append("event_vendor[qr_url]", validated.event_vendor.qr_url);
		}

		// Add exhibitor_kit fields
		if (validated.exhibitor_kit) {
			if (validated.exhibitor_kit.booth_number)
				formData.append(
					"exhibitor_kit[booth_number]",
					validated.exhibitor_kit.booth_number,
				);
			if (validated.exhibitor_kit.booth_type)
				formData.append(
					"exhibitor_kit[booth_type]",
					validated.exhibitor_kit.booth_type,
				);
			if (validated.exhibitor_kit.booth_dimensions)
				formData.append(
					"exhibitor_kit[booth_dimensions]",
					validated.exhibitor_kit.booth_dimensions,
				);
			if (validated.exhibitor_kit.side_wall_left_required !== undefined)
				formData.append(
					"exhibitor_kit[side_wall_left_required]",
					String(validated.exhibitor_kit.side_wall_left_required),
				);
			if (validated.exhibitor_kit.side_wall_right_required !== undefined)
				formData.append(
					"exhibitor_kit[side_wall_right_required]",
					String(validated.exhibitor_kit.side_wall_right_required),
				);
			if (validated.exhibitor_kit.name_on_fascia)
				formData.append(
					"exhibitor_kit[name_on_fascia]",
					validated.exhibitor_kit.name_on_fascia,
				);
			if (validated.exhibitor_kit.fascia_upgrade_required !== undefined)
				formData.append(
					"exhibitor_kit[fascia_upgrade_required]",
					String(validated.exhibitor_kit.fascia_upgrade_required),
				);
			if (validated.exhibitor_kit.company_name)
				formData.append(
					"exhibitor_kit[company_name]",
					validated.exhibitor_kit.company_name,
				);
			if (validated.exhibitor_kit.company_address)
				formData.append(
					"exhibitor_kit[company_address]",
					validated.exhibitor_kit.company_address,
				);
			if (validated.exhibitor_kit.pic_full_name)
				formData.append(
					"exhibitor_kit[pic_full_name]",
					validated.exhibitor_kit.pic_full_name,
				);
			if (validated.exhibitor_kit.pic_contact_number)
				formData.append(
					"exhibitor_kit[pic_contact_number]",
					validated.exhibitor_kit.pic_contact_number,
				);
			if (validated.exhibitor_kit.pic_email_address)
				formData.append(
					"exhibitor_kit[pic_email_address]",
					validated.exhibitor_kit.pic_email_address,
				);
			// Add team members as nested attributes
			if (validated.exhibitor_kit.exhibitor_team_members_attributes) {
				validated.exhibitor_kit.exhibitor_team_members_attributes.forEach(
					(member, index) => {
						formData.append(
							`exhibitor_kit[exhibitor_team_members_attributes][${index}][full_name]`,
							member.full_name,
						);
					},
				);
			}
		}

			return kyPublicClientForFormData
			.post("v1/auth/register_invited_vendor", { body: formData })
			.json<RegisterInvitedVendorResponse>();
	}

	// No image - use JSON payload
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
			vendorProfile.person_in_charge =
				validated.vendor_profile.person_in_charge;
		if (validated.vendor_profile.address)
			vendorProfile.address = validated.vendor_profile.address;
		if (validated.vendor_profile.notes)
			vendorProfile.notes = validated.vendor_profile.notes;
		if (validated.vendor_profile.company_profile)
			vendorProfile.company_profile =
				validated.vendor_profile.company_profile;

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
		const exhibitorKit: Record<string, string | boolean> = {};
		if (validated.exhibitor_kit.booth_number)
			exhibitorKit.booth_number = validated.exhibitor_kit.booth_number;
		if (validated.exhibitor_kit.booth_type)
			exhibitorKit.booth_type = validated.exhibitor_kit.booth_type;
		if (validated.exhibitor_kit.booth_dimensions)
			exhibitorKit.booth_dimensions = validated.exhibitor_kit.booth_dimensions;
		if (validated.exhibitor_kit.side_wall_left_required !== undefined)
			exhibitorKit.side_wall_left_required = validated.exhibitor_kit.side_wall_left_required;
		if (validated.exhibitor_kit.side_wall_right_required !== undefined)
			exhibitorKit.side_wall_right_required = validated.exhibitor_kit.side_wall_right_required;
		if (validated.exhibitor_kit.name_on_fascia)
			exhibitorKit.name_on_fascia = validated.exhibitor_kit.name_on_fascia;
		if (validated.exhibitor_kit.fascia_upgrade_required !== undefined)
			exhibitorKit.fascia_upgrade_required = validated.exhibitor_kit.fascia_upgrade_required;
		if (validated.exhibitor_kit.company_name)
			exhibitorKit.company_name = validated.exhibitor_kit.company_name;
		if (validated.exhibitor_kit.company_address)
			exhibitorKit.company_address = validated.exhibitor_kit.company_address;
		if (validated.exhibitor_kit.pic_full_name)
			exhibitorKit.pic_full_name = validated.exhibitor_kit.pic_full_name;
		if (validated.exhibitor_kit.pic_contact_number)
			exhibitorKit.pic_contact_number =
				validated.exhibitor_kit.pic_contact_number;
		if (validated.exhibitor_kit.pic_email_address)
			exhibitorKit.pic_email_address =
				validated.exhibitor_kit.pic_email_address;

		if (Object.keys(exhibitorKit).length > 0) {
			payload.exhibitor_kit = exhibitorKit;
		}
	}

	return kyPublicClient
		.post("v1/auth/register_invited_vendor", { json: payload })
		.json<RegisterInvitedVendorResponse>();
}
