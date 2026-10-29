export type EmailBlastStatus = "draft" | "sending" | "template";

export type EmailBlastFormat = "rich" | "html";

export interface EmailBlastAttachment {
	id: number;
	filename: string;
	byte_size: number;
}

export interface EmailBlastRecipient {
	email: string;
	status: string;
	failure_reason: string | null;
	sent_at: string | null;
}

export interface EmailBlast {
	id: number;
	name: string | null;
	subject: string;
	body: string;
	body_format: EmailBlastFormat;
	style_key: string;
	attachments: EmailBlastAttachment[];
	status: EmailBlastStatus;
	ticket_type_ids: number[];
	include_pending: boolean;
	banner_url: string | null;
	recipient_count: number | null;
	delivery_counts: Record<string, number>;
	sent_at: string | null;
	created_at: string;
	sender_name: string | null;
	/** Only on the single-blast (history detail) response. */
	recipients?: EmailBlastRecipient[];
}

export interface EmailBlastAudience {
	recipient_count: number;
	sender_name: string;
	sender_address: string;
}
