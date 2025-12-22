"use client";

import { ScanLine } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScanModal } from "./scan-modal";

interface TicketScanButtonProps {
	eventId: string;
	canScanTickets: boolean;
	onRefetch?: () => void;
}

export function TicketScanButton({
	eventId,
	canScanTickets,
	onRefetch,
}: TicketScanButtonProps) {
	const [open, setOpen] = useState(false);

	if (!canScanTickets) return null;

	return (
		<>
			<Button
				onClick={() => setOpen(true)}
				variant="default"
				className="gap-2 rounded-none"
			>
				<ScanLine className="h-4 w-4" />
				Scan
			</Button>

			<ScanModal
				open={open}
				onOpenChange={setOpen}
				eventId={eventId}
				onRefetch={onRefetch}
			/>
		</>
	);
}
