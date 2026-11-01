"use client";

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { Link2, Mail, PartyPopper, QrCode } from "lucide-react";
import { useState } from "react";
import QRCodeSVG from "react-qr-code";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import type { FeedbackFilters } from "@/lib/api/feedback-form";
import {
	getFeedbackExhibitorShortLink,
	getFeedbackNonResponders,
	sendFeedbackReminders,
} from "@/lib/api/feedback-form";
import { filtersKey } from "./filters";
import { SimplePager } from "./pager";
import { SearchInput } from "./search-input";

/** Checked-in attendees who have not responded yet, with reminders. */
export function FeedbackNonRespondersTab({
	eventId,
	filters,
}: {
	eventId: string;
	filters: FeedbackFilters;
}) {
	const queryClient = useQueryClient();
	const exhibitor = filters.audience === "exhibitor";
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [confirmAll, setConfirmAll] = useState(false);

	// Responses and non-responders share filters; date filters don't apply to who is outstanding.
	const listFilters = { ...filters, from: "", to: "" };
	const { data, isLoading, isError } = useQuery({
		queryKey: [
			"event",
			eventId,
			"feedback-non-responders",
			page,
			debouncedSearch,
			...filtersKey(listFilters),
		],
		queryFn: () =>
			getFeedbackNonResponders(eventId, {
				page,
				search: debouncedSearch,
				filters: listFilters,
			}),
		placeholderData: keepPreviousData,
	});

	// Short personal link to pass on by hand (WhatsApp etc); exhibitor form only.
	const copyLink = useMutation({
		mutationFn: (row: { public_id: string }) =>
			getFeedbackExhibitorShortLink(eventId, row.public_id),
		onSuccess: async (url) => {
			await navigator.clipboard.writeText(url);
			toast.success("Feedback link copied");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	// Same short link, shown as a QR so the vendor can scan it from the screen.
	const [qr, setQr] = useState<{ url: string; name: string } | null>(null);
	const showQr = useMutation({
		mutationFn: async (row: {
			public_id: string;
			attendee_name?: string | null;
		}) => ({
			url: await getFeedbackExhibitorShortLink(eventId, row.public_id),
			name: row.attendee_name || "Feedback form",
		}),
		onSuccess: setQr,
		onError: (error: Error) => toast.error(error.message),
	});

	const remind = useMutation({
		mutationFn: (target: { ticketIds: string[] } | { all: true }) =>
			sendFeedbackReminders(eventId, target, listFilters),
		onSuccess: (result) => {
			const parts = [`Reminder queued for ${result.queued}`];
			if (result.skipped > 0) {
				parts.push(
					`${result.skipped} skipped (already emailed in the last 24 hours)`,
				);
			}
			toast.success(parts.join(", "));
			setSelected(new Set());
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "feedback-non-responders"],
			});
		},
		onError: (error: Error) => toast.error(error.message),
	});

	if (isError) return <ErrorState title="Unable to load attendees" />;

	const rows = data?.data ?? [];
	const total = data?.pagination.total_count ?? 0;
	const allOnPage =
		rows.length > 0 && rows.every((r) => selected.has(r.public_id));

	const toggle = (id: string, on: boolean) =>
		setSelected((prev) => {
			const next = new Set(prev);
			if (on) next.add(id);
			else next.delete(id);
			return next;
		});

	const actions = (row: (typeof rows)[number], large = false) => {
		const size = large ? "default" : "sm";
		const cls = "rounded-none";
		// Mobile: Show QR leads, the other two shrink to 40px icon buttons.
		const iconCls = large ? "size-10 shrink-0 rounded-none px-0" : cls;
		return (
			<>
				{exhibitor && (
					<>
						<Button
							type="button"
							variant="outline"
							size={size}
							className={large ? `${cls} h-10 flex-1` : cls}
							disabled={showQr.isPending}
							onClick={() => showQr.mutate(row)}
						>
							<QrCode className="size-4" />
							Show QR
						</Button>
						<Button
							type="button"
							variant="outline"
							size={size}
							className={iconCls}
							aria-label="Copy link"
							disabled={copyLink.isPending}
							onClick={() => copyLink.mutate(row)}
						>
							<Link2 className="size-4" />
							{!large && "Copy link"}
						</Button>
					</>
				)}
				<Button
					type="button"
					variant="outline"
					size={size}
					className={iconCls}
					aria-label="Send reminder"
					disabled={!row.attendee_email || remind.isPending}
					onClick={() => remind.mutate({ ticketIds: [row.public_id] })}
				>
					<Mail className="size-4" />
					{!large && "Send reminder"}
				</Button>
			</>
		);
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-3 border border-dashed bg-accent/40 p-3 sm:p-4">
				<div className="min-w-56 flex-1">
					<SearchInput
						value={search}
						onChange={(value) => {
							setSearch(value);
							setPage(1);
						}}
						placeholder="Search attendees..."
					/>
				</div>
				<Button
					type="button"
					variant="outline"
					className="rounded-none"
					disabled={selected.size === 0 || remind.isPending}
					onClick={() => remind.mutate({ ticketIds: [...selected] })}
				>
					<Mail className="size-4" />
					Remind selected ({selected.size})
				</Button>
				<Button
					type="button"
					className="rounded-none"
					disabled={total === 0 || remind.isPending}
					onClick={() => setConfirmAll(true)}
				>
					<Mail className="size-4" />
					Remind everyone ({total})
				</Button>
			</div>

			{isLoading && !data ? (
				<LoadingState
					title="Loading attendees..."
					description="Please wait while we find who has not responded."
				/>
			) : rows.length === 0 ? (
				<section className="space-y-2 border border-dashed p-8 text-center">
					<PartyPopper className="mx-auto size-8 text-muted-foreground" />
					<h2 className="font-medium">
						{debouncedSearch.trim()
							? "No matching attendees"
							: "Everyone has responded"}
					</h2>
					<p className="text-muted-foreground text-sm">
						{debouncedSearch.trim()
							? "Try a different name or email."
							: exhibitor
								? "Every exhibitor company has given feedback."
								: "No checked-in attendee is waiting to give feedback."}
					</p>
				</section>
			) : (
				<>
					<div className="overflow-x-auto border border-dashed">
						<table className="w-full text-left text-sm">
							<thead className="border-b bg-muted/50 text-muted-foreground">
								<tr>
									<th className="w-10 px-3 py-2.5">
										<Checkbox
											aria-label="Select everyone on this page"
											checked={allOnPage}
											onCheckedChange={(v) =>
												setSelected((prev) => {
													const next = new Set(prev);
													for (const r of rows) {
														if (v === true) next.add(r.public_id);
														else next.delete(r.public_id);
													}
													return next;
												})
											}
										/>
									</th>
									<th className="px-3 py-2.5 font-medium">
										{exhibitor ? "Company" : "Attendee"}
									</th>
									<th className="hidden px-3 py-2.5 font-medium md:table-cell">
										{exhibitor ? "Booths" : "Ticket type"}
									</th>
									{!exhibitor && (
										<th className="hidden px-3 py-2.5 font-medium md:table-cell">
											Checked in
										</th>
									)}
									<th className="hidden px-3 py-2.5 font-medium md:table-cell">
										Last emailed
									</th>
									<th className="hidden px-3 py-2.5 md:table-cell" />
								</tr>
							</thead>
							<tbody>
								{rows.map((row) => (
									<tr key={row.public_id} className="border-b last:border-b-0">
										<td className="px-3 py-2.5">
											<Checkbox
												aria-label={`Select ${row.attendee_name ?? row.attendee_email}`}
												checked={selected.has(row.public_id)}
												onCheckedChange={(v) =>
													toggle(row.public_id, v === true)
												}
											/>
										</td>
										<td className="px-3 py-2.5">
											<p className="font-medium">{row.attendee_name || "—"}</p>
											<p className="text-muted-foreground text-xs">
												{row.attendee_email || "No email"}
											</p>
											<p className="mt-1 text-muted-foreground text-xs md:hidden">
												{[
													exhibitor ? row.booth_numbers : row.ticket_type_name,
													row.last_emailed_at
														? `Emailed ${new Date(row.last_emailed_at).toLocaleDateString()}`
														: "Never emailed",
												]
													.filter(Boolean)
													.join(" · ")}
											</p>
											<div className="mt-3 flex md:hidden [&>*:not(:first-child)]:-ml-px">
												{actions(row, true)}
											</div>
										</td>
										<td className="hidden px-3 py-2.5 md:table-cell">
											{(exhibitor ? row.booth_numbers : row.ticket_type_name) ||
												"—"}
										</td>
										{!exhibitor && (
											<td className="hidden px-3 py-2.5 text-muted-foreground md:table-cell">
												{row.checked_in_at
													? new Date(row.checked_in_at).toLocaleString()
													: "—"}
											</td>
										)}
										<td className="hidden px-3 py-2.5 text-muted-foreground md:table-cell">
											{row.last_emailed_at
												? new Date(row.last_emailed_at).toLocaleDateString()
												: "Never"}
										</td>
										<td className="hidden px-3 py-2.5 md:table-cell">
											<div className="flex justify-end gap-2">
												{actions(row)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					{data && (
						<SimplePager pagination={data.pagination} onPage={setPage} />
					)}
				</>
			)}

			<Dialog open={!!qr} onOpenChange={(open) => !open && setQr(null)}>
				<DialogContent className="rounded-none sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>{qr?.name}</DialogTitle>
						<DialogDescription>
							Scan to open the feedback form.
						</DialogDescription>
					</DialogHeader>
					{qr && (
						<div className="mx-auto border bg-white p-4">
							<QRCodeSVG value={qr.url} size={240} level="M" />
						</div>
					)}
				</DialogContent>
			</Dialog>

			<AlertDialog open={confirmAll} onOpenChange={setConfirmAll}>
				<AlertDialogContent className="rounded-none">
					<AlertDialogHeader>
						<AlertDialogTitle>Remind everyone outstanding?</AlertDialogTitle>
						<AlertDialogDescription>
							This re-sends the thank-you email, with the feedback link, to{" "}
							{total} {exhibitor ? "exhibitor compan" : "checked-in attendee"}
							{exhibitor ? (total === 1 ? "y" : "ies") : total === 1 ? "" : "s"}{" "}
							who haven't responded. Anyone emailed in the last 24 hours is
							skipped.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-none">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							className="rounded-none"
							onClick={() => remind.mutate({ all: true })}
						>
							Send reminders
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
