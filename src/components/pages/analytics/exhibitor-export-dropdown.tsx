"use client";

import { useMutation } from "@tanstack/react-query";
import { ChevronDown, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import {
	type ExhibitorReportData,
	useExportPdf,
} from "@/components/pdf-reports";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	exportExhibitorKits,
	exportExhibitorKitsCsv,
} from "@/lib/api/exhibitor-kit";

interface ExhibitorExportDropdownProps {
	eventId: number;
	reportData: ExhibitorReportData | null;
}

/**
 * Export trigger for exhibitor reporting - PDF (client-rendered from reportData),
 * Excel and CSV (both generated server-side from the event's exhibitor kits).
 */
export function ExhibitorExportDropdown({
	eventId,
	reportData,
}: ExhibitorExportDropdownProps) {
	const { exportPdf, status: pdfStatus } = useExportPdf(reportData);
	const excelMutation = useMutation({
		mutationFn: () => exportExhibitorKits(eventId),
	});
	const csvMutation = useMutation({
		mutationFn: () => exportExhibitorKitsCsv(eventId),
	});

	const isPdfPending = pdfStatus === "generating";
	const isPending =
		isPdfPending || excelMutation.isPending || csvMutation.isPending;

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
					disabled={!reportData || isPdfPending}
					onSelect={() => exportPdf()}
				>
					<FileText className="h-4 w-4" />
					Export PDF
				</DropdownMenuItem>
				<DropdownMenuItem
					disabled={excelMutation.isPending}
					onSelect={() => excelMutation.mutate()}
				>
					<FileSpreadsheet className="h-4 w-4" />
					Export Excel
				</DropdownMenuItem>
				<DropdownMenuItem
					disabled={csvMutation.isPending}
					onSelect={() => csvMutation.mutate()}
				>
					<FileSpreadsheet className="h-4 w-4" />
					Export CSV
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
