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
import { cn } from "@/lib/utils";

export type ExportLogs = {
	id: string;
	fileName: string;
	category: "scan_history" | "tickets";
	recordCount: number;
	fileUrl: string;
	createdAt: string;
};

const ExportLogViewModal = ({
	fileName,
	category,
	recordCount,
	fileUrl,
	createdAt,
}: {
	fileName: string;
	category: string;
	recordCount: number;
	fileUrl: string;
	createdAt: string;
}) => {
	const handleDownload = () => {
		toast.info(`Download URL: ${fileUrl}`);
	};

	return (
		<div>
			<IconHeading
				icon={category === "scan_history" ? FileText : FileSpreadsheet}
				title={fileName}
			/>
			<Separator />
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<div>
						<Label className="font-medium text-muted-foreground text-sm">
							Category
						</Label>
						<p className={cn("font-medium")}>{category}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<div>
						<Label className="font-medium text-muted-foreground text-sm">
							Record Count
						</Label>
						<p className={cn("font-medium")}>
							{recordCount.toLocaleString()} records
						</p>
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
				<div className="flex items-center gap-2">
					<div>
						<Label className="font-medium text-muted-foreground text-sm">
							Download URL
						</Label>
						<p className={cn("break-all font-medium text-xs")}>{fileUrl}</p>
					</div>
				</div>
				<Button onClick={handleDownload} className="w-full">
					<Download className="mr-2 size-4" />
					Download File
				</Button>
			</div>
		</div>
	);
};

// Searchable content for global search
export const getSearchableContent = (row: ExportLogs) =>
	`${row.fileName} ${row.category}`;

export const columns: ColumnDef<ExportLogs>[] = [
	{
		accessorKey: "fileName",
		size: 300,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">File Name</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
			return <div className="font-medium">{row.getValue("fileName")}</div>;
		},
	},
	{
		accessorKey: "category",
		size: 150,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Category</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
			const category = row.getValue("category") as string;
			return (
				<Badge
					variant={category === "scan_history" ? "default" : "secondary"}
					className={cn(
						category === "scan_history"
							? "bg-blue-100 text-blue-800 hover:bg-blue-100"
							: "bg-green-100 text-green-800 hover:bg-green-100",
					)}
				>
					{category === "scan_history" ? "Scan History" : "Tickets"}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "recordCount",
		size: 140,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Record Count</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
			const recordCount = row.getValue("recordCount") as number;
			return (
				<div className="font-medium">
					{recordCount.toLocaleString()} records
				</div>
			);
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
						fileName: exportLog.fileName,
						category: exportLog.category,
						recordCount: exportLog.recordCount,
						fileUrl: exportLog.fileUrl,
						createdAt: exportLog.createdAt,
					},
				});
			};
			return (
				<div className="flex justify-center">
					<Button
						variant="outline"
						size="icon-sm"
						className="text-green-500 hover:bg-green-50 hover:text-green-600 [&_svg]:text-green-500 hover:[&_svg]:text-green-600"
						onClick={openViewModal}
						title="Download Export"
					>
						<Download className="size-4" />
					</Button>
				</div>
			);
		},
	},
];
