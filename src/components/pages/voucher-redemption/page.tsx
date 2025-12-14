"use client";

import { useQueryClient } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useEventActionsStore } from "@/stores/event-actions-store";
import { RedemptionLogsTable } from "./redemption-logs-table";
import { VoucherRedemptionModal } from "./redemption-modal";

export default function VoucherRedemptionContent() {
	const { openDialog } = useDialog();
	const queryClient = useQueryClient();
	const setActions = useEventActionsStore((state) => state.setActions);

	/**
	 * Open redemption modal
	 */
	const handleOpenRedemptionModal = () => {
		openDialog({
			component: VoucherRedemptionModal,
			props: {
				onSuccess: () => {
					// Refetch redemption logs after successful redemption
					queryClient.invalidateQueries({
						queryKey: ["voucher-redemption-logs"],
					});
				},
			},
			config: {
				title: "Redeem Voucher",
				description: "Scan voucher and visitor QR codes to process redemption",
				size: "3xl",
				showCloseButton: true,
			},
		});
	};

	/**
	 * Set the action button in the header
	 */
	useEffect(() => {
		setActions(
			<Button
				onClick={handleOpenRedemptionModal}
				size="default"
				className="gap-2"
			>
				<QrCode className="h-4 w-4" />
				Scan Voucher
			</Button>,
		);

		// Cleanup: remove actions when component unmounts
		return () => {
			setActions(null);
		};
	}, [setActions]);

	return (
		<div className="p-0">
			{/* Main Content */}
			<div className="space-y-4 px-2 sm:space-y-6 md:px-4">
				<RedemptionLogsTable />
			</div>
		</div>
	);
}
