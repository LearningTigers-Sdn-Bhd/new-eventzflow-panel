/**
 * Activity Feed Component
 * Displays scan history with filtering and sorting
 */

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Search, Filter, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScanResult, FilterType, SortType } from "./types";
import { EmptyState } from "./empty-state";
import { filterAndSortResults } from "./utils";
import { StatusBadge } from "./status-helpers";

interface ActivityFeedProps {
	scanResults: ScanResult[];
	recentScan: ScanResult | null;
	searchQuery: string;
	filterType: FilterType;
	sortType: SortType;
	onSearchChange: (query: string) => void;
	onFilterChange: (filter: FilterType) => void;
	onSortChange: (sort: SortType) => void;
	onExport: () => void;
}

export function ActivityFeed({
	scanResults,
	recentScan,
	searchQuery,
	filterType,
	sortType,
	onSearchChange,
	onFilterChange,
	onSortChange,
	onExport,
}: ActivityFeedProps) {
	const filteredResults = filterAndSortResults(
		scanResults,
		searchQuery,
		filterType,
		sortType,
	);

	// Get unique events for filter
	const uniqueEvents = Array.from(
		new Map(
			scanResults
				.filter(r => r.eventId && r.eventName)
				.map(r => [r.eventId, r.eventName])
		).entries()
	).map(([id, name]) => ({ id: id!.toString(), name: name! }));

	return (
		<Card className="w-full p-0">
			{/* Header & Control Panel */}
			<div className="p-3 sm:p-4 border-b space-y-3 sm:space-y-4">
				<div>
					<h2 className="text-base sm:text-lg font-bold">Scan History</h2>
					<p className="text-xs sm:text-sm text-muted-foreground">
						{filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
					</p>
				</div>

				{scanResults.length > 0 && (
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search tickets, names, events..."
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="pl-9 h-9 sm:h-10 text-sm"
							/>
						</div>
						<div className="flex gap-2 shrink-0">
							<Select value={filterType} onValueChange={onFilterChange}>
								<SelectTrigger className="w-[140px] sm:w-[180px] h-9 sm:h-10 text-xs sm:text-sm">
									<Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Events</SelectItem>
									{uniqueEvents.map((event) => (
										<SelectItem key={event.id} value={event.id}>
											{event.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select value={sortType} onValueChange={onSortChange}>
								<SelectTrigger className="w-[140px] sm:w-[180px] h-9 sm:h-10 text-xs sm:text-sm">
									<Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="newest">Newest First</SelectItem>
									<SelectItem value="oldest">Oldest First</SelectItem>
									<SelectItem value="status">By Status</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				)}
			</div>

			{/* Table */}
			<div className="overflow-auto max-h-[400px] sm:max-h-[600px]">
				{filteredResults.length === 0 ? (
					<div className="flex items-center justify-center p-8 sm:p-12">
						<EmptyState hasScans={scanResults.length > 0} />
					</div>
				) : (
					<Table>
						<TableHeader className="sticky top-0 bg-background z-10">
							<TableRow>
								<TableHead className="w-12 text-center text-xs sm:text-sm">No</TableHead>
								<TableHead className="text-xs sm:text-sm">Attendee</TableHead>
								<TableHead className="hidden md:table-cell text-xs sm:text-sm">Event</TableHead>
								<TableHead className="hidden sm:table-cell text-xs sm:text-sm">Ticket Type</TableHead>
								<TableHead className="hidden lg:table-cell text-xs sm:text-sm">Ticket ID</TableHead>
								<TableHead className="text-xs sm:text-sm whitespace-nowrap">Check-In Time</TableHead>
								<TableHead className="text-xs sm:text-sm">Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredResults.map((result: ScanResult, index: number) => (
								<TableRow
									key={index}
									className={cn(
										"transition-colors",
										recentScan === result && "bg-primary/5 animate-pulse"
									)}
								>
									<TableCell className="font-mono text-[10px] sm:text-xs text-muted-foreground text-center py-2 sm:py-3 w-12">
										{index + 1}
									</TableCell>
									<TableCell className="font-medium text-xs sm:text-sm py-2 sm:py-3 truncate min-w-[100px]">
										{result.attendeeName || "Unknown"}
									</TableCell>
									<TableCell className="hidden md:table-cell text-xs sm:text-sm text-muted-foreground py-2 sm:py-3 truncate min-w-[120px]">
										{result.eventName || "-"}
									</TableCell>
									<TableCell className="hidden sm:table-cell text-xs sm:text-sm text-muted-foreground py-2 sm:py-3 truncate min-w-[100px]">
										{result.ticketType || "-"}
									</TableCell>
									<TableCell className="hidden lg:table-cell font-mono text-[10px] sm:text-xs text-muted-foreground py-2 sm:py-3 truncate min-w-[180px]">
										{result.ticketId}
									</TableCell>
									<TableCell className="text-[10px] sm:text-sm text-muted-foreground py-2 sm:py-3 whitespace-nowrap">
										{result.timestamp.toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
											second: "2-digit",
										})}
									</TableCell>
									<TableCell className="py-2 sm:py-3 min-w-[150px]">
										<StatusBadge status={result.status} message={result.message} />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>
		</Card>
	);
}
