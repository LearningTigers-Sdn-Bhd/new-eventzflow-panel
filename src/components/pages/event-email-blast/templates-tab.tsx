"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import {
	deleteEmailBlast,
	duplicateEmailBlast,
	type EmailBlast,
	getEmailBlasts,
} from "@/lib/api/email-blast";

const errorMessage = (e: unknown) =>
	e instanceof Error ? e.message : "Something went wrong";

export function TemplatesTab({
	eventId,
	onUse,
}: {
	eventId: string;
	/** Receives the new draft made from the chosen template. */
	onUse: (draft: EmailBlast) => void;
}) {
	const queryClient = useQueryClient();
	const { openConfirm } = useConfirmDialog();
	const { data: templates, isLoading } = useQuery({
		queryKey: ["email-blasts", eventId, "template"],
		queryFn: () => getEmailBlasts(eventId, "template"),
	});

	const useTemplate = useMutation({
		mutationFn: (id: number) => duplicateEmailBlast(eventId, id),
		onSuccess: onUse,
		onError: (e) => toast.error(errorMessage(e)),
	});
	const remove = useMutation({
		mutationFn: (id: number) => deleteEmailBlast(eventId, id),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["email-blasts", eventId] }),
		onError: (e) => toast.error(errorMessage(e)),
	});

	const saved = !templates?.length ? (
		<div className="flex flex-col items-center justify-center gap-2 border border-dashed p-8 text-center">
			<Bookmark className="size-8 text-muted-foreground" />
			<p className="font-medium text-sm">No saved templates yet</p>
			<p className="text-muted-foreground text-xs">
				Write an email in the Compose tab and choose "Save as template" to reuse
				it later.
			</p>
		</div>
	) : (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{templates.map((t) => (
				<div key={t.id} className="flex flex-col gap-3 border p-4">
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-sm">{t.name}</p>
						<p className="truncate text-muted-foreground text-xs">
							Subject: {t.subject}
						</p>
						<p className="pt-1 text-muted-foreground text-xs">
							Saved {new Date(t.created_at).toLocaleDateString()}
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							size="sm"
							className="flex-1 rounded-none"
							disabled={useTemplate.isPending}
							onClick={() => useTemplate.mutate(t.id)}
						>
							Use template
						</Button>
						<Button
							size="icon-sm"
							variant="outline"
							className="rounded-none"
							aria-label={`Delete template ${t.name}`}
							onClick={() =>
								openConfirm({
									title: "Delete template",
									message: `Delete "${t.name}"? Emails already sent are not affected.`,
									confirmLabel: "Delete",
									cancelLabel: "Cancel",
									type: "destructive",
									icon: "delete",
									onConfirm: () => remove.mutate(t.id),
								})
							}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				</div>
			))}
		</div>
	);

	if (isLoading) return <LoadingState title="Loading templates..." />;
	return saved;
}
