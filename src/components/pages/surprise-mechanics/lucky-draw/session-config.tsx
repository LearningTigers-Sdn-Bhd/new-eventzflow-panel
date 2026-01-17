/**
 * Configuration wrapper for Lucky Draw session components
 * All directory-specific configuration is centralized here
 */

import { Pencil } from "lucide-react";
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
	return (
		<BaseActionMenu
			session={session}
			config={{
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
				apiFunction: createLuckyDrawSession as unknown as (
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
				apiFunction: updateLuckyDrawSession,
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
