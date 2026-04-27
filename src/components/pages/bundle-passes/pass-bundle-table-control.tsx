"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface PassBundleTableControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		name: "Bundle Owner",
		registrationFormName: "Registration Form",
		ticketTypeName: "Ticket Type",
		usedCount: "Usage",
		paymentMode: "Payment",
		status: "Status",
	};

	return standardLabels[columnId] || columnId;
}

export function PassBundleTableControl<TData>({
	table,
}: PassBundleTableControlProps<TData>) {
	const getStatusFilterValue = () => {
		const statusFilter = table.getColumn("status")?.getFilterValue() as
			| string
			| undefined;
		return statusFilter ?? "all";
	};

	const getPaymentModeFilterValue = () => {
		const paymentModeFilter = table
			.getColumn("paymentMode")
			?.getFilterValue() as string | undefined;
		return paymentModeFilter ?? "all";
	};

	const statusFilterControl: ControlConfig = {
		label: "Status",
		columnId: "status",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Active", value: "active" },
			{ label: "Paused", value: "paused" },
		],
		customFilter: {
			value: getStatusFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("status");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const paymentModeFilterControl: ControlConfig = {
		label: "Payment Mode",
		columnId: "paymentMode",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Free", value: "free" },
			{ label: "Pay Offline", value: "pay_offline" },
		],
		customFilter: {
			value: getPaymentModeFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("paymentMode");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const desktopControlConfigs: ControlConfig[] = [
		statusFilterControl,
		paymentModeFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel: (columnId) => getColumnLabel(columnId),
			excludeColumns: ["actions", "copy"],
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ ...statusFilterControl, topPriority: true },
		{ ...paymentModeFilterControl, topPriority: true },
		{ label: "Bundle Owner", columnId: "name", type: "sort" },
		{ label: "Usage", columnId: "usedCount", type: "sort" },
		{ label: "Status", columnId: "status", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search bundle passes...",
					enableCustomSearch: true,
					columns: ["name", "registrationFormName", "ticketTypeName"],
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
