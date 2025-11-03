"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportLogPageButtonProps {
	onCreateExport: () => void;
	isCreating: boolean;
}

export function ExportLogPageButton({
	onCreateExport,
	isCreating,
}: ExportLogPageButtonProps) {
	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				onClick={onCreateExport}
				disabled={isCreating}
				className="rounded-none"
			>
				<FileDown className="size-4" />
				{isCreating ? "Creating Export..." : "Export Tickets"}
			</Button>
		</div>
	);
}
