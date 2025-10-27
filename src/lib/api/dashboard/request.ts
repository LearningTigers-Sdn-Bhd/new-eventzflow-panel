// Zod schemas for request validation (if any forms/mutations needed)
// Currently no form validation needed for dashboard - it's mostly read-only

// If we need any dashboard-related form validation in the future, add it here
// For example:
// export const dashboardFilterSchema = z.object({
//   dateRange: z.object({
//     from: z.date(),
//     to: z.date(),
//   }).optional(),
//   eventId: z.string().optional(),
// });

// export type DashboardFilterRequest = z.infer<typeof dashboardFilterSchema>;

// Export empty object to make this a proper module
export {};
