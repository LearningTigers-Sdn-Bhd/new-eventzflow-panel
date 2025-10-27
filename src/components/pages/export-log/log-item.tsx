"use client";

import { Calendar, Clock, Download, File, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import type { ExportLogs } from "./columns";

interface ExportLogItemProps {
	exportLog: ExportLogs;
}

export function ExportLogItem({ exportLog }: ExportLogItemProps) {
	const handleDownload = () => {
		toast.info(`Download URL: ${exportLog.fileUrl}`);
	};

	return (
		<Item variant="outline" className="h-full w-full">
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="min-h-12 w-full justify-start">
					<div
						className={cn(
							"flex items-center rounded-md border p-2",
							exportLog.category === "scan_history"
								? "border-blue-800 bg-blue-200 text-blue-800 hover:bg-blue-100"
								: "border-green-800 bg-green-200 text-green-800 hover:bg-green-200",
						)}
					>
						<File
							className={cn(
								"size-4",
								exportLog.category === "scan_history"
									? "text-blue-800"
									: "text-green-800",
							)}
						/>
					</div>
					<h3
						className={cn(
							"truncate text-balance font-bold text-xl",
							exportLog.category === "scan_history"
								? "text-blue-500"
								: "text-green-500",
						)}
					>
						{exportLog.category === "scan_history" ? "Scan History" : "Tickets"}
					</h3>
				</ItemTitle>
			</ItemHeader>
			<ItemContent className="flex overflow-hidden">
				<ItemTitle className="flex items-center justify-between">
					<span className="truncate font-medium text-sm">
						{exportLog.fileName}
					</span>
				</ItemTitle>
				<ItemDescription className="overflow">
					<div className="flex items-center gap-2">
						<FileText className="size-4" />
						<span className="font-medium">
							Records: {exportLog.recordCount.toLocaleString()}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Calendar className="size-4" />
						<span className="font-medium">
							{new Date(exportLog.createdAt).toLocaleString().split(",")[0]}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Clock className="size-4" />
						<span className="font-medium">
							{new Date(exportLog.createdAt).toLocaleString().split(",")[1]}
						</span>
					</div>
				</ItemDescription>
			</ItemContent>
			<ItemFooter>
				<Button size="sm" onClick={handleDownload} className="w-full">
					<Download className="size-3" />
					Download
				</Button>
			</ItemFooter>
		</Item>
	);
}
