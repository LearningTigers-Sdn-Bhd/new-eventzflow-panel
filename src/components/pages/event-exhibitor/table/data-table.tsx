"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type RowSelectionState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Building2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";
import { useDialogStore } from "@/stores/dialog-store";
import { BulkPaymentForm } from "../forms/bulk-payment-form";
import type { ExhibitorMember } from "./columns";
import { DataControl } from "./data-control";
import { ExhibitorItem } from "./exhibitor-item";
import { KitDetailsRow } from "./kit-details-row";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	canManageVendors?: boolean;
	configuredPricingLabels?: string[];
	configuredZones?: string[];
}

type StickyColumnMeta = {
	sticky?: "left" | "right";
};

export function DataTable<TData, TValue>({
	columns,
	data,
	configuredPricingLabels,
	configuredZones,
}: DataTableProps<TData, TValue>) {
	const isTablet = useIsTablet();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({
			booth_pricing: false,
			zone: false,
		});
	const [detailsRowId, setDetailsRowId] = React.useState<string | null>(null);
	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
	const openDialog = useDialogStore((state) => state.openDialog);
	const closeDialog = useDialogStore((state) => state.closeDialog);

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		enableRowSelection: true,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
		getRowId: (row) => String((row as ExhibitorMember).kit.id),
	});

	const detailsMember = table
		.getFilteredRowModel()
		.rows.find((row) => row.id === detailsRowId)?.original as
		| ExhibitorMember
		| undefined;

	const selectedKits = table
		.getFilteredSelectedRowModel()
		.rows.map((row) => (row.original as ExhibitorMember).kit);

	const handleBulkPaymentClick = () => {
		openDialog({
			component: BulkPaymentForm,
			props: {
				kits: selectedKits,
				onClose: () => {
					closeDialog();
					table.resetRowSelection();
				},
			},
			config: {
				title: "Update Payment",
				description: "Apply a payment status to every selected kit",
				size: "lg",
			},
		});
	};

	return (
		<div className="w-full">
			<DataControl
				table={table}
				configuredPricingLabels={configuredPricingLabels}
				configuredZones={configuredZones}
			/>

			{selectedKits.length > 0 && (
				<div className="mb-2 flex flex-wrap items-center justify-between gap-2 border bg-muted/40 px-3 py-2">
					<p className="text-sm">
						<span className="font-medium">{selectedKits.length}</span>{" "}
						{selectedKits.length === 1 ? "kit" : "kits"} selected
					</p>
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="sm"
							className="rounded-none"
							onClick={() => table.resetRowSelection()}
						>
							Clear
						</Button>
						<Button
							size="sm"
							className="rounded-none"
							onClick={handleBulkPaymentClick}
						>
							Update Payment
						</Button>
					</div>
				</div>
			)}

			<div className="min-h-[45vh]">
				{!isTablet ? (
					<div className="overflow-x-auto rounded-none border">
						<Table className="w-full">
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											const meta = header.column.columnDef.meta as
												| StickyColumnMeta
												| undefined;
											return (
												<TableHead
													key={header.id}
													style={{ width: `${header.getSize()}px` }}
													className={cn(
														header.index === 0 && "ps-3",
														meta?.sticky === "left" &&
															"sticky left-0 z-10 bg-background",
														meta?.sticky === "right" &&
															"sticky right-0 z-10 bg-background shadow-[-1px_0_0_hsl(var(--border))]",
													)}
												>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext(),
															)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<React.Fragment key={row.id}>
											<TableRow
												data-state={row.getIsSelected() && "selected"}
												className="cursor-pointer"
												onClick={() => setDetailsRowId(row.id)}
											>
												{row.getVisibleCells().map((cell) => {
													const meta = cell.column.columnDef.meta as
														| StickyColumnMeta
														| undefined;

													return (
														<TableCell
															key={cell.id}
															style={{ width: `${cell.column.getSize()}px` }}
															className={cn(
																table.getVisibleLeafColumns()[0]?.id ===
																	cell.column.id && "ps-4",
																meta?.sticky === "left" &&
																	"sticky left-0 z-10 bg-background",
																meta?.sticky === "right" &&
																	"sticky right-0 z-10 bg-background shadow-[-1px_0_0_hsl(var(--border))]",
																cell.column.id === "select" && "w-10",
															)}
															onClick={
																cell.column.id === "select" ||
																cell.column.id === "actions"
																	? (event) => event.stopPropagation()
																	: undefined
															}
														>
															{flexRender(
																cell.column.columnDef.cell,
																cell.getContext(),
															)}
														</TableCell>
													);
												})}
											</TableRow>
										</React.Fragment>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center"
										>
											<EmptyState
												title="No exhibitors assigned"
												description="Assign existing vendors as exhibitors to this event."
												icon={<Building2 />}
												height="h-auto"
												action={
													<Button variant="link" asChild className="h-auto p-0">
														<Link href="/vendor">Go to Vendors page</Link>
													</Button>
												}
											/>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				) : (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<ExhibitorItem
										key={row.id}
										exhibitor={row.original as ExhibitorMember}
										selected={row.getIsSelected()}
										onSelectedChange={(value) => row.toggleSelected(value)}
									/>
								))
						) : (
							<EmptyState
								title="No exhibitors assigned"
								description="Assign existing vendors as exhibitors to this event."
								icon={<Building2 />}
								height="h-auto"
								action={
									<Button variant="link" asChild className="h-auto p-0">
										<Link href="/vendor">Go to Vendors page</Link>
									</Button>
								}
							/>
						)}
					</div>
				)}
			</div>

			<DataPagination table={table} />

			<Sheet
				open={!!detailsMember}
				onOpenChange={(open) => {
					if (!open) {
						setDetailsRowId(null);
					}
				}}
			>
				<SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-2xl">
					<SheetHeader>
						<SheetTitle>
							{detailsMember?.kit.company_name ||
								detailsMember?.vendor.vendor.full_name}
						</SheetTitle>
						<SheetDescription>
							Exhibitor booth & booking details
						</SheetDescription>
					</SheetHeader>
					{detailsMember && (
						<div className="px-4 pb-4">
							<KitDetailsRow
								vendor={detailsMember.vendor}
								kit={detailsMember.kit}
								batchSize={
									table
										.getFilteredRowModel()
										.rows.filter(
											(other) =>
												(other.original as ExhibitorMember).kit
													.booking_batch_id ===
												detailsMember.kit.booking_batch_id,
										).length
								}
							/>
						</div>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
