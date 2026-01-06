import { z } from "zod";

// Schema for getting received payments
export const getReceivedPaymentsSchema = z.object({
  eventId: z.union([z.string(), z.number()]),
});

// Request type
export type GetReceivedPaymentsRequest = z.infer<typeof getReceivedPaymentsSchema>;
