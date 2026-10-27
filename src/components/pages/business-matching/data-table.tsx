"use client";

import {
	type ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Briefcase } from "lucide-react";
import * as React from "react";
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { useDialog } from "@/hooks/use-dialog";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import { BusinessMatchingItem } from "./business-matching-item";
import SessionActivityDialog from "./session-activity-dialog";

export type SessionFilter = "active" | "archived";

interface DataTableProps {
	columns: ColumnDef<BusinessMatchingEvent>[];
	data: BusinessMatchingEvent[];
	// Only passed when the viewer can see archived sessions.
	sessionFilter?: SessionFilter;
	onSessionFilterChange?: (filter: SessionFilter) => void;
}

const EMPTY_STATE = {
	title: "No sessions found",
	desc: "Business matching sessions will appear here.",
	icon: <Briefcase />,
};

export function DataTable({
	columns,
	data,
	sessionFilter = "active",
	onSessionFilterChange,
}: DataTableProps) {
	const { openDialog } = useDialog();
	const { permissions } = useEventSidebarContext();
	// Staff who manage sessions also get the seller's "As Buyer" tab.
	const canManageSession =
		permissions.canManageEvent || permissions.isBusinessMatchingAdmin;
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [selectedTag, setSelectedTag] = React.useState("all");
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const allUniqueTags = React.useMemo(
		() => Array.from(new Set(data.flatMap((s) => s.offering_tags ?? []))),
		[data],
	);

	const filteredData = React.useMemo(
		() =>
			selectedTag === "all"
				? data
				: data.filter((s) => s.offering_tags?.includes(selectedTag)),
		[data, selectedTag],
	);

	const openBookings = React.useCallback(
		(session: BusinessMatchingEvent) => {
			openDialog({
				component: SessionActivityDialog,
				props: {
					bmEventId: session.id,
					eventId: session.event_id,
					sellerUserId: canManageSession ? session.host?.id : undefined,
				},
				config: {
					title: `Bookings & Availability for ${session.title}`,
					size: "full",
				},
			});
		},
		[openDialog, canManageSession],
	);

	const table = useReactTable({
		data: filteredData,
		columns,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: { sorting, columnVisibility },
	});

	const sessionFilterControl: ControlConfig[] = onSessionFilterChange
		? [
				{
					label: "Sessions",
					columnId: "sessionFilter",
					type: "filter",
					data: [
						{ label: "Active", value: "active" },
						{ label: "Archived", value: "archived" },
					],
					customFilter: {
						value: sessionFilter,
						onChange: (value) => onSessionFilterChange(value as SessionFilter),
					},
				},
			]
		: [];

	const tagFilterControl: ControlConfig[] =
		allUniqueTags.length > 0
			? [
					{
						label: "Category",
						columnId: "tag",
						type: "filter",
						data: [
							{ label: "All", value: "all" },
							...allUniqueTags.map((tag) => ({ label: tag, value: tag })),
						],
						customFilter: { value: selectedTag, onChange: setSelectedTag },
					},
				]
			: [];

	const rows = table.getRowModel().rows;

	return (
		<div className="w-full">
			<BaseTableControl
				table={table}
				searchConfig={{
					searchConfig: {
						placeholder: "Search sessions or location...",
						enableCustomSearch: false,
						columns: ["title", "location"],
					},
				}}
				desktopConfig={{
					controlConfigs: [...sessionFilterControl, ...tagFilterControl],
				}}
				mobileConfig={{
					controlConfigs: [
						...sessionFilterControl.map((c) => ({ ...c, topPriority: true })),
						...tagFilterControl.map((c) => ({ ...c, topPriority: true })),
						{ label: "Title", columnId: "title", type: "sort" },
						{ label: "Bookings", columnId: "activity", type: "sort" },
					],
				}}
			/>

			<ResponsiveLayout>
				<DesktopView>
					<BaseTable
						table={table}
						emptyStateConfig={EMPTY_STATE}
						clickableRowConfig={{
							isEnabled: true,
							onRowClick: openBookings,
							excludeRowClickColumns: ["host", "actions"],
						}}
					/>
				</DesktopView>
				<MobileView>
					<div className="flex flex-col gap-2">
						{rows.length ? (
							rows.map((row) => (
								<BusinessMatchingItem key={row.id} event={row.original} />
							))
						) : (
							<EmptyState
								title={EMPTY_STATE.title}
								description={EMPTY_STATE.desc}
								icon={EMPTY_STATE.icon}
								height="h-auto"
							/>
						)}
					</div>
				</MobileView>
				<TabletView>
					<div className="grid grid-cols-2 gap-4">
						{rows.length ? (
							rows.map((row) => (
								<BusinessMatchingItem key={row.id} event={row.original} />
							))
						) : (
							<div className="col-span-2">
								<EmptyState
									title={EMPTY_STATE.title}
									description={EMPTY_STATE.desc}
									icon={EMPTY_STATE.icon}
									height="h-auto"
								/>
							</div>
						)}
					</div>
				</TabletView>
			</ResponsiveLayout>
			{/* Not the last block on the page (buyer bookings follow), so no
			    edge-bleed margins; hidden entirely when there's only one page. */}
			{table.getPageCount() > 1 && (
				<DataPagination
					table={table}
					showTotal={false}
					className="mx-0 mt-4 mb-0 border py-3 lg:py-3"
				/>
			)}
		</div>
	);
}
