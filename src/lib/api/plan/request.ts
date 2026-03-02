import { z } from "zod";

export const planObjectSchema = z.object({
  object_type: z.string(),
  layer: z.string().optional(),
  x: z.number(),
  y: z.number(),
  rotation: z.number().default(0),
  width: z.number(),
  height: z.number(),
  path: z.string().optional().nullable(),
  label: z.string().optional(),
  capacity: z.number().nullable().optional(),
  locked: z.boolean().default(false),
  z_index: z.number().default(0),
});

export type CreatePlanObjectRequest = z.infer<typeof planObjectSchema>;

export const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  canvas_width: z.number().min(0),
  canvas_height: z.number().min(0),
  pixels_per_unit: z.number().positive().default(20),
  public_enabled: z.boolean().default(false),
  settings_json: z.any().optional(),
  background_image: z.any().optional(),
});

export type CreatePlanRequest = z.infer<typeof planSchema>;
export type UpdatePlanRequest = Partial<CreatePlanRequest> & {
    background_image?: File | null;
};

export const assignmentSchema = z.object({
  ticket_id: z.number().optional(),
  visitor_id: z.number().optional(),
  plan_object_id: z.number(),
});

export type CreateAssignmentRequest = z.infer<typeof assignmentSchema>;
