"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Eye, History, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingState } from "@/components/data-state";
import {
	problemReason,
	STATUS_LABELS,
} from "@/components/pages/event-email-status/email-status-labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import {
	deleteEmailBlast,
	duplicateEmailBlast,
	type EmailBlast,
	getEmailBlast,
	getEmailBlasts,
	previewEmailBlast,
} from "@/lib/api/email-blast";
import type { EmailStatus } from "@/lib/api/event-email-status";
import { groupDeliveryCounts } from "./delivery-stats";
import { EmailPreviewDialog } from "./email-preview-dialog";

const errorMessage = (e: unknown) =>
	e instanceof Error ? e.message : "Something went wrong";
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "");

function Stat({
	label,
	value,
	tone,
}: {
	label: string;
	value: number;
	tone?: string;
}) {
	return (
		<div className="border p-3">
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className={`font-semibold text-xl ${tone ?? ""}`}>{value}</p>
		</div>
	);
}

export function HistoryTab({
	eventId,
	onContinue,
}: {
	eventId: string;
	/** Opens a draft (continued, or copied from a sent email) in Compose. */
	onContinue: (draft: EmailBlast) => void;
}) {
	const queryClient = useQueryClient();
	const { openConfirm } = useConfirmDialog();
	const [openId, setOpenId] = useState<number | null>(null);
	const [previewHtml, setPreviewHtml] = useState<string | null>(null);

	const { data: blasts, isLoading } = useQuery({
		queryKey: ["email-blasts", eventId, "history"],
		queryFn: () => getEmailBlasts(eventId),
		// Delivery counts keep moving while a blast goes out.
		refetchInterval: 15000,
	});
	const { data: detail } = useQuery({
		queryKey: ["email-blasts", eventId, "detail", openId],
		queryFn: () => getEmailBlast(eventId, openId as number),
		enabled: openId !== null,
		refetchInterval: 15000,
	});

	const refresh = () =>
		queryClient.invalidateQueries({ queryKey: ["email-blasts", eventId] });
	const copy = useMutation({
		mutationFn: (id: number) => duplicateEmailBlast(eventId, id),
		onSuccess: (draft) => {
			setOpenId(null);
			onContinue(draft);
		},
		onError: (e) => toast.error(errorMessage(e)),
	});
	const remove = useMutation({
		mutationFn: (id: number) => deleteEmailBlast(eventId, id),
		onSuccess: refresh,
		onError: (e) => toast.error(errorMessage(e)),
	});
	const preview = useMutation({
		mutationFn: (id: number) => previewEmailBlast(eventId, id),
		onSuccess: (res) => setPreviewHtml(res.html),
		onError: (e) => toast.error(errorMessage(e)),
	});

	if (isLoading) return <LoadingState title="Loading history..." />;

	const drafts = (blasts ?? []).filter((b) => b.status === "draft");
	const sent = (blasts ?? []).filter((b) => b.status === "sending");

	if (drafts.length === 0 && sent.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 border border-dashed p-10 text-center">
				<History className="size-8 text-muted-foreground" />
				<p className="font-medium text-sm">Nothing sent yet</p>
				<p className="text-muted-foreground text-xs">
					Sent emails and their delivery results will appear here.
				</p>
			</div>
		);
	}

	const groups = detail ? groupDeliveryCounts(detail.delivery_counts) : null;

	return (
		<div className="space-y-8">
			{drafts.length > 0 && (
				<section className="space-y-2">
					<h3 className="font-medium text-sm">Drafts</h3>
					<div className="divide-y border">
						{drafts.map((d) => (
							<div
								key={d.id}
								className="flex items-center justify-between gap-3 p-3"
							>
								<div className="min-w-0">
									<p className="truncate text-sm">{d.subject}</p>
									<p className="text-muted-foreground text-xs">
										Edited {fmt(d.created_at)}
									</p>
								</div>
								<div className="flex shrink-0 gap-2">
									<Button
										size="sm"
										variant="outline"
										className="rounded-none"
										onClick={() => onContinue(d)}
									>
										Continue
									</Button>
									<Button
										size="icon-sm"
										variant="outline"
										className="rounded-none"
										aria-label="Delete draft"
										onClick={() =>
											openConfirm({
												title: "Delete draft",
												message: `Delete the draft "${d.subject}"?`,
												confirmLabel: "Delete",
												cancelLabel: "Cancel",
												type: "destructive",
												icon: "delete",
												onConfirm: () => remove.mutate(d.id),
											})
										}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			<section className="space-y-2">
				<h3 className="font-medium text-sm">Sent</h3>
				{sent.length === 0 ? (
					<p className="text-muted-foreground text-sm">No emails sent yet.</p>
				) : (
					<div className="overflow-x-auto border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Subject</TableHead>
									<TableHead>Sent</TableHead>
									<TableHead>By</TableHead>
									<TableHead className="text-right">Recipients</TableHead>
									<TableHead className="text-right">Delivered</TableHead>
									<TableHead className="text-right">Problems</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sent.map((b) => {
									const g = groupDeliveryCounts(b.delivery_counts);
									return (
										<TableRow
											key={b.id}
											className="cursor-pointer"
											onClick={() => setOpenId(b.id)}
										>
											<TableCell className="max-w-64 truncate font-medium">
												{b.subject}
											</TableCell>
											<TableCell className="whitespace-nowrap">
												{fmt(b.sent_at)}
											</TableCell>
											<TableCell>{b.sender_name ?? "—"}</TableCell>
											<TableCell className="text-right">
												{b.recipient_count}
											</TableCell>
											<TableCell className="text-right">
												{g.delivered}
											</TableCell>
											<TableCell
												className={`text-right ${g.problem ? "font-medium text-red-600" : ""}`}
											>
												{g.problem}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}
			</section>

			<Sheet open={openId !== null} onOpenChange={(o) => !o && setOpenId(null)}>
				<SheetContent className="w-full overflow-y-auto sm:max-w-xl">
					<SheetHeader>
						<SheetTitle>{detail?.subject ?? "Loading…"}</SheetTitle>
						<SheetDescription>
							{detail &&
								`Sent ${fmt(detail.sent_at)} by ${detail.sender_name ?? "—"}`}
						</SheetDescription>
					</SheetHeader>
					{detail && groups && (
						<div className="space-y-5 p-4">
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
								<Stat
									label="Delivered"
									value={groups.delivered}
									tone="text-emerald-600"
								/>
								<Stat label="Sent" value={groups.sent} />
								<Stat label="Pending" value={groups.pending} />
								<Stat
									label="Problems"
									value={groups.problem}
									tone={groups.problem ? "text-red-600" : ""}
								/>
							</div>
							<div className="flex flex-wrap gap-2">
								<Button
									size="sm"
									variant="outline"
									className="rounded-none"
									disabled={preview.isPending}
									onClick={() => preview.mutate(detail.id)}
								>
									{preview.isPending ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<Eye className="size-4" />
									)}
									View email
								</Button>
								<Button
									size="sm"
									variant="outline"
									className="rounded-none"
									disabled={copy.isPending}
									onClick={() => copy.mutate(detail.id)}
								>
									<Copy className="size-4" />
									Use as new draft
								</Button>
							</div>
							<div className="divide-y border">
								{(detail.recipients ?? []).map((r) => {
									const status = r.status as EmailStatus;
									const reason = problemReason(status, r.failure_reason);
									return (
										<div
											key={r.email}
											className="flex items-center justify-between gap-3 p-2.5 text-sm"
										>
											<div className="min-w-0">
												<p className="truncate">{r.email}</p>
												{reason && (
													<p className="text-red-600 text-xs">{reason}</p>
												)}
											</div>
											<Badge
												variant="secondary"
												className="shrink-0 rounded-none"
											>
												{STATUS_LABELS[status] ?? r.status}
											</Badge>
										</div>
									);
								})}
							</div>
							{(detail.recipient_count ?? 0) >
								(detail.recipients?.length ?? 0) && (
								<p className="text-muted-foreground text-xs">
									Showing the first {detail.recipients?.length}. The Email
									Status page lists every email.
								</p>
							)}
						</div>
					)}
				</SheetContent>
			</Sheet>

			<EmailPreviewDialog
				html={previewHtml}
				onClose={() => setPreviewHtml(null)}
			/>
		</div>
	);
}
