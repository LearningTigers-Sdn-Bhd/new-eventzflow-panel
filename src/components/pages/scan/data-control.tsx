"use client";

import type { Table } from "@tanstack/react-table";
import { Clock, Filter, Search, X } from "lucide-react";
import * as React from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { ScanResult } from "./types";

interface DataControlProps {
	table: Table<ScanResult>;
	scanResults: ScanResult[];
	filterType: string;
	sortType: "newest" | "oldest" | "status";
	onFilterChange: (filter: string) => void;
	onSortChange: (sort: "newest" | "oldest" | "status") => void;
}

export function DataControl({
	table,
	scanResults,
	filterType,
	sortType,
	onFilterChange,
	onSortChange,
}: DataControlProps) {
	// Get unique events for filter
	const uniqueEvents = Array.from(
		new Map(
			scanResults
				.filter((r) => r.eventId && r.eventName)
				.map((r) => [r.eventId, r.eventName]),
		).entries(),
	).map(([id, name]) => ({ id: id?.toString() ?? "", name: name ?? "" }));

	// Handle sort change - map to TanStack Table sorting
	const handleSortChange = (value: "newest" | "oldest" | "status") => {
		onSortChange(value);
		const timestampColumn = table.getColumn("timestamp");
		const statusColumn = table.getColumn("status");

		// Clear existing sorting
		table.resetSorting();

		if (value === "newest") {
			timestampColumn?.toggleSorting(true); // desc = newest first
		} else if (value === "oldest") {
			timestampColumn?.toggleSorting(false); // asc = oldest first
		} else if (value === "status") {
			statusColumn?.toggleSorting(false); // asc
		}
	};

	// Handle filter change - map to TanStack Table filter
	const handleFilterChange = (value: string) => {
		onFilterChange(value);
		const eventColumn = table.getColumn("eventName");

		if (value === "all") {
			eventColumn?.setFilterValue(undefined);
		} else {
			// Filter by event ID (uses filterFn in column definition)
			eventColumn?.setFilterValue(value);
		}
	};

	// Custom search state
	const [searchTerm, setSearchTerm] = React.useState("");

	// Handle search change
	const handleSearchChange = (value: string) => {
		setSearchTerm(value);

		// Set up custom filter that checks all fields including ticketId
		table.options.globalFilterFn = (
			row,
			_columnId: string,
			filterValue: unknown,
		) => {
			const term = String(filterValue || "").toLowerCase();
			if (!term) return true;

			// Check all searchable fields: attendeeName, ticketId, eventName, ticketType
			const attendeeName = String(
				row.getValue("attendeeName") || "",
			).toLowerCase();
			const ticketId = String(
				(row.original as ScanResult).ticketId || "",
			).toLowerCase();
			const eventName = String(row.getValue("eventName") || "").toLowerCase();
			const ticketType = String(row.getValue("ticketType") || "").toLowerCase();

			return (
				attendeeName.includes(term) ||
				ticketId.includes(term) ||
				eventName.includes(term) ||
				ticketType.includes(term)
			);
		};

		// Apply the filter
		table.setGlobalFilter(value);
	};

	if (scanResults.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col gap-2 border-y border-dashed bg-accent px-0 py-0 md:flex-row md:gap-3 md:px-4 md:py-2">
			<InputGroup className="rounded-none bg-background">
				<InputGroupInput
					placeholder="Search tickets, names, events..."
					value={searchTerm}
					onChange={(event) => handleSearchChange(event.target.value)}
				/>
				<InputGroupAddon>
					<Search className="h-4 w-4" />
				</InputGroupAddon>
				{searchTerm && (
					<InputGroupAddon align="inline-end">
						<InputGroupButton onClick={() => handleSearchChange("")}>
							<X className="h-4 w-4" />
						</InputGroupButton>
					</InputGroupAddon>
				)}
			</InputGroup>
			<div className="grid grid-cols-2 gap-2 md:flex md:justify-end">
				<Select value={filterType} onValueChange={handleFilterChange}>
					<SelectTrigger className="h-9 w-full rounded-none bg-background text-xs sm:h-10 sm:text-sm md:w-[140px]">
						<Filter className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="rounded-none">
						<SelectItem value="all">All Events</SelectItem>
						{uniqueEvents.map((event) => (
							<SelectItem
								key={event.id}
								value={event.id}
								className="rounded-none"
							>
								<span className="max-w-[200px] text-wrap">{event.name}</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={sortType} onValueChange={handleSortChange}>
					<SelectTrigger className="h-9 w-full rounded-none bg-background text-xs sm:h-10 sm:text-sm md:w-[140px]">
						<Clock className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="rounded-none">
						<SelectItem value="newest" className="rounded-none">
							Newest First
						</SelectItem>
						<SelectItem value="oldest" className="rounded-none">
							Oldest First
						</SelectItem>
						<SelectItem value="status" className="rounded-none">
							By Status
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
