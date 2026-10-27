"use client";

import type { Table } from "@tanstack/react-table";
import { ArrowDown, ChevronDown } from "lucide-react";
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
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";
import { getExhibitorFilterOptions } from "./filter-options";

interface DataControlProps<TData> {
	table: Table<TData>;
	search: string;
	onSearchChange: (value: string) => void;
	configuredPricingLabels?: string[];
	configuredZones?: string[];
}

export function DataControl<TData>({
	table,
	search,
	onSearchChange,
	configuredPricingLabels = [],
	configuredZones = [],
}: DataControlProps<TData>) {
	const _isTablet = useIsTablet();

	const searchColumns = ["company_name", "booth_number"];
	// Only one page of rows is loaded, so options come from the event's configured
	// prices/zones rather than from the rows themselves.
	const { pricingLabels, zones } = getExhibitorFilterOptions(
		[],
		configuredPricingLabels,
		configuredZones,
	);
	const hasUnassignedZone = zones.length > 0;
	const searchProps = {
		table,
		columns: searchColumns,
		placeholder: "Search exhibitors...",
		controlled: { value: search, onChange: onSearchChange },
	};

	const renderFilterSelect = (
		label: string,
		columnId: string,
		options: { label: string; value: string }[],
		className = "w-36",
	) => {
		const column = table.getColumn(columnId);
		const filterValue = (column?.getFilterValue() as string) || "all";

		return (
			<Select
				value={filterValue}
				onValueChange={(value) =>
					column?.setFilterValue(value === "all" ? undefined : value)
				}
			>
				<SelectTrigger
					className={cn(className, "rounded-none bg-background font-medium")}
				>
					<div className="flex min-w-0 items-center gap-1 truncate text-sm">
						<span className="shrink-0 font-semibold">{label}:</span>
						<SelectValue placeholder="All" className="truncate" />
					</div>
				</SelectTrigger>
				<SelectContent className="rounded-none bg-background">
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

	const boothPricingOptions = [
		{ label: "All Pricing", value: "all" },
		...pricingLabels.map((label) => ({ label, value: label })),
	];
	const zoneOptions = [
		{ label: "All Zones", value: "all" },
		...zones.map((zone) => ({ label: zone, value: zone })),
		...(hasUnassignedZone
			? [{ label: "Unassigned", value: "__unassigned__" }]
			: []),
	];

	return (
		<div className="mb-4 flex flex-col border-y border-dashed bg-accent px-0 py-0 md:px-2 md:py-4 lg:px-4 lg:py-4">
			{!_isTablet ? (
				<div className="hidden min-w-0 items-center gap-2 lg:flex">
					<div className="min-w-0 flex-1">
						<QuerySearchField {...searchProps} />
					</div>
					{pricingLabels.length > 0 &&
						renderFilterSelect(
							"Booth Pricing",
							"booth_pricing",
							boothPricingOptions,
							"w-40",
						)}
					{zones.length > 0 &&
						renderFilterSelect("Zone", "zone", zoneOptions, "w-32")}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="ml-auto rounded-none">
								{table.getAllColumns().filter((column) => column.getIsVisible())
									.length - 1}{" "}
								columns
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="rounded-none bg-background"
						>
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="rounded-none capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : (
				<div className="flex flex-col gap-2 lg:hidden">
					<QuerySearchField {...searchProps} />
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{pricingLabels.length > 0 &&
							renderFilterSelect(
								"Booth Pricing",
								"booth_pricing",
								boothPricingOptions,
								"w-full",
							)}
						{zones.length > 0 &&
							renderFilterSelect("Zone", "zone", zoneOptions, "w-full")}
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("company_name")
									?.toggleSorting(
										table.getColumn("company_name")?.getIsSorted() === "asc",
									)
							}
							className="rounded-none"
						>
							<ArrowDown
								className={cn(
									"mr-2 h-4 w-4 transition-transform",
									table.getColumn("company_name")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
							Company
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("booth_number")
									?.toggleSorting(
										table.getColumn("booth_number")?.getIsSorted() === "asc",
									)
							}
							className="rounded-none"
						>
							<ArrowDown
								className={cn(
									"mr-2 h-4 w-4 transition-transform",
									table.getColumn("booth_number")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
							Booth No.
						</Button>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
						>
							<SelectTrigger className="rounded-none">
								<SelectValue placeholder="Page size" />
							</SelectTrigger>
							<SelectContent className="rounded-none bg-background">
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem
										key={pageSize}
										value={`${pageSize}`}
										className="rounded-none"
									>
										{pageSize} rows
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			)}
		</div>
	);
}
