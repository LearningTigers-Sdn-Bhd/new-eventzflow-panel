"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail } from "lucide-react";
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
import {
	type EmailDelivery,
	getEmailDeliveries,
	resendEmailDelivery,
} from "@/lib/api/email-delivery";
import { getEvents } from "@/lib/api/event";
import {
	type EmailDeliveriesTableMeta,
	emailDeliveriesColumns,
} from "./email-deliveries-columns";
import { EmailDeliveryDetailDialog } from "./email-delivery-detail-dialog";
import { EmailLogTable } from "./email-log-table";

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
	const [pendingResendId, setPendingResendId] = useState<number | null>(null);
	const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(
		null,
	);
	const [detailOpen, setDetailOpen] = useState(false);
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

	const queryKey = useMemo(
		() => ["email-logs", { eventId: selectedEventId, stuckSent }],
		[selectedEventId, stuckSent],
	);

	const { data, isLoading, error } = useQuery({
		queryKey,
		queryFn: () =>
			getEmailDeliveries({
				eventId: selectedEventId,
				perPage: 100,
				stuckSent: stuckSent || undefined,
			}),
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
						variant={stuckSent ? "default" : "outline"}
						className="w-full rounded-none md:w-auto"
						onClick={() => setStuckSent((prev) => !prev)}
					>
						{stuckSent ? "Showing stuck sent (>24h)" : "Show stuck sent (>24h)"}
					</Button>
				</div>
			</div>

			<EmailLogTable
				columns={emailDeliveriesColumns}
				data={data || []}
				meta={tableMeta}
			/>
			<EmailDeliveryDetailDialog
				open={detailOpen}
				onOpenChange={setDetailOpen}
				deliveryId={selectedDeliveryId}
			/>
		</div>
	);
}
