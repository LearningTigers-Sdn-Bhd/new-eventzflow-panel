"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { downloadRfidReportXlsx, getRfidReportFields } from "@/lib/api/rfid";

/**
 * Report download with an optional "extra columns" pick. The offered fields
 * are the event's own custom fields (labels come from the backend), so nothing
 * here is specific to one event's form.
 */
export function ReportDownload({
	eventId,
	onDownloaded,
}: {
	eventId: string;
	onDownloaded: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [picked, setPicked] = useState<string[]>([]);

	const { data } = useQuery({
		queryKey: ["event", eventId, "rfid", "report-fields"],
		queryFn: () => getRfidReportFields(eventId),
		enabled: open,
	});
	const fields = data?.fields ?? [];

	const download = useMutation({
		mutationFn: () => downloadRfidReportXlsx(eventId, picked),
		onSuccess: (blob) => {
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `rfid-report-event-${eventId}.xlsx`;
			link.click();
			URL.revokeObjectURL(url);
			setOpen(false);
			onDownloaded();
		},
		onError: (error) => toast.error(error.message),
	});

	const toggle = (key: string, on: boolean) =>
		setPicked((prev) => (on ? [...prev, key] : prev.filter((k) => k !== key)));

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					disabled={download.isPending}
					className="w-full shrink-0 rounded-none lg:w-auto"
				>
					<Download className="mr-2 size-4" />
					{download.isPending
						? "Preparing report..."
						: "Download report (Excel)"}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-80 rounded-none">
				<p className="mb-1 font-medium text-sm">Extra columns (optional)</p>
				<p className="mb-3 text-muted-foreground text-xs">
					Added after "Ticket type" on every guest sheet, in the order you tick
					them.
				</p>
				<div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
					{fields.length === 0 && (
						<p className="text-muted-foreground text-xs">
							{data ? "No custom fields on this event." : "Loading..."}
						</p>
					)}
					{fields.map((field) => (
						<div key={field.key} className="flex items-center gap-2">
							<Checkbox
								id={`report-field-${field.key}`}
								checked={picked.includes(field.key)}
								onCheckedChange={(on) => toggle(field.key, on === true)}
							/>
							<Label htmlFor={`report-field-${field.key}`}>{field.label}</Label>
						</div>
					))}
				</div>
				<Button
					className="w-full rounded-none"
					onClick={() => download.mutate()}
					disabled={download.isPending}
				>
					Download
				</Button>
			</PopoverContent>
		</Popover>
	);
}
