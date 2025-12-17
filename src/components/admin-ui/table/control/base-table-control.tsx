"use client";

import type { Table } from "@tanstack/react-table";
import { DesktopTableControl } from "@/components/admin-ui/table/control/desktop-table-control";
import { MobileTableControl } from "@/components/admin-ui/table/control/mobile-table-control";
import type {
	ControlConfig,
	SearchConfig,
} from "@/components/admin-ui/table/control/type";
import { useIsTablet } from "@/hooks/use-tablet";

interface BaseTableControlProps<TData> {
	table: Table<TData>;
	searchConfig: {
		searchConfig: SearchConfig;
	};
	desktopConfig: {
		controlConfigs?: ControlConfig[];
	};
	mobileConfig: {
		controlConfigs: ControlConfig[];
	};
}

export function BaseTableControl<TData>({
	table,
	searchConfig,
	desktopConfig,
	mobileConfig,
}: BaseTableControlProps<TData>) {
	const isTablet = useIsTablet();

	return (
		<div className="mb-4 flex flex-col border border-dashed bg-transparent px-0 py-0 md:px-2 md:py-4 lg:bg-accent lg:px-4 lg:py-4">
			{!isTablet ? (
				<DesktopTableControl
					table={table}
					searchConfig={searchConfig.searchConfig}
					controlConfigs={desktopConfig.controlConfigs}
				/>
			) : (
				<MobileTableControl
					table={table}
					searchConfig={searchConfig.searchConfig}
					controlConfigs={mobileConfig.controlConfigs}
				/>
			)}
		</div>
	);
}
