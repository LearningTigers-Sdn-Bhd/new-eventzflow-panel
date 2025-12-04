import { z } from "zod";

// Zod schemas for form validation and request data
export const assignContractorSchema = z.object({
	exhibition_contractor_profile_id: z
		.number()
		.min(1, "Contractor profile is required"),
});

// Export types for form data
export type AssignContractorRequest = z.infer<typeof assignContractorSchema>;
