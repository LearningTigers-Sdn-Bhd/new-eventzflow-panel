/**
 * Activity Feed Component
 * Displays scan history with filtering and sorting
 */

import { Clock, Filter, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { StatusBadge } from "./status-helpers";
import type { FilterType, ScanResult, SortType } from "./types";
import { filterAndSortResults } from "./utils";

interface ActivityFeedProps {
	scanResults: ScanResult[];
	recentScan: ScanResult | null;
	searchQuery: string;
	filterType: FilterType;
	sortType: SortType;
	isLoading?: boolean;
	onSearchChange: (query: string) => void;
	onFilterChange: (filter: FilterType) => void;
	onSortChange: (sort: SortType) => void;
	onExport?: () => void;
}

function TableRowSkeleton() {
	return (
		<TableRow>
			<TableCell className="w-12 py-2 text-center sm:py-3">
				<Skeleton className="mx-auto h-4 w-6" />
			</TableCell>
			<TableCell className="min-w-[100px] py-2 sm:py-3">
				<Skeleton className="h-4 w-24" />
			</TableCell>
			<TableCell className="hidden min-w-[120px] py-2 sm:py-3 md:table-cell">
				<Skeleton className="h-4 w-32" />
			</TableCell>
			<TableCell className="hidden min-w-[100px] py-2 sm:table-cell sm:py-3">
				<Skeleton className="h-4 w-20" />
			</TableCell>
			<TableCell className="hidden min-w-[180px] py-2 sm:py-3 lg:table-cell">
				<Skeleton className="h-4 w-40" />
			</TableCell>
			<TableCell className="whitespace-nowrap py-2 sm:py-3">
				<Skeleton className="h-4 w-16" />
			</TableCell>
			<TableCell className="min-w-[150px] py-2 sm:py-3">
				<Skeleton className="h-6 w-32 rounded-full" />
			</TableCell>
		</TableRow>
	);
}

export function ActivityFeed({
	scanResults,
	recentScan,
	searchQuery,
	filterType,
	sortType,
	isLoading = false,
	onSearchChange,
	onFilterChange,
	onSortChange,
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
				.filter((r) => r.eventId && r.eventName)
				.map((r) => [r.eventId, r.eventName]),
		).entries(),
	).map(([id, name]) => ({ id: id?.toString() ?? "", name: name ?? "" }));

	return (
		<Card className="w-full p-0">
		{/* Header & Control Panel */}
		<div className="space-y-3 border-b p-3 sm:space-y-4 sm:p-4">
			<div>
				<h2 className="font-bold text-base sm:text-lg">Scan History</h2>
				{isLoading ? (
					<Skeleton className="mt-1 h-4 w-20" />
				) : (
					<p className="text-muted-foreground text-xs sm:text-sm">
						{filteredResults.length} result
						{filteredResults.length !== 1 ? "s" : ""}
					</p>
				)}
			</div>

				{scanResults.length > 0 && (
					<div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
						<div className="relative flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search tickets, names, events..."
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="h-9 pl-9 text-sm sm:h-10"
							/>
						</div>
						<div className="flex shrink-0 gap-2">
							<Select value={filterType} onValueChange={onFilterChange}>
								<SelectTrigger className="h-9 w-[140px] text-xs sm:h-10 sm:w-[180px] sm:text-sm">
									<Filter className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
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
								<SelectTrigger className="h-9 w-[140px] text-xs sm:h-10 sm:w-[180px] sm:text-sm">
									<Clock className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
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
		<div className="max-h-[400px] overflow-auto sm:max-h-[600px]">
			{isLoading ? (
				<Table>
					<TableHeader className="sticky top-0 z-10 bg-background">
						<TableRow>
							<TableHead className="w-12 text-center text-xs sm:text-sm">
								No
							</TableHead>
							<TableHead className="text-xs sm:text-sm">Attendee</TableHead>
							<TableHead className="hidden text-xs sm:text-sm md:table-cell">
								Event
							</TableHead>
							<TableHead className="hidden text-xs sm:table-cell sm:text-sm">
								Ticket Type
							</TableHead>
							<TableHead className="hidden text-xs sm:text-sm lg:table-cell">
								Ticket ID
							</TableHead>
							<TableHead className="whitespace-nowrap text-xs sm:text-sm">
								Check-In Time
							</TableHead>
							<TableHead className="text-xs sm:text-sm">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, index) => (
							<TableRowSkeleton key={index} />
						))}
					</TableBody>
				</Table>
			) : filteredResults.length === 0 ? (
				<div className="flex items-center justify-center p-8 sm:p-12">
					<EmptyState hasScans={scanResults.length > 0} />
				</div>
			) : (
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-background">
							<TableRow>
								<TableHead className="w-12 text-center text-xs sm:text-sm">
									No
								</TableHead>
								<TableHead className="text-xs sm:text-sm">Attendee</TableHead>
								<TableHead className="hidden text-xs sm:text-sm md:table-cell">
									Event
								</TableHead>
								<TableHead className="hidden text-xs sm:table-cell sm:text-sm">
									Ticket Type
								</TableHead>
								<TableHead className="hidden text-xs sm:text-sm lg:table-cell">
									Ticket ID
								</TableHead>
								<TableHead className="whitespace-nowrap text-xs sm:text-sm">
									Check-In Time
								</TableHead>
								<TableHead className="text-xs sm:text-sm">Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredResults.map((result: ScanResult, index: number) => (
								<TableRow
									key={`${result.ticketId}-${result.timestamp.getTime()}-${index}`}
									className={cn(
										"transition-colors",
										recentScan === result && "animate-pulse bg-primary/5",
									)}
								>
									<TableCell className="w-12 py-2 text-center font-mono text-[10px] text-muted-foreground sm:py-3 sm:text-xs">
										{index + 1}
									</TableCell>
									<TableCell className="min-w-[100px] truncate py-2 font-medium text-xs sm:py-3 sm:text-sm">
										{result.attendeeName || "Unknown"}
									</TableCell>
									<TableCell className="hidden min-w-[120px] truncate py-2 text-muted-foreground text-xs sm:py-3 sm:text-sm md:table-cell">
										{result.eventName || "-"}
									</TableCell>
									<TableCell className="hidden min-w-[100px] truncate py-2 text-muted-foreground text-xs sm:table-cell sm:py-3 sm:text-sm">
										{result.ticketType || "-"}
									</TableCell>
									<TableCell className="hidden min-w-[180px] truncate py-2 font-mono text-[10px] text-muted-foreground sm:py-3 sm:text-xs lg:table-cell">
										{result.ticketId}
									</TableCell>
									<TableCell className="whitespace-nowrap py-2 text-[10px] text-muted-foreground sm:py-3 sm:text-sm">
										{result.timestamp.toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
											second: "2-digit",
										})}
									</TableCell>
									<TableCell className="min-w-[150px] py-2 sm:py-3">
										<StatusBadge
											status={result.status}
											message={result.message}
										/>
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
