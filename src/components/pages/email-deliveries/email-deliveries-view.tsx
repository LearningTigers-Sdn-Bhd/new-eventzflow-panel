"use client";

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { Mail, Settings2, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import {
	type EmailDelivery,
	type GetEmailDeliveriesRequest,
	getEmailDeliveries,
	getEmailDeliverySummary,
	resendEmailDelivery,
} from "@/lib/api/email-delivery";
import { getEvents } from "@/lib/api/event";
import {
	type EmailDeliveriesTableMeta,
	emailDeliveriesColumns,
} from "./email-deliveries-columns";
import { EmailDeliveryDetailDialog } from "./email-delivery-detail-dialog";
import { EmailLogRetentionDialog } from "./email-log-retention-dialog";
import { EmailLogTable } from "./email-log-table";

const SUMMARY_STATUSES = [
	{ value: "delivered", label: "Delivered" },
	{ value: "sent", label: "Sent" },
	{ value: "queued", label: "Queued" },
	{ value: "failed", label: "Failed" },
	{ value: "bounced", label: "Bounced" },
	{ value: "complained", label: "Complained" },
	{ value: "suppressed", label: "Suppressed" },
] as const;

export function EmailDeliveriesView() {
	const params = useParams();
	const eventId = Number(params.event_id);
	const activeEventId =
		Number.isFinite(eventId) && eventId > 0 ? eventId : undefined;
	const queryClient = useQueryClient();
	const [selectedEventFilter, setSelectedEventFilter] = useState(
		activeEventId ? String(activeEventId) : "all",
	);
	const [stuckSent, setStuckSent] = useState(false);
	const [status, setStatus] = useState("all");
	const [search, setSearch] = useState("");
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(25);
	const [pendingResendId, setPendingResendId] = useState<number | null>(null);
	const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(
		null,
	);
	const [detailOpen, setDetailOpen] = useState(false);
	const [retentionOpen, setRetentionOpen] = useState(false);
	const selectedEventId =
		selectedEventFilter !== "all" ? Number(selectedEventFilter) : undefined;

	useEffect(() => {
		if (activeEventId) {
			setSelectedEventFilter(String(activeEventId));
		}
	}, [activeEventId]);

	const { data: events = [] } = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
	});

	const debouncedSearch = useDebounce(search, 300);

	// Any filter change goes back to the first page.
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset on filter change only
	useEffect(() => {
		setPageIndex(0);
	}, [selectedEventId, stuckSent, status, debouncedSearch, pageSize]);

	const queryKey = useMemo(
		() => [
			"email-logs",
			"list",
			{
				eventId: selectedEventId,
				stuckSent,
				status,
				search: debouncedSearch,
				pageIndex,
				pageSize,
			},
		],
		[selectedEventId, stuckSent, status, debouncedSearch, pageIndex, pageSize],
	);

	const { data, isLoading, error } = useQuery({
		queryKey,
		queryFn: () =>
			getEmailDeliveries({
				eventId: selectedEventId,
				status:
					status === "all"
						? undefined
						: (status as GetEmailDeliveriesRequest["status"]),
				search: debouncedSearch.trim() || undefined,
				page: pageIndex + 1,
				perPage: pageSize,
				stuckSent: stuckSent || undefined,
			}),
		placeholderData: keepPreviousData,
	});

	const { data: summary = {} } = useQuery({
		queryKey: ["email-logs", "summary", selectedEventId],
		queryFn: () => getEmailDeliverySummary(selectedEventId),
	});

	const resendMutation = useMutation({
		mutationFn: (id: number) => resendEmailDelivery({ id }),
		onMutate: (id: number) => setPendingResendId(id),
		onSuccess: () => {
			toast.success("Email has been queued for resend.");
			queryClient.invalidateQueries({ queryKey: ["email-logs"] });
		},
		onError: (err: Error) => {
			toast.error(err.message || "Failed to resend email.");
		},
		onSettled: () => setPendingResendId(null),
	});

	const totalCount = Object.values(summary).reduce(
		(sum, n) => sum + (n ?? 0),
		0,
	);
	// The event filter is locked to the URL on per-event pages, so it never
	// counts as an active filter there.
	const hasActiveFilters =
		status !== "all" ||
		search !== "" ||
		stuckSent ||
		(!activeEventId && selectedEventFilter !== "all");
	const clearFilters = () => {
		setStatus("all");
		setSearch("");
		setStuckSent(false);
		if (!activeEventId) setSelectedEventFilter("all");
	};

	const handleResend = (delivery: EmailDelivery) => {
		resendMutation.mutate(delivery.id);
	};
	const handleView = (delivery: EmailDelivery) => {
		setSelectedDeliveryId(delivery.id);
		setDetailOpen(true);
	};

	if (isLoading) {
		return <LoadingState title="Loading email logs..." />;
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load email logs"
				description="We couldn't fetch email logs. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	const tableMeta: EmailDeliveriesTableMeta = {
		onView: handleView,
		onResend: handleResend,
		pendingResendId,
	};

	return (
		<div className="p-0">
			<div className="page-header mb-6">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={Mail}
						title="Email Log"
						description="Track send failures, inspect provider IDs, and manually resend eligible deliveries."
					/>
				</div>
				<div className="flex w-full flex-col gap-2 px-0 md:w-auto md:flex-row md:items-center md:px-4">
					<Select
						value={selectedEventFilter}
						onValueChange={setSelectedEventFilter}
						disabled={Boolean(activeEventId)}
					>
						<SelectTrigger className="w-full rounded-none md:w-[260px]">
							<SelectValue placeholder="Filter event" />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							<SelectItem value="all">All Events</SelectItem>
							{events.map((event) => (
								<SelectItem key={event.id} value={String(event.id)}>
									{event.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						className="w-full rounded-none md:w-auto"
						onClick={() => setRetentionOpen(true)}
					>
						<Settings2 className="size-4" />
						Retention
					</Button>
					<Button
						variant={stuckSent ? "default" : "outline"}
						className="w-full rounded-none md:w-auto"
						onClick={() => setStuckSent((prev) => !prev)}
					>
						{stuckSent ? "Showing stuck sent (>24h)" : "Show stuck sent (>24h)"}
					</Button>
				</div>
			</div>

			<div className="mb-4 flex flex-wrap gap-2 px-2 md:px-4">
				<Button
					variant={status === "all" ? "default" : "outline"}
					size="sm"
					className="rounded-none"
					onClick={() => setStatus("all")}
				>
					All · {totalCount}
				</Button>
				{SUMMARY_STATUSES.map(({ value, label }) => {
					const count = summary[value] ?? 0;
					return (
						<Button
							key={value}
							variant={status === value ? "default" : "outline"}
							size="sm"
							className="rounded-none"
							onClick={() => setStatus(status === value ? "all" : value)}
						>
							{label} · {count}
						</Button>
					);
				})}
				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						className="rounded-none"
						onClick={clearFilters}
					>
						<X className="size-4" />
						Clear filters
					</Button>
				)}
			</div>

			<div className="px-2 md:px-4">
				<EmailLogTable
					columns={emailDeliveriesColumns}
					data={data?.items ?? []}
					meta={tableMeta}
					search={search}
					onSearchChange={setSearch}
					status={status}
					onStatusChange={setStatus}
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
			<EmailLogRetentionDialog
				open={retentionOpen}
				onOpenChange={setRetentionOpen}
			/>
			<EmailDeliveryDetailDialog
				open={detailOpen}
				onOpenChange={setDetailOpen}
				deliveryId={selectedDeliveryId}
			/>
		</div>
	);
}
