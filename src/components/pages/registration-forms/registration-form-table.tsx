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
import { ClipboardList } from "lucide-react";
import { useParams } from "next/navigation";
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
import type { RegistrationForm } from "@/lib/api/registration-form";
import { CreateRegistrationFormForm } from "./create-registration-form-form";
import { generateColumns } from "./registration-form-columns";
import { DataControl } from "./registration-form-table-control";

interface RegistrationFormTableProps {
	data: RegistrationForm[];
}

export function RegistrationFormTable({ data }: RegistrationFormTableProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();

	const handleCreate = () => {
		openDialog({
			component: CreateRegistrationFormForm,
			props: {
				eventId,
				onClose: closeDialog,
			},
			config: {
				title: "Create Registration Form",
				description: "Add a new registration form for this event",
				size: "full",
				className: "rounded-none",
			},
		});
	};

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const columns = React.useMemo(() => generateColumns(), []);

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
		state: { sorting, columnFilters, columnVisibility },
	});

	const emptyAction = (
		<Button onClick={handleCreate}>Create Registration Form</Button>
	);

	return (
		<div className="w-full">
			<DataControl table={table} />

			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No registration forms found",
								desc: "Create your first registration form to get started",
								icon: <ClipboardList />,
								action: emptyAction,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div
										key={row.id}
										className="flex items-center justify-between rounded border p-4"
									>
										<div>
											<div className="font-medium">{row.original.name}</div>
											<div className="text-muted-foreground text-sm">
												/{row.original.slug}
											</div>
											<div className="mt-1 flex flex-wrap gap-1">
												{row.original.ticketTypes.map((tt) => (
													<span
														key={tt.id}
														className="rounded bg-secondary px-1.5 py-0.5 text-xs"
													>
														{tt.name}
													</span>
												))}
											</div>
										</div>
										<div className="flex justify-center">
											{/* Actions handled by column */}
										</div>
									</div>
								))
							) : (
								<EmptyState
									title="No registration forms found"
									description="Create your first registration form to get started"
									icon={<ClipboardList />}
									height="h-auto"
									action={emptyAction}
								/>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1 rounded border p-4">
										<div className="font-medium">{row.original.name}</div>
										<div className="text-muted-foreground text-sm">
											/{row.original.slug}
										</div>
									</div>
								))
							) : (
								<EmptyState
									title="No registration forms found"
									description="Create your first registration form to get started"
									icon={<ClipboardList />}
									height="h-auto"
									action={emptyAction}
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
