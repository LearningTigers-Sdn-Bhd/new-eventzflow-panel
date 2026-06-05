"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { isWithinDateRange, type DateRange } from "./date-range-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { downloadExportLog } from "@/lib/api/event/export-log";
import { cn } from "@/lib/utils";

export type ExportLogs = {
	id: string;
	type: "ticket-list" | "scan_history";
	downloadUrl: string;
	createdAt: string;
};

const ExportLogViewModal = ({
	id,
	type,
	createdAt,
	onDownload,
}: {
	id: string;
	type: string;
	createdAt: string;
	onDownload: () => void;
}) => {
	const getTypeLabel = (type: string) => {
		if (type === "ticket-list") return "Ticket List";
		if (type === "scan_history") return "Scan History";
		return type;
	};

	const isScanHistory = type === "scan_history";
	const Icon = isScanHistory ? FileText : FileSpreadsheet;

	return (
		<div className="overflow-hidden">
			{/* Header band */}
			<div className={cn(
				"flex items-center gap-4 px-6 py-5",
				isScanHistory ? "bg-blue-50 border-b border-blue-100" : "bg-green-50 border-b border-green-100",
			)}>
				<div className={cn(
					"flex size-12 items-center justify-center border-2",
					isScanHistory ? "border-blue-200 bg-blue-100 text-blue-600" : "border-green-200 bg-green-100 text-green-600",
				)}>
					<Icon className="size-5" />
				</div>
				<div>
					<p className="font-bold text-base">Export #{id}</p>
					<Badge
						className={cn(
							"mt-1 rounded-none text-xs font-semibold",
							isScanHistory
								? "bg-blue-100 text-blue-700 hover:bg-blue-100"
								: "bg-green-100 text-green-700 hover:bg-green-100",
						)}
						variant="secondary"
					>
						{getTypeLabel(type)}
					</Badge>
				</div>
			</div>

			{/* Info rows */}
			<div className="divide-y px-6">
				<div className="flex items-center justify-between py-3.5">
					<span className="text-muted-foreground text-sm">Export ID</span>
					<span className="font-mono font-semibold text-sm">#{id}</span>
				</div>
				<div className="flex items-center justify-between py-3.5">
					<span className="text-muted-foreground text-sm">Created</span>
					<span className="font-medium text-sm">{new Date(createdAt).toLocaleDateString()}</span>
				</div>
				<div className="flex items-center justify-between py-3.5">
					<span className="text-muted-foreground text-sm">Time</span>
					<span className="font-medium text-sm">{new Date(createdAt).toLocaleTimeString()}</span>
				</div>
			</div>

			{/* Download button */}
			<div className="px-6 pb-6 pt-4">
				<Button onClick={onDownload} className="w-full rounded-none gap-2">
					<Download className="size-4" />
					Download File
				</Button>
			</div>
		</div>
	);
};

// Searchable content for global search
export const getSearchableContent = (row: ExportLogs) =>
	`${row.id} ${row.type} ${new Date(row.createdAt).toLocaleDateString()}`;

export const columns: ColumnDef<ExportLogs>[] = [
	{
		accessorKey: "id",
		size: 150,
		header: ({ column }) => (
			<SortableHeader column={column} label="Export ID" />
		),
		cell: ({ row }) => {
			return <div className="font-medium">#{row.getValue("id")}</div>;
		},
	},
	{
		accessorKey: "type",
		size: 200,
		header: ({ column }) => <SortableHeader column={column} label="Type" />,
		cell: ({ row }) => {
			const type = row.getValue("type") as string;
			return (
				<Badge
					variant={type === "scan_history" ? "default" : "secondary"}
					className={cn(
						"rounded-none",
						type === "scan_history"
							? "bg-blue-100 text-blue-800 hover:bg-blue-100"
							: "bg-green-100 text-green-800 hover:bg-green-100",
					)}
				>
					{type === "scan_history" ? "Scan History" : "Ticket List"}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "createdAt",
		size: 180,
		header: ({ column }) => (
			<SortableHeader column={column} label="Created At" />
		),
		cell: ({ row }) => {
			const createdAt = row.getValue("createdAt") as string;
			return (
				<div className="font-medium">
					{new Date(createdAt).toLocaleString()}
				</div>
			);
		},
		filterFn: (row, _id, value: DateRange | undefined) => {
			if (!value) return true;
			const date = new Date(row.getValue("createdAt") as string);
			return isWithinDateRange(date, value.from, value.to);
		},
	},
	{
		id: "actions",
		size: 100,
		enableHiding: false,
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => {
			const { openDialog } = useDialog();
			const exportLog = row.original;

			const handleDownload = async () => {
				try {
					await downloadExportLog({ exportId: exportLog.id });
					toast.success("Export downloaded successfully");
				} catch (error) {
					toast.error(
						error instanceof Error
							? error.message
							: "Failed to download export",
					);
				}
			};

			const openViewModal = () => {
				openDialog({
					component: ExportLogViewModal,
					config: {
						title: "Export Log Details",
						description: "View the details of the export log",
						size: "sm",
						showCloseButton: true,
						className: "rounded-none",
					},
					props: {
						id: exportLog.id,
						type: exportLog.type,
						createdAt: exportLog.createdAt,
						onDownload: handleDownload,
					},
				});
			};
			return (
				<div className="flex justify-center">
					<Button
						variant="outline"
						size="icon-sm"
						className="rounded-none text-green-500 hover:bg-green-50 hover:text-green-600 [&_svg]:text-green-500 hover:[&_svg]:text-green-600"
						onClick={openViewModal}
						title="View Export Details"
					>
						<Download className="size-4" />
					</Button>
				</div>
			);
		},
	},
];
