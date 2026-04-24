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
import { PackageOpen } from "lucide-react";
import * as React from "react";
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import type { PassBundle } from "@/lib/api/pass-bundle";
import { generatePassBundleColumns } from "./pass-bundle-columns";
import { PassBundleForm } from "./pass-bundle-form";
import { PassBundleItem } from "./pass-bundle-item";
import { PassBundleTableControl } from "./pass-bundle-table-control";

interface PassBundleTableProps {
	eventId: string;
	data: PassBundle[];
	onDelete: (bundle: PassBundle) => void;
}

export function PassBundleTable({
	eventId,
	data,
	onDelete,
}: PassBundleTableProps) {
	const { openDialog, closeDialog } = useDialog();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const openCreate = () => {
		openDialog({
			component: PassBundleForm,
			props: { eventId, onClose: closeDialog },
			config: {
				title: "Create Pass Bundle",
				description: "Create a private bundle link for an invited entity.",
				size: "2xl",
				className: "rounded-none",
			},
		});
	};

	const openEdit = React.useCallback(
		(bundle: PassBundle) => {
			openDialog({
				component: PassBundleForm,
				props: { eventId, passBundle: bundle, onClose: closeDialog },
				config: {
					title: "Edit Pass Bundle",
					description: "Update this bundle details.",
					size: "2xl",
					className: "rounded-none",
				},
			});
		},
		[closeDialog, eventId, openDialog],
	);

	const columns = React.useMemo(
		() => generatePassBundleColumns({ onEdit: openEdit, onDelete }),
		[onDelete, openEdit],
	);

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	return (
		<div className="w-full">
			<PassBundleTableControl table={table} />

			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No pass bundles found",
								desc: "Create your first pass bundle to get started",
								icon: <PackageOpen />,
								action: (
									<Button onClick={openCreate}>Create Pass Bundle</Button>
								),
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<PassBundleItem
											key={row.id}
											bundle={row.original}
											onEdit={openEdit}
											onDelete={onDelete}
										/>
									))
							) : (
								<EmptyState
									title="No pass bundles found"
									description="Create your first pass bundle to get started"
									icon={<PackageOpen />}
									height="h-auto"
									action={
										<Button onClick={openCreate}>Create Pass Bundle</Button>
									}
								/>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<PassBundleItem
											bundle={row.original}
											onEdit={openEdit}
											onDelete={onDelete}
										/>
									</div>
								))
							) : (
								<EmptyState
									title="No pass bundles found"
									description="Create your first pass bundle to get started"
									icon={<PackageOpen />}
									height="h-auto"
									action={
										<Button onClick={openCreate}>Create Pass Bundle</Button>
									}
								/>
							)}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>
			<div className="pb-14 md:pb-4">
				<DataPagination table={table} />
			</div>
		</div>
	);
}
