import { createPublicRegistration } from "./endpoints";
import type { CreatedPublicRegistration } from "./types";

export interface GroupSubmissionRow {
	attendee_name: string;
	ok: boolean;
	data?: CreatedPublicRegistration;
	error?: string;
}

export interface GroupSubmissionSummary {
	rows: GroupSubmissionRow[];
	successCount: number;
	failedCount: number;
}

export function reduceGroupResults(
	rows: GroupSubmissionRow[],
): GroupSubmissionSummary {
	const successCount = rows.filter((row) => row.ok).length;
	const failedCount = rows.length - successCount;

	return {
		rows,
		successCount,
		failedCount,
	};
}

export async function submitGroupRegistrations(params: {
	eventSlug: string;
	ticketTypeId: number;
	role?: string;
	formSlug?: string;
	sharedCustomFields?: Record<string, string>;
	registeredByEmail?: string;
	attendees: Array<{
		attendee_name: string;
		attendee_email?: string;
		attendee_phone?: string;
		custom_fields_data?: Record<string, string>;
	}>;
	bundle?: string;
	concurrency?: number;
}) {
	const concurrency = params.concurrency ?? 3;
	const queue = [...params.attendees];
	const rows: GroupSubmissionRow[] = [];

	async function worker() {
		while (queue.length > 0) {
			const attendee = queue.shift();
			if (!attendee) {
				return;
			}

			try {
				const data = await createPublicRegistration(params.eventSlug, {
					attendee_name:
						attendee.attendee_name?.trim() || params.attendees[0].attendee_name,
					attendee_email:
						attendee.attendee_email?.trim() ||
						params.attendees[0].attendee_email,
					attendee_phone: attendee.attendee_phone,
					ticket_type_id: params.ticketTypeId,
					role: params.role,
					form_slug: params.formSlug,
					registered_by_email: params.registeredByEmail,
					...(params.bundle ? { bundle: params.bundle } : {}),
					custom_fields_data: {
						...(params.sharedCustomFields ?? {}),
						...(attendee.custom_fields_data ?? {}),
					},
				});

				rows.push({
					attendee_name: attendee.attendee_name,
					ok: true,
					data,
				});
			} catch (error: unknown) {
				rows.push({
					attendee_name: attendee.attendee_name,
					ok: false,
					error: error instanceof Error ? error.message : "Submission failed",
				});
			}
		}
	}

	await Promise.all(Array.from({ length: concurrency }).map(() => worker()));
	return reduceGroupResults(rows);
}
