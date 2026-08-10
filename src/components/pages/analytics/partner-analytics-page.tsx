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
	Info,
	Receipt,
	ScanLine,
	Tag,
	Users,
} from "lucide-react";
import * as React from "react";
import { use } from "react";
import { StatsCard } from "@/components/admin-ui/analytic";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { DataPagination } from "@/components/data-pagination";
import { ErrorState, LoadingState } from "@/components/data-state";
import type {
	PartnerAnalyticsBreakdown,
	PartnerAnalyticsResponse,
} from "@/lib/api/event/analytics";
import { getExhibitorAnalytics } from "@/lib/api/event/analytics";

type PartnerMode = "exhibitor" | "vendor";

interface PartnerAnalyticsPageProps {
	params: Promise<{ event_id: string }>;
	expectedMode: PartnerMode;
}

const formatCurrency = (amount: number) =>
	new Intl.NumberFormat("ms-MY", {
		style: "currency",
		currency: "MYR",
	}).format(amount || 0);

const formatBoothType = (value: string | null) =>
	value ? value.replaceAll("_", " ") : "—";

const getPaymentStatus = (row: PartnerAnalyticsBreakdown) => {
	if (row.paidQuantity > 0 && row.unpaidQuantity > 0) return "mixed";
	if (row.paidQuantity > 0) return "paid";
	if (row.unpaidQuantity > 0) return "unpaid";
	return "none";
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
}: {
	data: PartnerAnalyticsBreakdown[];
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
				new Set(
					data
						.map((row) => row.zone)
						.filter((zone): zone is string => Boolean(zone)),
				),
			).sort((left, right) => left.localeCompare(right)),
		[data],
	);
	const pricingLabels = React.useMemo(
		() =>
			Array.from(new Set(data.map((row) => row.label))).sort((left, right) =>
				left.localeCompare(right),
			),
		[data],
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

function ExhibitorAnalytics({ data }: { data: PartnerAnalyticsResponse }) {
	return (
		<>
			<div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
				<StatsCard
					label="Total Exhibitors"
					value={data.totalPartners}
					Icon={Building2}
					variant="sky"
				/>
				<StatsCard
					label="Paid Exhibitors"
					value={data.paidPartners}
					Icon={BadgeCheck}
					subtitle="Includes waived and sponsored"
					variant="emerald"
				/>
				<StatsCard
					label="Unpaid Exhibitors"
					value={data.unpaidPartners}
					Icon={Clock3}
					variant="yellow"
				/>
				<StatsCard
					label="Collected Revenue"
					value={formatCurrency(data.collectedRevenue)}
					Icon={Banknote}
					subtitle="Cash payments only"
					variant="emerald"
				/>
				<StatsCard
					label="Pending Revenue"
					value={formatCurrency(data.pendingRevenue)}
					Icon={DollarSign}
					subtitle="Active unpaid booth value"
					variant="yellow"
				/>
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
				<PartnerBreakdownTable data={data.breakdown} />
			</section>
		</>
	);
}

function VendorAnalytics({ data }: { data: PartnerAnalyticsResponse }) {
	return (
		<div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
			<StatsCard
				label="Total Vendors"
				value={data.totalPartners}
				Icon={Building2}
				variant="sky"
			/>
			<StatsCard
				label="Event Leads"
				value={data.vendorMetrics.totalLeads}
				Icon={Users}
				variant="emerald"
			/>
			<StatsCard
				label="Voucher Sales"
				value={formatCurrency(data.vendorMetrics.voucherSales)}
				Icon={Receipt}
				variant="yellow"
			/>
			<StatsCard
				label="Voucher Redemptions"
				value={data.vendorMetrics.voucherRedemptions}
				Icon={ScanLine}
				variant="default"
			/>
		</div>
	);
}

export function PartnerAnalyticsPage({
	params,
	expectedMode,
}: PartnerAnalyticsPageProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);

	const { data, isLoading, error } = useQuery({
		queryKey: ["exhibitor-analytics", eventId],
		queryFn: () => getExhibitorAnalytics({ id: eventId }),
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

	const mode = data.mode || expectedMode;
	const isExhibitor = mode === "exhibitor";

	return (
		<div className="space-y-6">
			{isExhibitor ? (
				<ExhibitorAnalytics data={data} />
			) : (
				<VendorAnalytics data={data} />
			)}
		</div>
	);
}
