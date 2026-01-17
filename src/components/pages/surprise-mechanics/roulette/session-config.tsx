/**
 * Configuration wrapper for Roulette session components
 * All directory-specific configuration is centralized here
 */

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import {
	createRouletteSession,
	deleteRouletteSession,
	updateRouletteSession,
} from "@/lib/api/roulette";
import type { RouletteSession } from "@/lib/api/roulette/response";
import { generateColumns as generateBaseColumns } from "../shared/components/draw-session-table-columns";
import { SessionActionMenu as BaseActionMenu } from "../shared/components/session-action-menu";
import { SessionCreateForm as BaseCreateForm } from "../shared/components/session-create-form";
import { SessionEditForm as BaseEditForm } from "../shared/components/session-edit-form";
import type { BaseSession } from "../shared/types";

// Configure table columns
export function generateColumns() {
	return generateBaseColumns<RouletteSession>({
		badgeColumn: {
			accessorKey: "is_multiple",
			header: "Multiple Winners",
			getValue: (session) => session.is_multiple,
			getLabel: (value) => (value ? "Allowed" : "Single only"),
			getColors: (value) =>
				value
					? { border: "border-green-500", text: "text-green-500" }
					: { border: "border-blue-500", text: "text-blue-500" },
		},
		ActionMenuComponent: ActionMenu,
	});
}

// Configure action menu
export function ActionMenu({ session }: { session: RouletteSession }) {
	return (
		<BaseActionMenu
			session={session}
			config={{
				routeBuilder: (eventId: string, sessionId: number) =>
					`/event/${eventId}/prize-roulette/session/${sessionId}`,
				editDialogTitle: "Edit Prize Roulette Session",
				editDialogDescription: "Update your prize roulette session settings",
				EditFormComponent: EditForm,
				deleteMessage:
					"All prizes and winners associated with this session will also be deleted.",
				deleteApiFunction: deleteRouletteSession,
				queryKey: (eventId: string) => ["roulette-sessions", eventId],
			}}
		/>
	);
}

// Configure create form
export function CreateForm() {
	return (
		<BaseCreateForm
			config={{
				apiFunction: createRouletteSession as unknown as (
					eventId: string,
					data: Record<string, unknown>,
				) => Promise<unknown>,
				queryKey: (eventId: string) => ["roulette-sessions", eventId],
				dialogTitle: "Create Prize Roulette Session",
				dialogDescription:
					"Set up a new prize roulette session with draw style and prize rules",
				titlePlaceholder: "e.g., Grand Prize Roulette 2024",
				additionalFields: [
					{
						type: "boolean",
						name: "is_multiple",
						label: "Allow Multiple Winners Per Prize",
						description:
							"When enabled, each prize can have multiple winners (up to its quantity).",
						defaultValue: false,
						// biome-ignore lint/suspicious/noExplicitAny: TanStack Form API requires any type
						onChangeCallback: (checked: boolean, form: any) => {
							if (!checked) {
								form.setFieldValue("draw_counts", 1);
							}
						},
					},
					{
						type: "number",
						name: "draw_counts",
						label: "Winners per Prize",
						description:
							"Specify how many winners can be drawn for each individual prize.",
						defaultValue: 1,
						renderCondition: (formValues) => formValues.is_multiple === true,
					},
				],
				drawType: "prizes",
				successMessage: "Roulette session created successfully",
			}}
		/>
	);
}

// Configure edit form
export function EditForm({ session }: { session: RouletteSession }) {
	return (
		<BaseEditForm
			session={session}
			config={{
				apiFunction: updateRouletteSession,
				queryKey: (eventId: string) => ["roulette-sessions", eventId],
				sessionQueryKey: (sessionId: number) => ["roulette-session", sessionId],
				dialogTitle: "Edit Prize Roulette Session",
				titlePlaceholder: "e.g., Grand Prize Roulette 2024",
				additionalFields: [
					{
						type: "boolean",
						name: "is_multiple",
						label: "Allow Multiple Winners Per Prize",
						description:
							"When enabled, each prize can have multiple winners (up to its quantity).",
						getValue: (session: BaseSession) =>
							(session as RouletteSession).is_multiple,
						// biome-ignore lint/suspicious/noExplicitAny: TanStack Form API requires any type
						onChangeCallback: (checked: boolean, form: any) => {
							if (!checked) {
								form.setFieldValue("draw_counts", 1);
							}
						},
					},
					{
						type: "number",
						name: "draw_counts",
						label: "Winners per Prize",
						description:
							"Specify how many winners can be drawn for each individual prize.",
						getValue: (session: BaseSession) =>
							(session as RouletteSession).draw_counts || 1,
					},
				],
				drawType: "prizes",
				successMessage: "Session updated successfully",
			}}
		/>
	);
}

// Configure create button
export function CreateButton() {
	const { openDialog } = useDialog();

	const openRouletteCreate = () => {
		openDialog({
			component: CreateForm,
			config: {
				title: "Create Prize Roulette Session",
				description:
					"Set up a new prize roulette session with draw style and prize rules",
				size: "full",
				showCloseButton: true,
			},
		});
	};

	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button
				variant="outline"
				onClick={openRouletteCreate}
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
