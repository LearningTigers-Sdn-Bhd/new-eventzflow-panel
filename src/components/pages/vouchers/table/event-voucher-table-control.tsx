"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

type VoucherFilter = "active" | "archived";

interface DataControlProps<TData> {
	table: Table<TData>;
	voucherFilter?: VoucherFilter;
	onVoucherFilterChange?: (filter: VoucherFilter) => void;
}

export function DataControl<TData>({
	table,
	voucherFilter = "active",
	onVoucherFilterChange,
}: DataControlProps<TData>) {
	const getStatusFilterValue = () => {
		const statusFilter = table.getColumn("status")?.getFilterValue() as
			| string
			| undefined;
		return statusFilter ?? "all";
	};

	const statusFilterControl: ControlConfig = {
		label: "Status",
		columnId: "status",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Active", value: "active" },
			{ label: "Inactive", value: "inactive" },
			{ label: "Expired", value: "expired" },
		],
		customFilter: {
			value: getStatusFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("status");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const viewFilterControl: ControlConfig | null = onVoucherFilterChange
		? {
				label: "View",
				columnId: "voucherFilter",
				type: "filter",
				data: [
					{ label: "Active", value: "active" },
					{ label: "Archived", value: "archived" },
				],
				customFilter: {
					value: voucherFilter,
					onChange: (value: string) =>
						onVoucherFilterChange(value as VoucherFilter),
				},
			}
		: null;

	const desktopControlConfigs: ControlConfig[] = [
		...(viewFilterControl ? [viewFilterControl] : []),
		statusFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		...(viewFilterControl ? [{ ...viewFilterControl, topPriority: true }] : []),
		{ ...statusFilterControl, topPriority: true },
		{ label: "Title", columnId: "title", type: "sort" },
		{ label: "Validity", columnId: "validity", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search vouchers...",
					enableCustomSearch: true,
					columns: ["title", "merchant"],
				},
			}}
			desktopConfig={{
				controlConfigs: desktopControlConfigs,
			}}
			mobileConfig={{
				controlConfigs: mobileControlConfigs,
			}}
		/>
	);
}
