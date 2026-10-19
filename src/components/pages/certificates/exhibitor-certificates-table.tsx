"use client";

import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Award } from "lucide-react";
import * as React from "react";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import { DataPagination } from "@/components/data-pagination";
import type { ExhibitorCertificateRow } from "@/lib/api/certificate";
import {
	type ExhibitorCertificatesTableMeta,
	exhibitorCertificatesColumns,
} from "./exhibitor-certificates-columns";

const COLUMN_LABELS: Record<string, string> = {
	company_name: "Company",
	booth_count: "Booths",
	certificate_status: "Certificate",
	certificate_sent_at: "Sent At",
};

export function ExhibitorCertificatesTable({
	data,
	meta,
}: {
	data: ExhibitorCertificateRow[];
	meta: ExhibitorCertificatesTableMeta;
}) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = React.useState("");
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const table = useReactTable({
		data,
		columns: exhibitorCertificatesColumns,
		state: { sorting, globalFilter, columnFilters, columnVisibility },
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		globalFilterFn: "includesString",
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		meta,
	});

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
			value:
				(table.getColumn("certificate_status")?.getFilterValue() as
					| string
					| undefined) ?? "all",
			onChange: (value: string) =>
				table
					.getColumn("certificate_status")
					?.setFilterValue(value === "all" ? undefined : value),
		},
	};

	const visibilityControl: ControlConfig = {
		label: "Columns",
		columnId: "visibility",
		type: "visibility",
		getColumnLabel: (columnId) => COLUMN_LABELS[columnId] ?? columnId,
	};

	return (
		<div className="w-full">
			<BaseTableControl
				table={table}
				searchConfig={{
					searchConfig: {
						placeholder: "Search exhibitors...",
						enableCustomSearch: true,
						columns: ["company_name", "email"],
					},
				}}
				desktopConfig={{
					controlConfigs: [statusFilterControl, visibilityControl],
				}}
				mobileConfig={{
					controlConfigs: [
						{ ...statusFilterControl, topPriority: true },
						{ label: "Company", columnId: "company_name", type: "sort" },
						{ label: "Sent At", columnId: "certificate_sent_at", type: "sort" },
					],
				}}
			/>
			<BaseTable
				table={table}
				emptyStateConfig={{
					title: "No exhibitors found",
					desc: "Only companies with a paid or waived booking appear here.",
					icon: <Award />,
					action: null,
				}}
			/>
			<DataPagination table={table} />
		</div>
	);
}
