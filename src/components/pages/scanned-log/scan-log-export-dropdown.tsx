"use client";

import { useMutation } from "@tanstack/react-query";
import { ChevronDown, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	exportScanLogs,
	type ScanLogExportFormat,
	type ScanSource,
} from "@/lib/api/event/scan-log";

interface ScanLogExportDropdownProps {
	eventId: string;
	q?: string;
	source?: ScanSource;
}

/**
 * Export trigger for the scan log - Excel, CSV and PDF are all generated
 * server-side from the event's scan logs, honouring the active search/source
 * filters so the download matches what the user currently sees.
 */
export function ScanLogExportDropdown({
	eventId,
	q,
	source,
}: ScanLogExportDropdownProps) {
	const exportMutation = useMutation({
		mutationFn: (format: ScanLogExportFormat) =>
			exportScanLogs({ eventId, format, q, source }),
	});

	const isPending = exportMutation.isPending;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="rounded-none"
					disabled={isPending}
				>
					{isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<FileText className="h-4 w-4" />
					)}
					<span className="ml-2">{isPending ? "Exporting..." : "Export"}</span>
					<ChevronDown className="ml-1 h-3.5 w-3.5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					disabled={isPending}
					onSelect={() => exportMutation.mutate("pdf")}
				>
					<FileText className="h-4 w-4" />
					Export PDF
				</DropdownMenuItem>
				<DropdownMenuItem
					disabled={isPending}
					onSelect={() => exportMutation.mutate("xlsx")}
				>
					<FileSpreadsheet className="h-4 w-4" />
					Export Excel
				</DropdownMenuItem>
				<DropdownMenuItem
					disabled={isPending}
					onSelect={() => exportMutation.mutate("csv")}
				>
					<FileSpreadsheet className="h-4 w-4" />
					Export CSV
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
