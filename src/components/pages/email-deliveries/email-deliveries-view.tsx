"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import {
	type EmailDelivery,
	getEmailDeliveries,
	resendEmailDelivery,
} from "@/lib/api/email-delivery";
import {
	type EmailDeliveriesTableMeta,
	emailDeliveriesColumns,
} from "./email-deliveries-columns";
import { EmailDeliveryDetailDialog } from "./email-delivery-detail-dialog";
import { EmailLogTable } from "./email-log-table";

export function EmailDeliveriesView() {
	const queryClient = useQueryClient();
	const [stuckSent, setStuckSent] = useState(false);
	const [pendingResendId, setPendingResendId] = useState<number | null>(null);
	const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(
		null,
	);
	const [detailOpen, setDetailOpen] = useState(false);
	const queryKey = useMemo(() => ["email-logs", { stuckSent }], [stuckSent]);

	const { data, isLoading, error } = useQuery({
		queryKey,
		queryFn: () =>
			getEmailDeliveries({ perPage: 100, stuckSent: stuckSent || undefined }),
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
				<div className="w-full px-0 md:w-auto md:px-4">
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
