"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportEventLeads } from "@/lib/api/event-lead";

interface ExportLeadsButtonProps {
	eventId: string;
}

export function ExportLeadsButton({ eventId }: ExportLeadsButtonProps) {
	const [isExporting, setIsExporting] = useState(false);

	async function handleExport() {
		setIsExporting(true);
		try {
			await exportEventLeads(eventId);
		} catch {
			toast.error("Failed to export leads. Please try again.");
		} finally {
			setIsExporting(false);
		}
	}

	return (
		<Button
			variant="outline"
			onClick={handleExport}
			disabled={isExporting}
			className="w-full gap-2 rounded-none py-6 md:py-4 lg:w-auto"
		>
			{isExporting ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<Download className="h-4 w-4" />
			)}
			Export to Excel
		</Button>
	);
}
