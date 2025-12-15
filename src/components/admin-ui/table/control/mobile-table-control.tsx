"use client";

import type { Table } from "@tanstack/react-table";
import { ArrowDown, Menu } from "lucide-react";
import { QuerySearchField } from "@/components/query-search-field";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type ControlConfig = {
	label: string;
	columnId: string;
	type: "sort" | "filter";
	data?: readonly { label: string; value: string }[];
	topPriority?: boolean;
	// For custom filters not tied to table columns
	customFilter?: {
		value: string;
		onChange: (value: string) => void;
	};
};

interface MobileTableControlProps<TData> {
	table: Table<TData>;
	searchPlaceholder?: string;
	searchColumns?: string[];
	controlConfigs: ControlConfig[];
	topFilter?: {
		value: string;
		onChange: (value: string) => void;
		options: { label: string; value: string }[];
	};
}

export function MobileTableControl<TData>({
	table,
	searchPlaceholder = "Search...",
	searchColumns,
	controlConfigs,
}: MobileTableControlProps<TData>) {
	// Separate configs into topPriority and regular items
	const topPriorityItems = controlConfigs.filter(
		(config) => config.topPriority,
	);
	const regularItems = controlConfigs.filter((config) => !config.topPriority);

	const renderSortButton = (config: ControlConfig) => {
		const column = table.getColumn(config.columnId);
		const isSorted = column?.getIsSorted();

		return (
			<Button
				variant="outline"
				onClick={() => column?.toggleSorting(isSorted === "asc")}
				className="flex w-full items-center justify-between rounded-none py-5 text-sm tracking-tight"
			>
				{config.label}
				<ArrowDown
					className={cn(
						"size-3.5 transition-transform",
						isSorted === "asc" && "-rotate-180",
					)}
				/>
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
					<SelectTrigger className="w-full rounded-none bg-background py-5 font-medium text-sm tracking-tight [&>svg]:opacity-100">
						<SelectValue placeholder={`All ${config.label}`} />
					</SelectTrigger>
					<SelectContent className="rounded-none text-sm">
						{options.map((option) => (
							<SelectItem
								key={option.value}
								value={option.value}
								className="rounded-none py-3"
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
				<SelectTrigger className="w-full rounded-none bg-background py-5 font-medium text-sm tracking-tight [&>svg]:opacity-100">
					<SelectValue placeholder={`All ${config.label}`} />
				</SelectTrigger>
				<SelectContent className="rounded-none text-sm">
					{options.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}
							className="rounded-none py-3"
						>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	};

	const renderControl = (config: ControlConfig, index: number) => {
		const control =
			config.type === "sort"
				? renderSortButton(config)
				: renderFilterSelect(config);

		return (
			<div
				key={`${config.columnId}-${index}`}
				className={cn(config.topPriority && "col-span-2")}
			>
				{control}
			</div>
		);
	};

	return (
		<div className="flex flex-col gap-2 lg:hidden">
			<QuerySearchField
				table={table}
				columns={searchColumns}
				placeholder={searchPlaceholder}
			/>
			<Collapsible>
				<CollapsibleTrigger asChild>
					<Button
						variant="outline"
						className="w-full rounded-none bg-muted py-5 text-sm tracking-tight"
					>
						More Filter
						<Menu className="size-4" />
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent className="flex flex-col gap-4 bg-foreground/10 p-4">
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
						{/* Render topPriority items first */}
						{topPriorityItems.map((config, index) =>
							renderControl(config, index),
						)}
						{/* Then render regular items */}
						{regularItems.map((config, index) =>
							renderControl(config, topPriorityItems.length + index),
						)}
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
