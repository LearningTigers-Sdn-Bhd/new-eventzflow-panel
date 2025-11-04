import { z } from "zod";

// Zod schemas for form validation and request data
export const importTicketsSchema = z.object({
	file: z.instanceof(File, { message: "File is required" }),
	dryRun: z.boolean().optional().default(false),
});

// Export types for form data
export type ImportTicketsRequest = z.infer<typeof importTicketsSchema>;
