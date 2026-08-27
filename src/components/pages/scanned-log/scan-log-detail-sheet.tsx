"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { getScanLogs } from "@/lib/api/event/scan-log";
import type { ScannedLog } from "@/lib/api/event/scan-log/response";

interface ScanLogDetailSheetProps {
	eventId: string;
	row: ScannedLog | null;
	onOpenChange: (open: boolean) => void;
}

export function ScanLogDetailSheet({
	eventId,
	row,
	onOpenChange,
}: ScanLogDetailSheetProps) {
	const { data, isLoading } = useQuery({
		queryKey: [
			"event",
			eventId,
			"scan-logs",
			row?.scannableType,
			row?.scannableId,
		],
		queryFn: () =>
			getScanLogs({
				eventId,
				scannableType: row?.scannableType,
				scannableId: row?.scannableId,
				perPage: 100,
			}),
		enabled: Boolean(row),
	});

	return (
		<Sheet open={Boolean(row)} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-md">
				<SheetHeader>
					<SheetTitle>{row?.name ?? "Scan history"}</SheetTitle>
					<SheetDescription>
						{/* Contact details and the full per-person timeline live together here. */}
						{[row?.email, row?.phone].filter(Boolean).join(" · ") ||
							"No contact details"}
						{data ? ` — ${data.pagination.total_count} scan(s)` : ""}
					</SheetDescription>
				</SheetHeader>

				<div className="mt-6 flex flex-col gap-4 px-4">
					{isLoading && (
						<p className="text-muted-foreground text-sm">Loading…</p>
					)}
					{data?.data.map((scan) => (
						<div key={scan.id} className="flex flex-col gap-1 border-b pb-3">
							<span className="font-medium text-sm">
								{new Date(scan.scannedAt).toLocaleString()}
							</span>
							<span className="text-muted-foreground text-sm">
								{scan.locationName} · {scan.scannedBy}
							</span>
						</div>
					))}
					{data?.data.length === 0 && (
						<p className="text-muted-foreground text-sm">No scans recorded.</p>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
