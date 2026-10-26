/**
 * Configuration wrapper for Lucky Draw session components
 * All directory-specific configuration is centralized here
 */

import { Pencil, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import {
	createLuckyDrawSession,
	deleteLuckyDrawSession,
	updateLuckyDrawSession,
} from "@/lib/api/lucky-draw";
import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import { generateColumns as generateBaseColumns } from "../shared/components/draw-session-table-columns";
import { SessionActionMenu as BaseActionMenu } from "../shared/components/session-action-menu";
import { SessionCreateForm as BaseCreateForm } from "../shared/components/session-create-form";
import { SessionEditForm as BaseEditForm } from "../shared/components/session-edit-form";
import type { BaseSession } from "../shared/types";
import { EntryScanner } from "./entry/entry-scanner";

const ENTRY_SCAN_ON = (values: Record<string, unknown>) =>
	values.entry_scan === true;

const SCANNED_ONLY_ON = (values: Record<string, unknown>) =>
	values.scanned_only === true && !ENTRY_SCAN_ON(values);

const SCANNED_ONLY_VISIBLE = (values: Record<string, unknown>) =>
	!ENTRY_SCAN_ON(values);

// entry_scan is a form-only switch: on = pool is people scanned into this draw
// (scanned_source "entries"), off = the regular scanned-only settings apply.
function withEntryScan<T extends Record<string, unknown>>(data: T) {
	const { entry_scan, ...rest } = data;
	return entry_scan
		? { ...rest, scanned_only: true, scanned_source: "entries" as const }
		: rest;
}

const entryScanField = {
	type: "boolean" as const,
	name: "entry_scan",
	label: "Require Lucky Draw Entry Scan",
	description:
		"Only people scanned into this draw can win. Staff scan each ticket QR using Scan Participants in the session menu",
};

// A number setting normally only shows with gifts on; this one works either way.
const winnersPerDrawField = {
	type: "number" as const,
	name: "winners_per_draw",
	label: "Winners per draw",
	description:
		"How many winners one click of Draw picks (1 to 200). Use 1 for the classic one-by-one draw. With gifts on, a draw never goes past the gift's open slots. Not used when drawing a round",
	max: 200,
	renderCondition: () => true,
};

const GIFTS_ON = (values: Record<string, unknown>) => values.use_gifts === true;

const giftPickField = {
	type: "select" as const,
	name: "gift_pick",
	label: "Gift order",
	description:
		"In order: follows the gift list, top gift first. Random: picks a random gift that still has a slot each draw. Tick Draw last on a gift (like the grand prize) to hold it until the rest are done",
	options: [
		{ value: "in_order", label: "In order (gift list)" },
		{ value: "random", label: "Random" },
	],
	renderCondition: GIFTS_ON,
};

const roundSweepField = {
	type: "boolean" as const,
	name: "round_sweep",
	label: "Draw a round: one winner for every gift",
	description:
		"Off: a click fills one gift at a time (uses Winners per draw). On: each click gives every gift that still has a slot one winner, and the next click is the next round. A gift needing 2 winners joins 2 rounds. Winners per draw is not used",
	renderCondition: GIFTS_ON,
};

const excludedTicketTypesField = {
	type: "ticket-types" as const,
	name: "excluded_ticket_type_ids",
	label: "Exclude ticket types",
	description:
		"Tickets of these types are left out of the draw and can never win. Leave empty to include every ticket type",
};

const SCANNED_SOURCE_OPTIONS = [
	{ value: "ticket", label: "Ticket check-in (first scan)" },
	{ value: "scan_log", label: "Scan log (every scan)" },
];

const SCANNED_SOURCE_HELP =
	"Applies when a day range is set. Ticket check-in uses each guest's first scan. Scan log counts every scan, so returning guests count on each day they came, but imported check-ins are not included.";

// Configure table columns
export function generateColumns() {
	return generateBaseColumns<LuckyDrawSession>({
		badgeColumn: {
			accessorKey: "use_gifts",
			header: "Uses Gifts",
			getValue: (session) => session.use_gifts,
			getLabel: (value) => (value ? "Yes" : "No"),
			getColors: (value) =>
				value
					? { border: "border-green-500", text: "text-green-500" }
					: { border: "border-red-500", text: "text-red-500" },
		},
		ActionMenuComponent: ActionMenu,
	});
}

// Configure action menu
export function ActionMenu({ session }: { session: LuckyDrawSession }) {
	const { openDialog } = useDialog();

	return (
		<BaseActionMenu
			session={session}
			config={{
				extraActions: [
					{
						label: "Scan Participants",
						icon: ScanLine,
						show: (s) => s.scanned_source === "entries",
						onSelect: (s) =>
							openDialog({
								component: EntryScanner,
								props: { eventId: String(s.event_id), sessionId: s.id },
								config: {
									title: "Scan Participants",
									description: `Scan a ticket QR to enter someone into "${s.title}"`,
									size: "md",
									showCloseButton: true,
								},
							}),
					},
				],
				routeBuilder: (eventId: string, sessionId: number) =>
					`/event/${eventId}/lucky-draw/session/${sessionId}`,
				editDialogTitle: "Edit Lucky Draw Session",
				editDialogDescription: "Update your lucky draw session settings",
				EditFormComponent: EditForm,
				deleteMessage:
					"All gifts and invalid participants associated with this session will also be deleted.",
				deleteApiFunction: deleteLuckyDrawSession,
				queryKey: (eventId: string) => ["lucky-draw-sessions", eventId],
			}}
		/>
	);
}

// Configure create form
export function CreateForm() {
	return (
		<BaseCreateForm
			config={{
				apiFunction: ((eventId: string, data: Record<string, unknown>) =>
					createLuckyDrawSession(
						eventId,
						withEntryScan(data) as unknown as Parameters<
							typeof createLuckyDrawSession
						>[1],
					)) as unknown as (
					eventId: string,
					data: Record<string, unknown>,
				) => Promise<unknown>,
				queryKey: (eventId: string) => ["lucky-draw-sessions", eventId],
				dialogTitle: "Create Lucky Draw Session",
				dialogDescription:
					"Set up a new lucky draw session with custom settings",
				titlePlaceholder: "e.g., Grand Prize Draw 2024",
				additionalFields: [
					{
						type: "boolean",
						name: "use_gifts",
						label: "Enable Gift System",
						description: "Allow winners to receive gift items",
						defaultValue: false,
					},
					{ ...winnersPerDrawField, defaultValue: 1 },
					{ ...giftPickField, defaultValue: "in_order" },
					{ ...roundSweepField, defaultValue: false },
					{ ...excludedTicketTypesField, defaultValue: [] },
					{ ...entryScanField, defaultValue: false },
					{
						type: "boolean",
						name: "scanned_only",
						label: "Scanned Only (Filtered Pick Pool)",
						description:
							"Only participants who have been scanned (checked in) can be drawn",
						defaultValue: false,
						renderCondition: SCANNED_ONLY_VISIBLE,
					},
					{
						type: "select",
						name: "scanned_source",
						label: "Count scans from",
						description: SCANNED_SOURCE_HELP,
						options: SCANNED_SOURCE_OPTIONS,
						defaultValue: "ticket",
						renderCondition: SCANNED_ONLY_ON,
					},
					{
						type: "event-day",
						name: "scanned_from",
						label: "Scanned from",
						description: "Earliest event day. Any day if empty",
						defaultValue: "",
						renderCondition: SCANNED_ONLY_ON,
					},
					{
						type: "event-day",
						name: "scanned_to",
						label: "Scanned until",
						description: "Latest event day. Any day if empty",
						defaultValue: "",
						renderCondition: SCANNED_ONLY_ON,
					},
				],
				successMessage: "Session created successfully",
			}}
		/>
	);
}

// Configure edit form
export function EditForm({ session }: { session: LuckyDrawSession }) {
	return (
		<BaseEditForm
			session={session}
			config={{
				apiFunction: (
					eventId: string,
					sessionId: number,
					data: Record<string, unknown>,
				) =>
					updateLuckyDrawSession(
						eventId,
						sessionId,
						withEntryScan(data) as unknown as Parameters<
							typeof updateLuckyDrawSession
						>[2],
					),
				queryKey: (eventId: string) => ["lucky-draw-sessions", eventId],
				sessionQueryKey: (sessionId: number) => [
					"lucky-draw-session",
					sessionId,
				],
				dialogTitle: "Edit Lucky Draw Session",
				titlePlaceholder: "e.g., Grand Prize Draw 2024",
				additionalFields: [
					{
						type: "boolean",
						name: "use_gifts",
						label: "Enable Gift System",
						description: "Allow winners to receive gift items",
						getValue: (session: BaseSession) =>
							(session as LuckyDrawSession).use_gifts,
					},
					{
						...winnersPerDrawField,
						getValue: (session: BaseSession) =>
							(session as LuckyDrawSession).winners_per_draw ?? 1,
					},
					{
						...giftPickField,
						getValue: (session: BaseSession) =>
							(session as LuckyDrawSession).gift_pick ?? "in_order",
					},
					{
						...roundSweepField,
						getValue: (session: BaseSession) =>
							(session as LuckyDrawSession).round_sweep ?? false,
					},
					{
						...excludedTicketTypesField,
						getValue: (session: BaseSession) =>
							(session as LuckyDrawSession).excluded_ticket_type_ids?.map(
								String,
							) ?? [],
					},
					{
						...entryScanField,
						getValue: (session: BaseSession) =>
							(session as LuckyDrawSession).scanned_source === "entries",
					},
					{
						type: "boolean",
						name: "scanned_only",
						label: "Scanned Only (Filtered Pick Pool)",
						description:
							"Only participants who have been scanned (checked in) can be drawn",
						// entries source forces scanned_only on, so it isn't the user's own choice
						getValue: (session: BaseSession) =>
							(session as LuckyDrawSession).scanned_source !== "entries" &&
							(session as LuckyDrawSession).scanned_only,
						renderCondition: SCANNED_ONLY_VISIBLE,
					},
					{
						type: "select",
						name: "scanned_source",
						label: "Count scans from",
						description: SCANNED_SOURCE_HELP,
						options: SCANNED_SOURCE_OPTIONS,
						getValue: (session: BaseSession) =>
							(session as LuckyDrawSession).scanned_source === "scan_log"
								? "scan_log"
								: "ticket",
						renderCondition: SCANNED_ONLY_ON,
					},
					{
						type: "event-day",
						name: "scanned_from",
						label: "Scanned from",
						description: "Earliest event day. Any day if empty",
						getValue: (session: BaseSession) =>
							(session as LuckyDrawSession).scanned_from ?? "",
						renderCondition: SCANNED_ONLY_ON,
					},
					{
						type: "event-day",
						name: "scanned_to",
						label: "Scanned until",
						description: "Latest event day. Any day if empty",
						getValue: (session: BaseSession) =>
							(session as LuckyDrawSession).scanned_to ?? "",
						renderCondition: SCANNED_ONLY_ON,
					},
				],
				successMessage: "Session updated successfully",
			}}
		/>
	);
}

// Configure create button
export function CreateButton() {
	const { openDialog } = useDialog();

	const openLuckyDrawCreate = () => {
		openDialog({
			component: CreateForm,
			config: {
				title: "Create Lucky Draw Session",
				description: "Set up a new lucky draw session with custom settings",
				size: "full",
				showCloseButton: true,
			},
		});
	};

	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button
				variant="outline"
				onClick={openLuckyDrawCreate}
				className="w-full rounded-none lg:w-auto"
			>
				<Pencil className="h-4 w-4" />
				Create Session
			</Button>
		</div>
	);
}

// Re-export SessionItem from session-item.tsx
export { SessionItem } from "./session-item";
