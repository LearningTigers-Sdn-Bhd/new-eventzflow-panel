"use client";

import { useQuery } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import { use, useCallback } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { RedemptionLogsTable } from "@/components/pages/voucher-redemption/redemption-logs-table";
import { VoucherRedemptionModal } from "@/components/pages/voucher-redemption/redemption-modal";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getRedemptionLogs } from "@/lib/api/voucher-redemption-log";

export default function VoucherRedemptionPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const eventId = Number(event_id);

	const { openDialog } = useDialog();

	const {
		data: logs,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["voucher-redemption-logs", eventId],
		queryFn: () => getRedemptionLogs({ event_id: eventId }),
		enabled: !!eventId,
		refetchInterval: 30000, // Refetch every 30 seconds
	});

	const handleOpenRedemptionModal = useCallback(() => {
		openDialog({
			component: VoucherRedemptionModal,
			props: {
				onSuccess: () => {
					refetch();
				},
			},
			config: {
				title: "Redeem Voucher",
				description: "Scan voucher and visitor QR codes to process redemption",
				size: "3xl",
				showCloseButton: true,
			},
		});
	}, [openDialog, refetch]);

	const eventActions = (
		<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
			<Button
				onClick={handleOpenRedemptionModal}
				size="default"
				className="gap-2 rounded-none py-6 md:py-4 lg:w-auto"
			>
				<QrCode className="h-4 w-4" />
				Scan Voucher
			</Button>
		</div>
	);

	useSetEventActions(eventActions);

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading redemption logs..."
					description="Please wait while we fetch your redemption logs..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load redemption logs"
					description={
						error?.message ||
						"We couldn't load redemption logs. Please try again."
					}
					action={<Button onClick={() => refetch()}>Retry</Button>}
				/>
			) : (
				<div className="p-0">
					<RedemptionLogsTable data={logs || []} />
				</div>
			)}
		</div>
	);
}
