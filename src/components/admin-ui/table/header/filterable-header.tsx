"use client";

import type { Column } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import type { ReactElement } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterOption {
	label: string;
	value: string | boolean | number;
}

interface FilterableHeaderProps<TData = unknown> {
	column: Column<TData, unknown>;
	label: string;
	options: FilterOption[];
	showAllOption?: boolean;
	allOptionLabel?: string;
	/**
	 * Custom trigger element. If not provided, uses default trigger based on triggerType
	 */
	trigger?: ReactElement;
	/**
	 * Trigger type when trigger prop is not provided
	 * - "div": Default div with label and badge
	 * - "button": Button with label
	 */
	triggerType?: "div" | "button";
	/**
	 * Button variant when triggerType is "button"
	 */
	buttonVariant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	/**
	 * Button size when triggerType is "button"
	 */
	buttonSize?: "default" | "sm" | "lg" | "icon";
	/**
	 * Show active state highlighting on menu items
	 */
	highlightActive?: boolean;
	/**
	 * Additional className for trigger
	 */
	className?: string;
}

/**
 * Universal filterable column header component
 * Displays a dropdown menu for filtering column values
 * Shows badge when an option is selected (not "all")
 * Supports custom triggers or built-in div/button triggers
 */
export function FilterableHeader<TData = unknown>({
	column,
	label,
	options,
	showAllOption = true,
	allOptionLabel = "All Status",
	trigger,
	triggerType = "div",
	buttonVariant = "ghost",
	buttonSize = "sm",
	highlightActive = false,
	className,
}: FilterableHeaderProps<TData>) {
	const filterValue = column.getFilterValue();

	// Find the selected option's label
	const getSelectedLabel = () => {
		if (filterValue === undefined || filterValue === null) {
			return null;
		}
		const selectedOption = options.find((opt) => opt.value === filterValue);
		return selectedOption?.label || null;
	};

	const selectedLabel = getSelectedLabel();

	// Render badge component
	const renderBadge = () => {
		if (!selectedLabel) return null;
		return (
			<Badge
				variant="secondary"
				className="ml-2 bg-transparent text-xs capitalize underline"
			>
				{selectedLabel}
			</Badge>
		);
	};

	// Render trigger based on props
	const renderTrigger = () => {
		if (trigger) {
			return trigger;
		}

		if (triggerType === "button") {
			return (
				<Button variant={buttonVariant} size={buttonSize} className={className}>
					<span className="font-medium">
						{label}
						{renderBadge()}
					</span>
					<ChevronDown className="ml-2 size-4" />
				</Button>
			);
		}

		// Default: div trigger
		return (
			<div className={`flex items-center gap-2 ${className || ""}`}>
				<p className="font-medium">
					{label}
					{renderBadge()}
				</p>
				<ChevronDown className="size-4" />
			</div>
		);
	};

	// Render menu items (shared logic)
	const renderMenuItems = () => (
		<>
			{showAllOption && (
				<DropdownMenuItem
					onClick={() => column.setFilterValue(undefined)}
					className={
						highlightActive && filterValue === undefined ? "bg-accent" : ""
					}
				>
					{allOptionLabel}
				</DropdownMenuItem>
			)}
			{options.map((option) => (
				<DropdownMenuItem
					key={String(option.value)}
					onClick={() => column.setFilterValue(option.value)}
					className={
						highlightActive && filterValue === option.value ? "bg-accent" : ""
					}
				>
					{option.label}
				</DropdownMenuItem>
			))}
		</>
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{renderTrigger()}</DropdownMenuTrigger>
			<DropdownMenuContent align="start" side="bottom">
				{renderMenuItems()}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
