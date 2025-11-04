"use client";

import { Label } from "@radix-ui/react-label";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconHeading } from "@/components/ui/icon-heading";
import { Separator } from "@/components/ui/separator";
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

	return (
		<div>
			<IconHeading
				icon={type === "scan_history" ? FileText : FileSpreadsheet}
				title={`Export #${id}`}
			/>
			<Separator />
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<div>
						<Label className="font-medium text-muted-foreground text-sm">
							Type
						</Label>
						<p className={cn("font-medium")}>{getTypeLabel(type)}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<div>
						<Label className="font-medium text-muted-foreground text-sm">
							Created At
						</Label>
						<p className={cn("font-medium")}>
							{new Date(createdAt).toLocaleString()}
						</p>
					</div>
				</div>
				<Button onClick={onDownload} className="w-full">
					<Download className="mr-2 size-4" />
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
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Export ID</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			return <div className="font-medium">#{row.getValue("id")}</div>;
		},
	},
	{
		accessorKey: "type",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Type</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
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
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Created At</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			const createdAt = row.getValue("createdAt") as string;
			return (
				<div className="font-medium">
					{new Date(createdAt).toLocaleString()}
				</div>
			);
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
						size: "2xl",
						showCloseButton: false,
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
