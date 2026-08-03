"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

const COLUMN_LABELS: Record<string, string> = {
	attendee_name: "Participant",
	ticket_type: "Ticket Type",
	certificate_status: "Certificate",
	certificate_sent_at: "Sent At",
};

interface CertificateParticipantsTableControlProps<TData> {
	table: Table<TData>;
}

export function CertificateParticipantsTableControl<TData>({
	table,
}: CertificateParticipantsTableControlProps<TData>) {
	const getStatusFilterValue = () => {
		const value = table.getColumn("certificate_status")?.getFilterValue() as
			| string
			| undefined;
		return value ?? "all";
	};

	const statusFilterControl: ControlConfig = {
		label: "Certificate",
		columnId: "certificate_status",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Not sent", value: "not_sent" },
			{ label: "Queued", value: "queued" },
			{ label: "Sent", value: "sent" },
			{ label: "Delivered", value: "delivered" },
			{ label: "Failed", value: "failed" },
			{ label: "Bounced", value: "bounced" },
		],
		customFilter: {
			value: getStatusFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("certificate_status");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const visibilityControl: ControlConfig = {
		label: "Columns",
		columnId: "visibility",
		type: "visibility",
		getColumnLabel: (columnId) => COLUMN_LABELS[columnId] ?? columnId,
	};

	const sortConfigs: ControlConfig[] = [
		{ label: "Participant", columnId: "attendee_name", type: "sort" },
		{ label: "Ticket Type", columnId: "ticket_type", type: "sort" },
		{ label: "Sent At", columnId: "certificate_sent_at", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search participants...",
					enableCustomSearch: true,
					columns: ["attendee_name", "attendee_email"],
				},
			}}
			desktopConfig={{
				controlConfigs: [statusFilterControl, visibilityControl],
			}}
			mobileConfig={{
				controlConfigs: [
					{ ...statusFilterControl, topPriority: true },
					...sortConfigs,
				],
			}}
		/>
	);
}

export default CertificateParticipantsTableControl;
