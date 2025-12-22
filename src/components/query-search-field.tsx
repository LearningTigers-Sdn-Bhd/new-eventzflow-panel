"use client";

import type { Column, Table } from "@tanstack/react-table";
import { Search, X } from "lucide-react";
import * as React from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";

// Single column search (original functionality)
interface SingleColumnSearchProps<TData, TValue> {
	column: Column<TData, TValue> | undefined;
	placeholder?: string;
}

// Global search across multiple columns
interface GlobalSearchProps<TData> {
	table: Table<TData>;
	placeholder?: string;
}

// Selective search across specific columns
interface SelectiveSearchProps<TData> {
	table: Table<TData>;
	columns: string[];
	placeholder?: string;
	searchCustomFields?: boolean;
}

type QuerySearchFieldProps<TData, TValue> =
	| SingleColumnSearchProps<TData, TValue>
	| GlobalSearchProps<TData>
	| SelectiveSearchProps<TData>;

function isGlobalSearch<TData, TValue>(
	props: QuerySearchFieldProps<TData, TValue>,
): props is GlobalSearchProps<TData> {
	return "table" in props && !("columns" in props);
}

function isSelectiveSearch<TData, TValue>(
	props: QuerySearchFieldProps<TData, TValue>,
): props is SelectiveSearchProps<TData> {
	return "table" in props && "columns" in props;
}

export function QuerySearchField<TData, TValue>(
	props: QuerySearchFieldProps<TData, TValue>,
) {
	// Always call hooks at the top level to avoid conditional hook calls
	const [globalFilter, setGlobalFilter] = React.useState("");
	const [selectiveFilter, setSelectiveFilter] = React.useState("");
	const propsRef = React.useRef(props);

	// Update ref when props change
	React.useEffect(() => {
		propsRef.current = props;
	});

	// Always call useEffect, but only use it for global/selective search
	React.useEffect(() => {
		const currentProps = propsRef.current;

		if (isGlobalSearch(currentProps)) {
			currentProps.table.setGlobalFilter(globalFilter);
		} else if (isSelectiveSearch(currentProps)) {
			const { table } = currentProps;

			// For selective search, use global filter with custom logic
			if (globalFilter) {
				// Clear all column filters first
				table.getAllColumns().forEach((column) => {
					column.setFilterValue("");
				});

				// Store the selective filter value
				setSelectiveFilter(globalFilter);
			} else {
				// Clear all filters when search term is empty
				table.getAllColumns().forEach((column) => {
					column.setFilterValue("");
				});
				setSelectiveFilter("");
			}
		}
	}, [globalFilter]);

	// Separate effect for selective search filter function setup
	React.useEffect(() => {
		const currentProps = propsRef.current;
		if (isSelectiveSearch(currentProps) && selectiveFilter) {
			const { table, columns, searchCustomFields } = currentProps;

			// Set up custom global filter function for selective search
			table.options.globalFilterFn = (row, _columnId, filterValue) => {
				const searchTerm = filterValue?.toLowerCase() || "";

				// Get all column IDs to safely check if a column exists
				const allColumnIds = new Set(
					table.getAllColumns().map((col) => col.id),
				);

				// Check if the search term matches any of the specified columns
				const columnMatch = columns.some((colId) => {
					let cellValue: unknown;

					// Check if column exists in the table
					if (allColumnIds.has(colId)) {
						// Column exists, try to get value from it
						try {
							cellValue = row.getValue(colId);
						} catch {
							// If getValue fails, fall back to accessing original data
							cellValue = (row.original as Record<string, unknown>)[colId];
						}
					} else {
						// Column doesn't exist in table, access directly from original data
						cellValue = (row.original as Record<string, unknown>)[colId];
					}

					const cellString = cellValue ? String(cellValue).toLowerCase() : "";

					// For phone columns, remove common formatting characters for flexible matching
					if (colId === "phone" || colId.includes("phone")) {
						// Remove spaces, dashes, parentheses, dots, and plus signs from both search and value
						const normalizedSearch = searchTerm.replace(/[\s\-().+]/g, "");
						const normalizedPhone = cellString.replace(/[\s\-().+]/g, "");
						return normalizedPhone.includes(normalizedSearch);
					}

					// For other columns, use standard string matching
					return cellString.includes(searchTerm);
				});

				// If already matched in standard columns, return true
				if (columnMatch) return true;

				// Additionally search custom fields if enabled
				if (searchCustomFields) {
					const rowData = row.original as Record<string, unknown>;
					if (rowData.customLabels && Array.isArray(rowData.customLabels)) {
						return rowData.customLabels.some(
							(label: { name: string; value: string }) => {
								const labelValue = label.value?.toLowerCase() || "";
								return labelValue.includes(searchTerm);
							},
						);
					}
				}

				return false;
			};

			// Apply the global filter
			table.setGlobalFilter(selectiveFilter);
		} else if (isSelectiveSearch(currentProps) && !selectiveFilter) {
			const { table } = currentProps;
			// Reset to default global filter function when no selective filter
			table.options.globalFilterFn = undefined;
			table.setGlobalFilter("");
		}
	}, [selectiveFilter]);

	if (isGlobalSearch(props)) {
		// Global search implementation - searches ALL columns
		const placeholder = props.placeholder || "Search...";

		return (
			<InputGroup className="rounded-none bg-background py-6 lg:py-0">
				<InputGroupInput
					placeholder={placeholder}
					value={globalFilter}
					onChange={(event) => setGlobalFilter(event.target.value)}
					className="placeholder:text-sm placeholder:tracking-tight md:placeholder:text-base md:placeholder:tracking-tight"
				/>
				<InputGroupAddon>
					<Search className="mr-2.5 size-4" />
				</InputGroupAddon>
				{globalFilter && (
					<InputGroupAddon align="inline-end">
						<InputGroupButton onClick={() => setGlobalFilter("")}>
							<X className="h-4 w-4" />
						</InputGroupButton>
					</InputGroupAddon>
				)}
			</InputGroup>
		);
	}

	if (isSelectiveSearch(props)) {
		// Selective search implementation - searches only specified columns
		const placeholder = props.placeholder || "Search...";

		return (
			<InputGroup className="rounded-none bg-background">
				<InputGroupInput
					placeholder={placeholder}
					value={globalFilter}
					onChange={(event) => setGlobalFilter(event.target.value)}
				/>
				<InputGroupAddon>
					<Search className="h-4 w-4" />
				</InputGroupAddon>
				{globalFilter && (
					<InputGroupAddon align="inline-end">
						<InputGroupButton onClick={() => setGlobalFilter("")}>
							<X className="h-4 w-4" />
						</InputGroupButton>
					</InputGroupAddon>
				)}
			</InputGroup>
		);
	}

	// Single column search (original implementation)
	const { column, placeholder = "Search..." } = props;
	const filterValue = (column?.getFilterValue() as string) ?? "";

	return (
		<InputGroup className="rounded-none bg-background">
			<InputGroupInput
				placeholder={placeholder}
				value={filterValue}
				onChange={(event) => column?.setFilterValue(event.target.value)}
			/>
			<InputGroupAddon>
				<Search className="h-4 w-4" />
			</InputGroupAddon>
			{filterValue && (
				<InputGroupAddon align="inline-end">
					<InputGroupButton onClick={() => column?.setFilterValue("")}>
						<X className="h-4 w-4" />
					</InputGroupButton>
				</InputGroupAddon>
			)}
		</InputGroup>
	);
}
