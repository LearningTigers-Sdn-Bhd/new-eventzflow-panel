"use client";

import type { Table } from "@tanstack/react-table";
import { DesktopTableControl } from "@/components/admin-ui/table/control/desktop-table-control";
import {
	type ControlConfig,
	MobileTableControl,
} from "@/components/admin-ui/table/control/mobile-table-control";
import { useIsTablet } from "@/hooks/use-tablet";

interface BaseTableControlProps<TData> {
	table: Table<TData>;
	desktopConfig: {
		searchPlaceholder?: string;
		searchColumns?: string[];
		controlConfigs?: ControlConfig[];
	};
	mobileConfig: {
		searchPlaceholder?: string;
		searchColumns?: string[];
		controlConfigs: ControlConfig[];
	};
}

export function BaseTableControl<TData>({
	table,
	desktopConfig,
	mobileConfig,
}: BaseTableControlProps<TData>) {
	const isTablet = useIsTablet();

	return (
		<div className="mb-4 flex flex-col border-y border-dashed bg-transparent px-0 py-0 md:px-2 md:py-4 lg:bg-accent lg:px-4 lg:py-4">
			{!isTablet ? (
				<DesktopTableControl
					table={table}
					searchPlaceholder={desktopConfig.searchPlaceholder}
					searchColumns={desktopConfig.searchColumns}
					controlConfigs={desktopConfig.controlConfigs}
				/>
			) : (
				<MobileTableControl
					table={table}
					searchPlaceholder={mobileConfig.searchPlaceholder}
					searchColumns={mobileConfig.searchColumns}
					controlConfigs={mobileConfig.controlConfigs}
				/>
			)}
		</div>
	);
}
