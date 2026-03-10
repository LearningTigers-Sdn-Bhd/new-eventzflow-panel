import { z } from "zod";

const urlPattern = /^https?:\/\/.+/;

export const registerInvitedVendorSchema = z
	.object({
		token: z.string().min(1, "Token is required"),
		full_name: z.string().min(2, "Full name must be at least 2 characters"),
		email: z.string().email("Invalid email address"),
		phone: z.string().optional(),
		password: z.string().min(8, "Password must be at least 8 characters"),
		password_confirmation: z.string(),
		// Vendor profile fields
		vendor_profile: z
			.object({
				description: z.string().optional(),
				category: z.string().optional(),
				person_in_charge: z.string().optional(),
				address: z.string().optional(),
				notes: z.string().optional(),
				company_profile: z.string().optional(),
				image: z.instanceof(File).optional(),
			})
			.optional(),
		// Event vendor fields
		event_vendor: z
			.object({
				redirect_url: z
					.string()
					.regex(urlPattern, "Must be a valid URL")
					.optional()
					.or(z.literal("")),
				poster_url: z
					.string()
					.regex(urlPattern, "Must be a valid URL")
					.optional()
					.or(z.literal("")),
				qr_url: z
					.string()
					.regex(urlPattern, "Must be a valid URL")
					.optional()
					.or(z.literal("")),
			})
			.optional(),
		// Exhibitor kit fields (only for events with use_ticket = true)
		exhibitor_kit: z
			.object({
				booth_number: z.string().optional(),
				booth_type: z.string().optional(),
				booth_dimensions: z.string().optional(),
				side_wall_left_required: z.boolean().optional(),
				side_wall_right_required: z.boolean().optional(),
				name_on_fascia: z.string().max(25, "Max 25 characters").optional(),
				fascia_upgrade_required: z.boolean().optional(),
				company_name: z.string().optional(),
				company_address: z.string().optional(),
				pic_full_name: z.string().min(1, "PIC name is required"),
				pic_contact_number: z.string().min(1, "PIC contact is required"),
				pic_email_address: z
					.string()
					.email("Invalid email")
					.optional()
					.or(z.literal("")),
				exhibitor_team_members_attributes: z
					.array(z.object({ full_name: z.string() }))
					.optional(),
			})
			.optional(),
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Passwords don't match",
		path: ["password_confirmation"],
	});

export type RegisterInvitedVendorRequest = z.infer<
	typeof registerInvitedVendorSchema
>;
