/**
 * Activity Feed Component
 * Wrapper component that uses DataTable for displaying scan history
 */

import { ScanFace } from "lucide-react";
import { IconTitle } from "@/components/admin-ui/icon-heading";
import { generateColumns } from "./table/scan-table-columns";
import { DataTable } from "./table/scan-table";
import type { FilterType, ScanResult, SortType, TypeFilter, StatusFilter } from "./types";

interface ActivityFeedProps {
	scanResults: ScanResult[];
	recentScan: ScanResult | null;
	filterType: FilterType;
	typeFilter: TypeFilter;
	statusFilter: StatusFilter;
	sortType: SortType;
	isLoading?: boolean;
	onFilterChange: (filter: FilterType) => void;
	onTypeFilterChange: (filter: TypeFilter) => void;
	onStatusFilterChange: (filter: StatusFilter) => void;
	onSortChange: (sort: SortType) => void;
}

export function ActivityFeed({
	scanResults,
	recentScan,
	filterType,
	typeFilter,
	statusFilter,
	sortType,
	isLoading = false,
	onFilterChange,
	onTypeFilterChange,
	onStatusFilterChange,
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
				typeFilter={typeFilter}
				statusFilter={statusFilter}
				sortType={sortType}
				isLoading={isLoading}
				onFilterChange={onFilterChange}
				onTypeFilterChange={onTypeFilterChange}
				onStatusFilterChange={onStatusFilterChange}
				onSortChange={onSortChange}
			/>
		</div>
	);
}
