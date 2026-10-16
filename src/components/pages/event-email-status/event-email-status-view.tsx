"use client";

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { Download, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import {
	downloadEventEmailReport,
	type EmailStatusGroup,
	type EventEmailDelivery,
	getEventEmailDeliveries,
	getEventEmailSummary,
	resendEventEmail,
} from "@/lib/api/event-email-status";
import type { EventEmailTableMeta } from "./event-email-status-columns";
import { EventEmailStatusTable } from "./event-email-status-table";
import { FixEmailDialog } from "./fix-email-dialog";

const GROUPS: { value: EmailStatusGroup; label: string }[] = [
	{ value: "problem", label: "Problems" },
	{ value: "sent", label: "Sent" },
	{ value: "delivered", label: "Delivered" },
	{ value: "pending", label: "Pending" },
];

export function EventEmailStatusView({ eventId }: { eventId: string }) {
	const queryClient = useQueryClient();
	const [group, setGroup] = useState<EmailStatusGroup | "all">("all");
	const [emailType, setEmailType] = useState("all");
	const [search, setSearch] = useState("");
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(25);
	const [fixTarget, setFixTarget] = useState<EventEmailDelivery | null>(null);
	const debouncedSearch = useDebounce(search, 300);

	// Any filter change goes back to the first page.
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset on filter change only
	useEffect(() => {
		setPageIndex(0);
	}, [group, emailType, debouncedSearch, pageSize]);

	const { data, isLoading, error } = useQuery({
		queryKey: [
			"event-email-status",
			eventId,
			"list",
			{ group, emailType, debouncedSearch, pageIndex, pageSize },
		],
		queryFn: () =>
			getEventEmailDeliveries({
				eventId,
				statusGroup: group === "all" ? undefined : group,
				emailType: emailType === "all" ? undefined : emailType,
				recipient: debouncedSearch.trim() || undefined,
				page: pageIndex + 1,
				perPage: pageSize,
			}),
		placeholderData: keepPreviousData,
	});

	const { data: summaryData } = useQuery({
		queryKey: ["event-email-status", eventId, "summary"],
		queryFn: () => getEventEmailSummary(eventId),
	});

	const resend = useMutation({
		mutationFn: ({ id, email }: { id: number; email?: string }) =>
			resendEventEmail(eventId, id, email),
		onSuccess: () => {
			toast.success("Email has been queued to send again.");
			setFixTarget(null);
			queryClient.invalidateQueries({
				queryKey: ["event-email-status", eventId],
			});
		},
		onError: (err: Error) =>
			toast.error(err.message || "Failed to resend email."),
	});

	const summary = summaryData?.groups;
	const exportReport = useMutation({
		mutationFn: () => downloadEventEmailReport(eventId),
		onSuccess: (blob) => {
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `email-status-event-${eventId}.xlsx`;
			link.click();
			URL.revokeObjectURL(url);
		},
		onError: () => toast.error("Could not export the email report."),
	});

	const total = summary
		? summary.delivered + summary.sent + summary.pending + summary.problem
		: 0;
	const settled = summary
		? summary.delivered + summary.sent + summary.problem
		: 0;
	const deliveryRate =
		settled > 0 && summary
			? Math.round((summary.delivered / settled) * 100)
			: null;
	const hasActiveFilters =
		group !== "all" || emailType !== "all" || search !== "";

	if (isLoading) return <LoadingState title="Loading email status..." />;
	if (error) {
		return (
			<ErrorState
				title="Failed to load email status"
				description="We couldn't fetch the emails for this event. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	const meta: EventEmailTableMeta = {
		onFix: setFixTarget,
		onResend: (delivery) => resend.mutate({ id: delivery.id }),
		pendingResendId: resend.isPending ? (resend.variables?.id ?? null) : null,
	};

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center gap-2">
				<Button
					variant={group === "all" ? "default" : "outline"}
					size="sm"
					className="rounded-none"
					onClick={() => setGroup("all")}
				>
					All · {total}
				</Button>
				{GROUPS.map(({ value, label }) => (
					<Button
						key={value}
						variant={group === value ? "default" : "outline"}
						size="sm"
						className="rounded-none"
						onClick={() => setGroup(group === value ? "all" : value)}
					>
						{label} · {summary?.[value] ?? 0}
					</Button>
				))}
				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						className="rounded-none"
						onClick={() => {
							setGroup("all");
							setEmailType("all");
							setSearch("");
						}}
					>
						<X className="size-4" />
						Clear filters
					</Button>
				)}
				<div className="ml-auto flex items-center gap-4">
					{deliveryRate !== null && (
						<p className="text-muted-foreground text-sm">
							Delivery rate{" "}
							<span className="font-semibold text-foreground">
								{deliveryRate}%
							</span>
						</p>
					)}
					<Button
						variant="outline"
						size="sm"
						className="rounded-none"
						disabled={total === 0 || exportReport.isPending}
						onClick={() => exportReport.mutate()}
					>
						{exportReport.isPending ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Download className="size-4" />
						)}
						Export
					</Button>
				</div>
			</div>

			<div>
				<EventEmailStatusTable
					data={data?.items ?? []}
					meta={meta}
					search={search}
					onSearchChange={setSearch}
					emailType={emailType}
					emailTypes={summaryData?.emailTypes ?? []}
					onEmailTypeChange={setEmailType}
					pagination={{
						pageIndex,
						pageSize,
						pageCount: data?.pagination.totalPages ?? 0,
						totalCount: data?.pagination.totalCount ?? 0,
						onPageChange: setPageIndex,
						onPageSizeChange: setPageSize,
					}}
				/>
			</div>

			<FixEmailDialog
				delivery={fixTarget}
				pending={resend.isPending}
				onClose={() => setFixTarget(null)}
				onSubmit={(email) =>
					fixTarget && resend.mutate({ id: fixTarget.id, email })
				}
			/>
		</div>
	);
}
