"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import type {
	ControlConfig,
	SearchConfig,
} from "@/components/admin-ui/table/control/type";
import { QuerySearchField } from "@/components/query-search-field";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface DesktopTableControlProps<TData> {
	table: Table<TData>;
	searchConfig: SearchConfig;
	controlConfigs?: ControlConfig[];
}

export function DesktopTableControl<TData>({
	table,
	searchConfig,
	controlConfigs = [],
}: DesktopTableControlProps<TData>) {
	const renderSortButton = (config: ControlConfig) => {
		const column = table.getColumn(config.columnId);
		const isSorted = column?.getIsSorted();

		return (
			<Button
				variant="outline"
				onClick={() => column?.toggleSorting(isSorted === "asc")}
				className="rounded-none"
			>
				{config.label}
			</Button>
		);
	};

	const renderFilterSelect = (config: ControlConfig) => {
		// Use custom filter if provided, otherwise use column filter
		if (config.customFilter) {
			const options = config.data || [];
			return (
				<Select
					value={config.customFilter.value}
					onValueChange={config.customFilter.onChange}
				>
					<Tooltip>
						<TooltipTrigger asChild>
							<SelectTrigger className="w-35 rounded-none bg-background font-medium">
								<div className="flex items-center gap-1 truncate text-sm">
									<span className="font-semibold">{config.label}:</span>
									<SelectValue placeholder="All" className="truncate" />
								</div>
							</SelectTrigger>
						</TooltipTrigger>
						<TooltipContent className="rounded-none text-sm">
							{config.label}
						</TooltipContent>
					</Tooltip>
					<SelectContent className="rounded-none">
						{options.map((option) => (
							<SelectItem
								key={option.value}
								value={option.value}
								className="rounded-none"
							>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			);
		}

		// Regular column filter
		const column = table.getColumn(config.columnId);
		const filterValue = (column?.getFilterValue() as string) || "all";
		const options = config.data || [];

		return (
			<Select
				value={filterValue}
				onValueChange={(value) =>
					column?.setFilterValue(value === "all" ? undefined : value)
				}
			>
				<Tooltip>
					<TooltipTrigger asChild>
						<SelectTrigger className="w-35 rounded-none bg-background font-medium">
							<div className="flex items-center gap-1 truncate text-sm">
								<span className="font-semibold">{config.label}:</span>
								<SelectValue placeholder="All" className="truncate" />
							</div>
						</SelectTrigger>
					</TooltipTrigger>
					<TooltipContent className="rounded-none text-sm">
						{config.label}
					</TooltipContent>
				</Tooltip>
				<SelectContent className="rounded-none">
					{options.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}
							className="rounded-none"
						>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	};

	const renderVisibilityDropdown = (config: ControlConfig) => {
		const columns = table
			.getAllColumns()
			.filter((column) => column.getCanHide())
			.filter((column) => {
				// Exclude columns specified in config
				if (config.excludeColumns?.includes(column.id)) {
					return false;
				}
				return true;
			});

		const visibleColumnCount = columns.filter((column) =>
			column.getIsVisible(),
		).length;

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="rounded-none">
						{visibleColumnCount} columns
						<ChevronDown className="ml-2 h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="rounded-none bg-background">
					{columns.map((column) => {
						const label = config.getColumnLabel
							? config.getColumnLabel(column.id)
							: column.id;
						return (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="rounded-none capitalize"
								checked={column.getIsVisible()}
								onSelect={(event) => event.preventDefault()}
								onCheckedChange={(value) => {
									column.toggleVisibility(!!value);
									// Move newly-checked columns to the end so display order
									// follows selection order, not the column-def order —
									// but keep sticky-right columns (e.g. Actions) pinned last.
									if (value) {
										const stickyRightIds = table
											.getAllLeafColumns()
											.filter((c) => c.columnDef.meta?.sticky === "right")
											.map((c) => c.id);
										const currentOrder = table.getState().columnOrder.length
											? table.getState().columnOrder
											: table.getAllLeafColumns().map((c) => c.id);
										const rest = currentOrder.filter(
											(id) => id !== column.id && !stickyRightIds.includes(id),
										);
										table.setColumnOrder([
											...rest,
											column.id,
											...stickyRightIds.filter((id) => id !== column.id),
										]);
									}
								}}
							>
								{label}
							</DropdownMenuCheckboxItem>
						);
					})}
					{config.onReset && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="rounded-none"
								onSelect={(event) => {
									event.preventDefault();
									config.onReset?.();
								}}
							>
								Reset to default
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	};

	const renderControl = (config: ControlConfig) => {
		if (config.type === "sort") {
			return renderSortButton(config);
		}

		if (config.type === "visibility") {
			return renderVisibilityDropdown(config);
		}

		return renderFilterSelect(config);
	};

	return (
		<div className="hidden items-center gap-2 lg:flex">
			<QuerySearchField
				table={table}
				columns={searchConfig.columns}
				placeholder={searchConfig.placeholder}
				searchCustomFields={searchConfig.enableCustomSearch}
				controlled={searchConfig.controlled}
			/>
			{controlConfigs.map((config, index) => {
				const isLast = index === controlConfigs.length - 1;
				const isVisibility = config.type === "visibility";
				return (
					<div
						key={`${config.columnId}-${index}`}
						className={isLast && isVisibility ? "ml-auto" : ""}
					>
						{renderControl(config)}
					</div>
				);
			})}
		</div>
	);
}
