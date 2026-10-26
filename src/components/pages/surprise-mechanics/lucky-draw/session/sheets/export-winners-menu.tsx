"use client";

import { ClipboardCopy, Download, FileSpreadsheet, Table2 } from "lucide-react";
import { toast } from "sonner";
import { downloadBlob } from "@/components/pages/feedback-form/responses/export/download";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	buildWinnersCsv,
	buildWinnersXlsx,
	namesToText,
	type WinnerGroup,
} from "../../export-winners";

interface ExportWinnersMenuProps {
	groups: WinnerGroup[];
	/** Used for the downloaded file name */
	filenameBase: string;
}

function slug(text: string) {
	return (
		text
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "") || "lucky-draw"
	);
}

/** Copy a round's names for slides, or download every round as Excel/CSV. */
export function ExportWinnersMenu({
	groups,
	filenameBase,
}: ExportWinnersMenuProps) {
	const total = groups.reduce((sum, g) => sum + g.names.length, 0);
	const base = `${slug(filenameBase)}-winners`;

	const copy = async (group: WinnerGroup) => {
		const text = namesToText(group.names);
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			// Clipboard API blocked (insecure page, embedded view): fall back to a hidden textarea
			const area = document.createElement("textarea");
			area.value = text;
			area.style.position = "fixed";
			area.style.opacity = "0";
			document.body.appendChild(area);
			area.select();
			const ok = document.execCommand("copy");
			document.body.removeChild(area);
			if (!ok) {
				toast.error("Could not copy. Download the Excel file instead");
				return;
			}
		}
		toast.success(`Copied ${group.names.length} names`);
	};

	const downloadXlsx = async () => {
		try {
			const bytes = await buildWinnersXlsx(groups);
			downloadBlob(
				new Blob([bytes as BlobPart], {
					type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				}),
				`${base}.xlsx`,
			);
		} catch {
			toast.error("Failed to build the Excel file");
		}
	};

	const downloadCsv = () => {
		downloadBlob(
			new Blob([buildWinnersCsv(groups)], { type: "text/csv;charset=utf-8" }),
			`${base}.csv`,
		);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="gap-2 rounded-none"
					disabled={total === 0}
				>
					<Download className="size-4" />
					Export winners
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuLabel>Copy names (one per line)</DropdownMenuLabel>
				{groups.map((group) => (
					<DropdownMenuItem
						key={group.title}
						disabled={group.names.length === 0}
						onSelect={() => copy(group)}
					>
						<ClipboardCopy className="size-4" />
						{group.title} ({group.names.length})
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={downloadXlsx}>
					<FileSpreadsheet className="size-4" />
					{groups.length > 1
						? "Download Excel (one tab per round)"
						: "Download Excel"}
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={downloadCsv}>
					<Table2 className="size-4" />
					Download CSV
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
