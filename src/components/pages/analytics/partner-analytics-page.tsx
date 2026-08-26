"use client";

import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	type Table,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	BadgeCheck,
	Banknote,
	Building2,
	Clock3,
	DollarSign,
	HandCoins,
	Info,
	Tag,
} from "lucide-react";
import * as React from "react";
import { use, useState } from "react";
import { StatsCard, TimeSeriesChart } from "@/components/admin-ui/analytic";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { DataPagination } from "@/components/data-pagination";
import { ErrorState, LoadingState } from "@/components/data-state";
import { ExhibitorExportDropdown } from "@/components/pages/analytics/exhibitor-export-dropdown";
import { prepareExhibitorReportData } from "@/components/pdf-reports";
import {
	EventDateFilter,
	type EventDateSelection,
	getAnalyticsParamsFromSelection,
} from "@/components/ui/event-date-filter";
import { getEventById } from "@/lib/api/event";
import type {
	PartnerAnalyticsBreakdown,
	PartnerAnalyticsFilterOptions,
	PartnerAnalyticsResponse,
} from "@/lib/api/event/analytics";
import {
	getExhibitorAnalytics,
	getTimeSeries,
} from "@/lib/api/event/analytics";

interface PartnerAnalyticsPageProps {
	params: Promise<{ event_id: string }>;
}

const formatCurrency = (amount: number) =>
	new Intl.NumberFormat("ms-MY", {
		style: "currency",
		currency: "MYR",
	}).format(amount || 0);

const formatBoothType = (value: string | null) =>
	value ? value.replaceAll("_", " ") : "—";

const getPaymentStatus = (row: PartnerAnalyticsBreakdown) => {
	const statusesPresent = [
		row.paidQuantity > 0 && "paid",
		row.depositQuantity > 0 && "deposit",
		row.unpaidQuantity > 0 && "unpaid",
	].filter(Boolean);
	if (statusesPresent.length > 1) return "mixed";
	return statusesPresent[0] || "none";
};

const partnerBreakdownColumns: ColumnDef<PartnerAnalyticsBreakdown>[] = [
	{
		accessorKey: "label",
		id: "label",
		size: 240,
		filterFn: (row, id, value) => !value || row.getValue(id) === value,
		header: () => <div className="font-medium">Booth Type</div>,
		cell: ({ row }) => (
			<div className="w-full">
				<div className="font-medium">{row.original.label}</div>
				{row.original.packageLabel && (
					<div className="text-muted-foreground text-xs">
						{row.original.packageLabel}
					</div>
				)}
				<div className="text-muted-foreground text-xs capitalize">
					{formatBoothType(row.original.boothType)}
				</div>
			</div>
		),
	},
	{
		accessorFn: (row) => row.zone ?? "",
		id: "zone",
		size: 150,
		filterFn: (row, id, value) => {
			if (!value) return true;
			if (value === "__unassigned__") return !row.original.zone;
			return row.getValue(id) === value;
		},
		header: () => <div className="font-medium">Zone</div>,
		cell: ({ row }) => (
			<div className="w-full text-muted-foreground">
				{row.original.zone || "Unassigned"}
			</div>
		),
	},
	{
		accessorKey: "bookedQuantity",
		id: "booked_quantity",
		size: 100,
		header: ({ column }) => (
			<SortableHeader
				column={column}
				label="Booked"
				className="w-full justify-start"
			/>
		),
		cell: ({ row }) => (
			<div className="w-full text-left">{row.original.bookedQuantity}</div>
		),
	},
	{
		accessorKey: "paidQuantity",
		id: "paid_quantity",
		size: 90,
		header: ({ column }) => (
			<SortableHeader
				column={column}
				label="Paid"
				className="w-full justify-start"
			/>
		),
		cell: ({ row }) => (
			<div className="w-full text-left">{row.original.paidQuantity}</div>
		),
	},
	{
		accessorKey: "depositQuantity",
		id: "deposit_quantity",
		size: 90,
		header: ({ column }) => (
			<SortableHeader
				column={column}
				label="Deposit"
				className="w-full justify-start"
			/>
		),
		cell: ({ row }) => (
			<div className="w-full text-left">{row.original.depositQuantity}</div>
		),
	},
	{
		accessorKey: "unpaidQuantity",
		id: "unpaid_quantity",
		size: 100,
		header: ({ column }) => (
			<SortableHeader
				column={column}
				label="Unpaid"
				className="w-full justify-start"
			/>
		),
		cell: ({ row }) => (
			<div className="w-full text-left">{row.original.unpaidQuantity}</div>
		),
	},
	{
		accessorKey: "collectedRevenue",
		id: "collected_revenue",
		size: 150,
		header: ({ column }) => (
			<SortableHeader
				column={column}
				label="Collected"
				className="w-full justify-start"
			/>
		),
		cell: ({ row }) => (
			<div className="w-full text-left">
				{formatCurrency(row.original.collectedRevenue)}
			</div>
		),
	},
	{
		accessorKey: "pendingRevenue",
		id: "pending_revenue",
		size: 150,
		header: ({ column }) => (
			<SortableHeader
				column={column}
				label="Pending"
				className="w-full justify-end"
			/>
		),
		cell: ({ row }) => (
			<div className="w-full text-right">
				{formatCurrency(row.original.pendingRevenue)}
			</div>
		),
	},
	{
		accessorFn: (row) => row.packageLabel ?? "",
		id: "package_label",
		enableHiding: true,
		header: () => null,
		cell: () => null,
	},
	{
		accessorFn: (row) => row.boothType ?? "",
		id: "booth_type",
		enableHiding: true,
		filterFn: (row, id, value) => !value || row.getValue(id) === value,
		header: () => null,
		cell: () => null,
	},
	{
		accessorFn: getPaymentStatus,
		id: "payment_status",
		enableHiding: true,
		filterFn: (row, _id, value) => {
			if (value === "paid") return row.original.paidQuantity > 0;
			if (value === "deposit") return row.original.depositQuantity > 0;
			if (value === "unpaid") return row.original.unpaidQuantity > 0;
			return true;
		},
		header: () => null,
		cell: () => null,
	},
];

interface PartnerBreakdownDataControlProps {
	table: Table<PartnerAnalyticsBreakdown>;
	pricingLabels: string[];
	zones: string[];
	boothTypes: string[];
	hasUnassignedZone: boolean;
}

function PartnerBreakdownDataControl({
	table,
	pricingLabels,
	zones,
	boothTypes,
	hasUnassignedZone,
}: PartnerBreakdownDataControlProps) {
	const boothPricingFilter: ControlConfig = {
		label: "Booth Pricing",
		columnId: "label",
		type: "filter",
		data: [
			{ label: "All Pricing", value: "all" },
			...pricingLabels.map((label) => ({ label, value: label })),
		],
	};
	const zoneFilter: ControlConfig = {
		label: "Zone",
		columnId: "zone",
		type: "filter",
		data: [
			{ label: "All Zones", value: "all" },
			...zones.map((zone) => ({ label: zone, value: zone })),
			...(hasUnassignedZone
				? [{ label: "Unassigned", value: "__unassigned__" }]
				: []),
		],
	};
	const boothTypeFilter: ControlConfig = {
		label: "Booth Type",
		columnId: "booth_type",
		type: "filter",
		data: [
			{ label: "All Types", value: "all" },
			...boothTypes.map((type) => ({
				label: formatBoothType(type),
				value: type,
			})),
		],
	};
	const paymentFilter: ControlConfig = {
		label: "Payment",
		columnId: "payment_status",
		type: "filter",
		data: [
			{ label: "All Statuses", value: "all" },
			{ label: "Paid", value: "paid" },
			{ label: "Deposit", value: "deposit" },
			{ label: "Unpaid", value: "unpaid" },
		],
	};
	const desktopControls: ControlConfig[] = [
		...(pricingLabels.length > 0 ? [boothPricingFilter] : []),
		...(zones.length > 0 ? [zoneFilter] : []),
		boothTypeFilter,
		paymentFilter,
	];
	const mobileControls: ControlConfig[] = [
		...(pricingLabels.length > 0
			? [{ ...boothPricingFilter, topPriority: true }]
			: []),
		...(zones.length > 0 ? [zoneFilter] : []),
		boothTypeFilter,
		paymentFilter,
		{ label: "Pricing", columnId: "label", type: "sort" },
		{ label: "Booked", columnId: "booked_quantity", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search package, zone...",
					enableCustomSearch: false,
					columns: ["package_label", "zone", "booth_type"],
				},
			}}
			desktopConfig={{
				controlConfigs: desktopControls,
			}}
			mobileConfig={{
				controlConfigs: mobileControls,
			}}
		/>
	);
}

function PartnerBreakdownTable({
	data,
	filterOptions,
}: {
	data: PartnerAnalyticsBreakdown[];
	filterOptions?: PartnerAnalyticsFilterOptions;
}) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({
			package_label: false,
			booth_type: false,
			payment_status: false,
		});

	const table = useReactTable({
		data,
		columns: partnerBreakdownColumns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: { sorting, columnFilters, columnVisibility },
	});

	const zones = React.useMemo(
		() =>
			Array.from(
				new Set([
					...(filterOptions?.zones ?? []),
					...data
						.map((row) => row.zone)
						.filter((zone): zone is string => Boolean(zone)),
				]),
			).sort((left, right) => left.localeCompare(right)),
		[data, filterOptions?.zones],
	);
	const pricingLabels = React.useMemo(
		() =>
			Array.from(
				new Set([
					...(filterOptions?.boothPricing ?? []),
					...data.map((row) => row.label),
				]),
			).sort((left, right) => left.localeCompare(right)),
		[data, filterOptions?.boothPricing],
	);
	const boothTypes = React.useMemo(
		() =>
			Array.from(
				new Set(
					data
						.map((row) => row.boothType)
						.filter((type): type is string => Boolean(type)),
				),
			).sort((left, right) => left.localeCompare(right)),
		[data],
	);

	return (
		<div className="space-y-4">
			<PartnerBreakdownDataControl
				table={table}
				pricingLabels={pricingLabels}
				zones={zones}
				boothTypes={boothTypes}
				hasUnassignedZone={data.some((row) => !row.zone)}
			/>
			<BaseTable
				table={table}
				emptyStateConfig={{
					title: data.length
						? "No matching booth pricing"
						: "No booth bookings yet",
					desc: data.length
						? "Try a different search term or filter."
						: "Exhibitor booth bookings will appear here.",
					icon: <Tag />,
				}}
			/>
			<DataPagination table={table} />
		</div>
	);
}

function ExhibitorAnalytics({
	data,
	eventId,
	eventName,
	eventStartDate,
	eventEndDate,
	dateSelection,
	onDateSelectionChange,
}: {
	data: PartnerAnalyticsResponse;
	eventId: number;
	eventName: string;
	eventStartDate: string;
	eventEndDate: string;
	dateSelection: EventDateSelection;
	onDateSelectionChange: (selection: EventDateSelection) => void;
}) {
	const analyticsParams = getAnalyticsParamsFromSelection(dateSelection);

	const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
		queryKey: [
			"event",
			eventId,
			"analytics",
			"exhibitor_bookings",
			dateSelection,
		],
		queryFn: () =>
			getTimeSeries({
				eventId,
				metric: "exhibitor_bookings",
				groupBy: analyticsParams.groupBy,
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
			}),
	});
	const { data: revenueData, isLoading: revenueLoading } = useQuery({
		queryKey: [
			"event",
			eventId,
			"analytics",
			"exhibitor_revenue",
			dateSelection,
		],
		queryFn: () =>
			getTimeSeries({
				eventId,
				metric: "exhibitor_revenue",
				groupBy: analyticsParams.groupBy,
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
			}),
	});

	const toChartData = (points?: { period: string; value: number }[]) =>
		points?.map((p) => ({ date: p.period, value: p.value })) ?? [];

	const reportData = React.useMemo(
		() =>
			prepareExhibitorReportData(
				{
					id: String(eventId),
					name: eventName,
					start_date: eventStartDate,
					end_date: eventEndDate,
				},
				data,
				{
					bookings: toChartData(bookingsData?.data),
					revenue: toChartData(revenueData?.data),
				},
			),
		[
			data,
			eventId,
			eventName,
			eventStartDate,
			eventEndDate,
			bookingsData,
			revenueData,
		],
	);

	return (
		<>
			<div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
				<StatsCard
					label="Total Exhibitors"
					value={data.totalPartners}
					Icon={Building2}
				/>
				<StatsCard
					label="Paid Exhibitors"
					value={data.paidPartners}
					Icon={BadgeCheck}
				/>
				<StatsCard
					label="Deposit Exhibitors"
					value={data.depositPartners}
					Icon={HandCoins}
				/>
				<StatsCard
					label="Unpaid Exhibitors"
					value={data.unpaidPartners}
					Icon={Clock3}
				/>
				<StatsCard
					label="Collected Revenue"
					value={formatCurrency(data.collectedRevenue)}
					Icon={Banknote}
				/>
				<StatsCard
					label="Pending Revenue"
					value={formatCurrency(data.pendingRevenue)}
					Icon={DollarSign}
				/>
			</div>

			<div className="mb-12 space-y-4 border-y border-dashed">
				<div className="flex items-center justify-between px-4 pt-4">
					<h3 className="font-medium text-sm">Analytics Trends</h3>
					<div className="flex items-center gap-2">
						<EventDateFilter
							eventStartDate={eventStartDate}
							eventEndDate={eventEndDate}
							value={dateSelection}
							onChange={onDateSelectionChange}
						/>
						<ExhibitorExportDropdown
							eventId={eventId}
							reportData={reportData}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<TimeSeriesChart
						title="Booth Bookings"
						description="Exhibitor booth bookings over time"
						data={toChartData(bookingsData?.data)}
						isLoading={bookingsLoading}
						color="var(--chart-1)"
						icon={<Building2 className="h-4 w-4" />}
						variant="bar"
					/>
					<TimeSeriesChart
						title="Booth Revenue"
						description="Collected exhibitor revenue over time"
						data={toChartData(revenueData?.data)}
						isLoading={revenueLoading}
						color="var(--chart-3)"
						icon={<Banknote className="h-4 w-4" />}
					/>
				</div>
			</div>

			<section className="space-y-4">
				<div className="flex flex-col gap-3 rounded-none border border-dashed bg-muted/30 p-4">
					<div className="flex items-start gap-3">
						<Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
						<div className="space-y-1">
							<p className="font-medium text-sm">Booth Pricing Breakdown</p>
							<p className="text-muted-foreground text-sm">
								Sales are separated from visitor and participant analytics. Paid
								status includes paid, waived, and sponsored kits. Waived and
								sponsored kits do not add cash to Collected Revenue.
							</p>
						</div>
					</div>
				</div>
				<PartnerBreakdownTable
					data={data.breakdown}
					filterOptions={data.filterOptions}
				/>
			</section>
		</>
	);
}

export function PartnerAnalyticsPage({ params }: PartnerAnalyticsPageProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);
	const [dateSelection, setDateSelection] = useState<EventDateSelection>({
		type: "all_time",
	});

	const { data, isLoading, error } = useQuery({
		queryKey: ["exhibitor-analytics", eventId],
		queryFn: () => getExhibitorAnalytics({ id: eventId }),
		enabled: Number.isInteger(eventId) && eventId > 0,
	});
	const { data: event } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(event_id),
		enabled: Number.isInteger(eventId) && eventId > 0,
	});

	if (!Number.isInteger(eventId) || eventId <= 0) {
		return (
			<ErrorState
				title="Invalid event ID"
				description="We couldn't identify the event for this analytics report."
			/>
		);
	}

	if (isLoading) {
		return <LoadingState title="Loading partner analytics..." />;
	}

	if (error || !data) {
		return (
			<ErrorState
				title="Partner analytics unavailable"
				description="We couldn't load this event's partner analytics. Please try again."
			/>
		);
	}

	return (
		<div className="space-y-6">
			<ExhibitorAnalytics
				data={data}
				eventId={eventId}
				eventName={event?.title ?? "Event"}
				eventStartDate={event?.start_date ?? new Date().toISOString()}
				eventEndDate={event?.end_date ?? new Date().toISOString()}
				dateSelection={dateSelection}
				onDateSelectionChange={setDateSelection}
			/>
		</div>
	);
}
