"use client";

import { QrCode } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUserEventVendorId } from "@/hooks/use-event-vendors";
import { ScanModal } from "../scan-modal";

interface ScanLeadButtonProps {
	eventId: string;
	onRefetch?: () => void;
}

export function ScanLeadButton({ eventId, onRefetch }: ScanLeadButtonProps) {
	const [scanModalOpen, setScanModalOpen] = useState(false);
	const { isVendor } = useCurrentUserEventVendorId(Number(eventId));

	if (!isVendor) {
		return null;
	}

	return (
		<>
			<ScanModal
				open={scanModalOpen}
				onOpenChange={setScanModalOpen}
				eventId={eventId}
				onRefetch={onRefetch}
			/>
			<div className="flex w-full items-center gap-2 lg:w-auto">
				<Button
					variant="outline"
					onClick={() => setScanModalOpen(true)}
					className="w-full gap-2 rounded-none py-6 md:py-4 lg:w-auto"
				>
					<QrCode className="h-4 w-4" />
					Scan Attendee
				</Button>
			</div>
		</>
	);
}
