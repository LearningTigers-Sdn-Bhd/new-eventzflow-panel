"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	type TableMeta,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Award } from "lucide-react";
import * as React from "react";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { CertificateParticipantsTableControl } from "./certificate-participants-table-control";

interface CertificateParticipantsTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	meta?: TableMeta<TData>;
}

export function CertificateParticipantsTable<TData, TValue>({
	columns,
	data,
	meta,
}: CertificateParticipantsTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = React.useState("");
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const table = useReactTable({
		data,
		columns,
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

	return (
		<div className="w-full">
			<CertificateParticipantsTableControl table={table} />

			<BaseTable
				table={table}
				emptyStateConfig={{
					title: "No participants found",
					desc: "Try adjusting your search or filters.",
					icon: <Award />,
					action: null,
				}}
			/>

			<DataPagination table={table} />
		</div>
	);
}

export default CertificateParticipantsTable;
