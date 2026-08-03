import { z } from "zod";

export const certificateFieldSchema = z.object({
	id: z.string(),
	type: z.enum(["attendee_name", "event_title", "date", "static_text"]),
	label: z.string(),
	x: z.number(),
	y: z.number(),
	width: z.number().positive(),
	height: z.number().positive(),
	font_size: z.number().positive(),
	font_style: z.enum(["normal", "bold", "italic"]).default("normal"),
	color: z.string().default("#000000"),
	align: z.enum(["left", "center", "right"]).default("center"),
	static_value: z.string().nullable().optional(),
});

export const upsertCertificateTemplateSchema = z.object({
	status: z.enum(["draft", "ready", "archived"]).optional(),
	orientation: z.enum(["portrait", "landscape"]).optional(),
	canvas_width: z.number().positive().optional(),
	canvas_height: z.number().positive().optional(),
	fields: z.array(certificateFieldSchema).optional(),
});

export const sendCertificatesSchema = z.object({
	audience: z.enum(["all", "checked_in", "unsent"]).default("all"),
	excluded_public_ids: z.array(z.string()).default([]),
});

export type CertificateFieldInput = z.infer<typeof certificateFieldSchema>;
export type UpsertCertificateTemplateRequest = z.infer<
	typeof upsertCertificateTemplateSchema
>;
export type SendCertificatesRequest = z.infer<typeof sendCertificatesSchema>;
