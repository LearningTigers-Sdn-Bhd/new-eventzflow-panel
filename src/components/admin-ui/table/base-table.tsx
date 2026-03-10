"use client";

import type { Table as TanStackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import type * as React from "react";
import { EmptyState } from "@/components/data-state";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface EmptyStateConfig {
	title: string;
	desc: string;
	icon: React.ReactNode;
	action?: React.ReactNode;
}

interface ClickableRowConfig<TData> {
	isEnabled: boolean;
	onRowClick?: (row: TData) => void;
	excludeRowClickColumns?: string[];
}

interface BaseTableProps<TData> {
	table: TanStackTable<TData>;
	emptyStateConfig: EmptyStateConfig;
	clickableRowConfig?: ClickableRowConfig<TData>;
}

export function BaseTable<TData>({
	table,
	emptyStateConfig,
	clickableRowConfig,
}: BaseTableProps<TData>) {
	const columnCount = table.getAllColumns().length;

	return (
		<div className="min-h-[calc(100vh-320px)] w-full overflow-x-auto border">
			<div className="h-full w-full">
				<Table
					className={cn(
						table.getRowModel().rows.length === 0 ? "w-full" : "min-w-max",
					)}
				>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const isSticky = !!header.column.columnDef.meta?.sticky;
									return (
										<TableHead
											key={header.id}
											style={{ width: `${header.getSize()}px` }}
											className={cn(
												header.index === 0 && "ps-3",
												header.column.columnDef.meta?.sticky === "left" &&
													"sticky left-0 z-10 bg-background",
												header.column.columnDef.meta?.sticky === "right" &&
													"sticky right-0 z-10 bg-background",
												isSticky && "p-0",
											)}
										>
											<div
												className={cn(
													"flex items-center",
													isSticky && "h-full w-full px-4",
												)}
											>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</div>
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody className="border-b">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									onClick={
										clickableRowConfig?.isEnabled
											? () => clickableRowConfig.onRowClick?.(row.original)
											: undefined
									}
									className={cn(
										"group transition-colors hover:bg-muted/50",
										clickableRowConfig?.isEnabled
											? "cursor-pointer"
											: undefined,
									)}
								>
									{row.getVisibleCells().map((cell) => {
										const isSticky = !!cell.column.columnDef.meta?.sticky;
										return (
											<TableCell
												key={cell.id}
												style={{ width: `${cell.column.getSize()}px` }}
												className={cn(
													table.getVisibleLeafColumns()[0]?.id ===
														cell.column.id && "ps-4",
													cell.column.columnDef.meta?.sticky === "left" &&
														"sticky left-0 z-10 bg-background group-hover:bg-muted/50",
													cell.column.columnDef.meta?.sticky === "right" &&
														"sticky right-0 z-10 bg-background group-hover:bg-muted/50",
													isSticky && "p-0",
												)}
												onClick={(e) => {
													if (
														clickableRowConfig?.excludeRowClickColumns?.includes(
															cell.column.id,
														)
													) {
														e.stopPropagation();
													}
												}}
											>
												<div
													className={cn(
														"flex items-center",
														isSticky && "h-full w-full px-4",
													)}
												>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</div>
											</TableCell>
										);
									})}
								</TableRow>
							))
						) : (
							<TableRow className="hover:bg-transparent">
								<TableCell
									colSpan={columnCount}
									className="h-[calc(100vh-380px)] text-center"
								>
									<EmptyState
										title={emptyStateConfig.title}
										description={emptyStateConfig.desc}
										icon={emptyStateConfig.icon}
										height="h-auto"
										action={emptyStateConfig.action}
									/>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
