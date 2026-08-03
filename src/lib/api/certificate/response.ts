// Backend API response types for the e-certificate feature

export type CertificateFieldType =
	| "attendee_name"
	| "event_title"
	| "date"
	| "static_text";

export type CertificateFieldFontStyle = "normal" | "bold" | "italic";
export type CertificateFieldAlign = "left" | "center" | "right";

// One placeable field on the certificate canvas. Coordinates are in canvas px,
// top-left origin (the shared contract with the backend Prawn renderer).
export type CertificateField = {
	id: string;
	type: CertificateFieldType;
	label: string;
	x: number;
	y: number;
	width: number;
	height: number;
	font_size: number;
	font_style: CertificateFieldFontStyle;
	color: string;
	align: CertificateFieldAlign;
	static_value?: string | null;
};

export type CertificateTemplateStatus = "draft" | "ready" | "archived";

export type CertificateTemplate = {
	id: number;
	event_id: number;
	status: CertificateTemplateStatus;
	orientation: "portrait" | "landscape";
	canvas_width: number;
	canvas_height: number;
	fields: CertificateField[];
	background_image_url: string | null;
	created_at: string;
	updated_at: string;
};

export type SendCertificatesResponse = {
	message: string;
	audience: "all" | "checked_in" | "unsent";
	queued: number;
	skipped_no_email: number;
};

// Per-participant row for the certificate participants table.
// certificate_status is null when no certificate has been sent yet; otherwise
// it mirrors the EmailDelivery status lifecycle.
export type CertificateDeliveryStatus =
	| "queued"
	| "sending"
	| "sent"
	| "delivered"
	| "failed"
	| "bounced"
	| "complained"
	| "suppressed";

export type CertificateParticipant = {
	public_id: string;
	attendee_name: string;
	attendee_email: string | null;
	ticket_type: string | null;
	checked_in: boolean;
	certificate_status: CertificateDeliveryStatus | null;
	certificate_sent_at: string | null;
	last_delivery_id: number | null;
};

export type SendOneCertificateResponse = {
	message: string;
	email_delivery_id: number;
};
