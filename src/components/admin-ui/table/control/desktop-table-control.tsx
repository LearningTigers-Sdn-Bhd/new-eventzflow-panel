"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import type { ControlConfig } from "@/components/admin-ui/table/control/mobile-table-control";
import { QuerySearchField } from "@/components/query-search-field";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface DesktopTableControlProps<TData> {
	table: Table<TData>;
	searchPlaceholder?: string;
	searchColumns?: string[];
	controlConfigs?: ControlConfig[];
}

export function DesktopTableControl<TData>({
	table,
	searchPlaceholder = "Search...",
	searchColumns,
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
					<SelectTrigger className="w-[140px] rounded-none bg-background font-medium">
						<SelectValue placeholder={`All ${config.label}`} />
					</SelectTrigger>
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
				<SelectTrigger className="w-[140px] rounded-none bg-background font-medium">
					<SelectValue placeholder={`All ${config.label}`} />
				</SelectTrigger>
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

	const renderControl = (config: ControlConfig) => {
		if (config.type === "sort") {
			return renderSortButton(config);
		}

		return renderFilterSelect(config);
	};

	return (
		<div className="hidden items-center gap-2 lg:flex">
			<QuerySearchField
				table={table}
				columns={searchColumns}
				placeholder={searchPlaceholder}
			/>
			{controlConfigs.map((config, index) => (
				<div key={`${config.columnId}-${index}`}>{renderControl(config)}</div>
			))}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="ml-auto rounded-none">
						{/* Number of columns visible */}
						{table.getAllColumns().filter((column) => column.getIsVisible())
							.length - 1}{" "}
						columns
						<ChevronDown className="ml-2 h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="rounded-none bg-background">
					{table
						.getAllColumns()
						.filter((column) => column.getCanHide())
						.map((column) => {
							return (
								<DropdownMenuCheckboxItem
									key={column.id}
									className="rounded-none capitalize"
									checked={column.getIsVisible()}
									onCheckedChange={(value) => column.toggleVisibility(!!value)}
								>
									{column.id}
								</DropdownMenuCheckboxItem>
							);
						})}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
