"use client";

import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AnalyticsReportData } from "./types";
import { type ExportStatus, useExportPdf } from "./use-export-pdf";

interface ExportPdfButtonProps {
	data: AnalyticsReportData | null;
	filename?: string;
	variant?: "default" | "outline" | "ghost" | "secondary";
	size?: "default" | "sm" | "lg" | "icon";
	className?: string;
	disabled?: boolean;
	showLabel?: boolean;
}

export function ExportPdfButton({
	data,
	filename,
	variant = "outline",
	size = "sm",
	className = "",
	disabled = false,
	showLabel = true,
}: ExportPdfButtonProps) {
	const { exportPdf, status, error } = useExportPdf(data, filename);

	const isGenerating = status === "generating";
	const isDisabled = disabled || !data || isGenerating;

	const handleClick = async () => {
		if (isDisabled) return;
		await exportPdf();
	};

	const getIcon = () => {
		if (isGenerating) {
			return <Loader2 className="h-4 w-4 animate-spin" />;
		}
		return <FileText className="h-4 w-4" />;
	};

	const getLabel = () => {
		if (isGenerating) return "Generating...";
		return "Export PDF";
	};

	const button = (
		<Button
			variant={variant}
			size={size}
			onClick={handleClick}
			disabled={isDisabled}
			className={`rounded-none ${className}`}
		>
			{getIcon()}
			{showLabel && <span className="ml-2">{getLabel()}</span>}
		</Button>
	);

	if (!showLabel) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>{button}</TooltipTrigger>
					<TooltipContent>
						<p>{isGenerating ? "Generating PDF..." : "Export PDF Report"}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return button;
}
