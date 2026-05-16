"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface EmailLogTableControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		recipient: "Recipient",
		status: "Status",
		mailerName: "Mailer",
		providerMessageId: "Provider ID",
		lastError: "Last Error",
		createdAt: "Created At",
		actions: "Actions",
	};

	return standardLabels[columnId] || columnId;
}

export function EmailLogTableControl<TData>({
	table,
}: EmailLogTableControlProps<TData>) {
	const statusFilterControl: ControlConfig = {
		label: "Status",
		columnId: "status",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Queued", value: "queued" },
			{ label: "Sending", value: "sending" },
			{ label: "Sent", value: "sent" },
			{ label: "Delivered", value: "delivered" },
			{ label: "Failed", value: "failed" },
			{ label: "Bounced", value: "bounced" },
			{ label: "Complained", value: "complained" },
			{ label: "Suppressed", value: "suppressed" },
		],
		customFilter: {
			value: (table.getColumn("status")?.getFilterValue() as string) || "all",
			onChange: (value: string) => {
				const column = table.getColumn("status");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const desktopControlConfigs: ControlConfig[] = [
		statusFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel,
			excludeColumns: [],
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ ...statusFilterControl, topPriority: true },
		{ label: "Recipient", columnId: "recipient", type: "sort" },
		{ label: "Status", columnId: "status", type: "sort" },
		{ label: "Created At", columnId: "createdAt", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search recipient, subject, mailer...",
					enableCustomSearch: true,
					columns: [
						"recipient",
						"subject",
						"mailerName",
						"mailerAction",
						"providerMessageId",
					],
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
