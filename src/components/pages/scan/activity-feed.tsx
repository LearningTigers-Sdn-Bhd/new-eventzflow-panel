/**
 * Activity Feed Component
 * Wrapper component that uses DataTable for displaying scan history
 */

import { ScanFace } from "lucide-react";
import { IconTitle } from "@/components/admin-ui/icon-heading";
import { generateColumns } from "./scan-table-columns";
import { DataTable } from "./scan-table";
import type { FilterType, ScanResult, SortType } from "./types";

interface ActivityFeedProps {
	scanResults: ScanResult[];
	recentScan: ScanResult | null;
	filterType: FilterType;
	sortType: SortType;
	isLoading?: boolean;
	onFilterChange: (filter: FilterType) => void;
	onSortChange: (sort: SortType) => void;
	// Legacy props - kept for backward compatibility but no longer used
	searchQuery?: string;
	onSearchChange?: (query: string) => void;
	onExport?: () => void;
}

export function ActivityFeed({
	scanResults,
	recentScan,
	filterType,
	sortType,
	isLoading = false,
	onFilterChange,
	onSortChange,
}: ActivityFeedProps) {
	return (
		<div className="space-y-0">
			<div className="page-header">
				<div className="w-full px-0 md:px-4">
					<IconTitle
						icon={ScanFace}
						title="Activity Feed"
						description="View the activity feed for the ticket scanner"
					/>
				</div>
			</div>
			<DataTable
				columns={generateColumns()}
				data={scanResults}
				recentScan={recentScan}
				filterType={filterType}
				sortType={sortType}
				isLoading={isLoading}
				onFilterChange={onFilterChange}
				onSortChange={onSortChange}
			/>
		</div>
	);
}
