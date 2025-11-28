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
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Passwords don't match",
		path: ["password_confirmation"],
	});

export type RegisterInvitedVendorRequest = z.infer<
	typeof registerInvitedVendorSchema
>;
