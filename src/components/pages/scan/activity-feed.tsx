/**
 * Activity Feed Component
 * Wrapper component that uses DataTable for displaying scan history
 */

import { ScanFace } from "lucide-react";
import { IconTitle } from "@/components/admin-ui/icon-heading";
import { generateColumns } from "./table/scan-table-columns";
import { DataTable } from "./table/scan-table";
import type { FilterType, ScanResult, SortType, TypeFilter } from "./types";

interface ActivityFeedProps {
	scanResults: ScanResult[];
	recentScan: ScanResult | null;
	filterType: FilterType;
	typeFilter: TypeFilter;
	sortType: SortType;
	isLoading?: boolean;
	onFilterChange: (filter: FilterType) => void;
	onTypeFilterChange: (filter: TypeFilter) => void;
	onSortChange: (sort: SortType) => void;
}

export function ActivityFeed({
	scanResults,
	recentScan,
	filterType,
	typeFilter,
	sortType,
	isLoading = false,
	onFilterChange,
	onTypeFilterChange,
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
				sortType={sortType}
				isLoading={isLoading}
				onFilterChange={onFilterChange}
				onTypeFilterChange={onTypeFilterChange}
				onSortChange={onSortChange}
			/>
		</div>
	);
}
