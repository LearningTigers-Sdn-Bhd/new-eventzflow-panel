"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface DataControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		redemptionTimestamp: "Time",
		voucher: "Voucher",
		redeemer: "Redeemer",
		redeemerType: "Type",
		redemptionStatus: "Status",
		transactionGrossAmount: "Original Price",
		discountAppliedValue: "Discount",
		transactionNetAmount: "Price after Discount",
	};

	return standardLabels[columnId] || columnId;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const getRedeemerTypeFilterValue = () => {
		const redeemerTypeFilter = table
			.getColumn("redeemerType")
			?.getFilterValue() as string | undefined;
		return redeemerTypeFilter ?? "all";
	};

	const getRedemptionStatusFilterValue = () => {
		const redemptionStatusFilter = table
			.getColumn("redemptionStatus")
			?.getFilterValue() as string | undefined;
		return redemptionStatusFilter ?? "all";
	};

	const redeemerTypeFilterControl: ControlConfig = {
		label: "Type",
		columnId: "redeemerType",
		type: "filter",
		data: [
			{ label: "All Types", value: "all" },
			{ label: "User", value: "user_redeemer" },
			{ label: "Visitor", value: "visitor_redeemer" },
		],
		customFilter: {
			value: getRedeemerTypeFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("redeemerType");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const redemptionStatusFilterControl: ControlConfig = {
		label: "Status",
		columnId: "redemptionStatus",
		type: "filter",
		data: [
			{ label: "All Status", value: "all" },
			{ label: "Completed", value: "completed" },
			{ label: "Cancelled", value: "cancelled" },
		],
		customFilter: {
			value: getRedemptionStatusFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("redemptionStatus");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const desktopControlConfigs: ControlConfig[] = [
		redeemerTypeFilterControl,
		redemptionStatusFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel,
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ ...redeemerTypeFilterControl, topPriority: true },
		{ ...redemptionStatusFilterControl, topPriority: true },
		{ label: "Time", columnId: "redemptionTimestamp", type: "sort" },
		{
			label: "Price after Discount",
			columnId: "transactionNetAmount",
			type: "sort",
		},
		{
			label: "Original Price",
			columnId: "transactionGrossAmount",
			type: "sort",
		},
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search redemption logs...",
					enableCustomSearch: true,
					columns: ["voucher", "redeemer"],
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
