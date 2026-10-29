import { restClient } from "@/utils/rest-api";
import type {
	EmailBlast,
	EmailBlastAudience,
	EmailBlastFormat,
	EmailBlastStatus,
} from "./response";

const base = (eventId: string) => `v1/events/${eventId}/email_blasts`;

export interface EmailBlastDraft {
	subject: string;
	body: string;
	ticketTypeIds: number[];
	includePending: boolean;
	banner?: File | null;
	bodyFormat: EmailBlastFormat;
	styleKey: string;
	/** Newly picked files; already-saved ones are kept unless listed in removeAttachmentIds. */
	attachments?: File[];
	removeAttachmentIds?: number[];
}

const toFormData = (draft: EmailBlastDraft) => {
	const form = new FormData();
	form.append("subject", draft.subject);
	form.append("body", draft.body);
	// An empty list must still reach the API so "all ticket types" can be restored.
	if (draft.ticketTypeIds.length === 0) form.append("ticket_type_ids[]", "");
	for (const id of draft.ticketTypeIds)
		form.append("ticket_type_ids[]", String(id));
	form.append("include_pending", String(draft.includePending));
	if (draft.banner) form.append("banner", draft.banner);
	form.append("body_format", draft.bodyFormat);
	form.append("style_key", draft.styleKey);
	for (const file of draft.attachments ?? [])
		form.append("attachments[]", file);
	for (const id of draft.removeAttachmentIds ?? [])
		form.append("remove_attachment_ids[]", String(id));
	return form;
};

export async function getEmailBlasts(
	eventId: string,
	status?: EmailBlastStatus,
): Promise<EmailBlast[]> {
	const res = await restClient.get<{ data: EmailBlast[] }>(
		`${base(eventId)}${status ? `?status=${status}` : ""}`,
	);
	return res.data;
}

export async function getEmailBlast(
	eventId: string,
	id: number,
): Promise<EmailBlast> {
	const res = await restClient.get<{ data: EmailBlast }>(
		`${base(eventId)}/${id}`,
	);
	return res.data;
}

/** A new draft from any blast, or a named template when `templateName` is given. */
export async function duplicateEmailBlast(
	eventId: string,
	id: number,
	templateName?: string,
): Promise<EmailBlast> {
	const res = await restClient.post<{ data: EmailBlast }>(
		`${base(eventId)}/${id}/duplicate`,
		templateName ? { template_name: templateName } : undefined,
	);
	return res.data;
}

export async function getEmailBlastAudience(
	eventId: string,
	ticketTypeIds: number[],
	includePending: boolean,
): Promise<EmailBlastAudience> {
	const query = [
		...ticketTypeIds.map((id) => `ticket_type_ids[]=${id}`),
		`include_pending=${includePending}`,
	].join("&");
	return restClient.get<EmailBlastAudience>(
		`${base(eventId)}/audience?${query}`,
	);
}

export async function createEmailBlast(
	eventId: string,
	draft: EmailBlastDraft,
): Promise<EmailBlast> {
	const res = await restClient.postFormData<{ data: EmailBlast }>(
		base(eventId),
		toFormData(draft),
	);
	return res.data;
}

export async function updateEmailBlast(
	eventId: string,
	id: number,
	draft: EmailBlastDraft,
): Promise<EmailBlast> {
	const res = await restClient.patchFormData<{ data: EmailBlast }>(
		`${base(eventId)}/${id}`,
		toFormData(draft),
	);
	return res.data;
}

export async function deleteEmailBlast(eventId: string, id: number) {
	await restClient.delete(`${base(eventId)}/${id}`);
}

export async function previewEmailBlast(
	eventId: string,
	id: number,
): Promise<{ html: string; subject: string }> {
	return restClient.get(`${base(eventId)}/${id}/preview`);
}

export async function testEmailBlast(
	eventId: string,
	id: number,
): Promise<{ message: string }> {
	return restClient.post(`${base(eventId)}/${id}/test`);
}

export async function deliverEmailBlast(
	eventId: string,
	id: number,
): Promise<EmailBlast> {
	const res = await restClient.post<{ data: EmailBlast }>(
		`${base(eventId)}/${id}/deliver`,
	);
	return res.data;
}

/** Renders unsaved edits (nothing is stored); used for the live preview. */
export async function previewEmailBlastDraft(
	eventId: string,
	draft: {
		draftId: number | null;
		subject: string;
		body: string;
		bodyFormat: EmailBlastFormat;
		styleKey: string;
	},
): Promise<{ html: string }> {
	return restClient.post(`${base(eventId)}/preview_draft`, {
		draft_id: draft.draftId,
		subject: draft.subject,
		body: draft.body,
		body_format: draft.bodyFormat,
		style_key: draft.styleKey,
	});
}
