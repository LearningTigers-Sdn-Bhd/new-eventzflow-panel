"use client";

import { useQuery } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import {
	type DateRange,
	DateRangeFilter,
} from "@/components/pages/export-log/date-range-filter";
import { getEventStaff } from "@/lib/api/event/event-staff";
import type { EventActivityRecord } from "@/lib/api/event-activity-log";
import { useUserSessionStore } from "@/stores/new-auth-store";

const CATEGORY_OPTIONS = [
	{ value: "all", label: "All Categories" },
	{ value: "ticketing", label: "Ticketing & Check-in" },
	{ value: "visitors", label: "Visitors" },
	{ value: "events", label: "Events" },
	{ value: "event_setup", label: "Event Setup" },
	{ value: "seating", label: "Seating & Tables" },
	{ value: "exhibitor", label: "Exhibitor" },
	{ value: "payments", label: "Payments" },
	{ value: "sponsorships", label: "Sponsorships" },
	{ value: "business_matching", label: "Business Matching" },
	{ value: "vouchers", label: "Vouchers" },
	{ value: "lucky_draw", label: "Lucky Draw" },
	{ value: "wish_wall", label: "Wish Wall" },
	{ value: "certificates", label: "Certificates" },
	{ value: "general", label: "General" },
] as const;

const RESULT_OPTIONS = [
	{ value: "all", label: "All Results" },
	{ value: "success", label: "Success" },
	{ value: "failed", label: "Failed" },
] as const;

interface ActivityLogControlProps {
	table: Table<EventActivityRecord>;
	eventId: string;
	search: string;
	onSearchChange: (value: string) => void;
	category: string;
	onCategoryChange: (value: string) => void;
	result: string;
	onResultChange: (value: string) => void;
	userId: string;
	onUserIdChange: (value: string) => void;
	dateRange: DateRange;
	onDateRangeChange: (value: DateRange) => void;
}

export function ActivityLogControl({
	table,
	eventId,
	search,
	onSearchChange,
	category,
	onCategoryChange,
	result,
	onResultChange,
	userId,
	onUserIdChange,
	dateRange,
	onDateRangeChange,
}: ActivityLogControlProps) {
	const currentUser = useUserSessionStore((state) => state.user);
	const { data: staff } = useQuery({
		queryKey: ["event", eventId, "staff"],
		queryFn: () => getEventStaff({ eventId }),
	});

	// Non-owners never see the org owner's own rows (the backend excludes them
	// entirely), so offering that as a filter option would just be a dead end.
	const userOptions = [
		{ value: "all", label: "All Users" },
		...(staff ?? [])
			.filter(
				(member) =>
					currentUser?.role === "org_owner" ||
					member.globalRole !== "org_owner",
			)
			.map((member) => ({ value: member.id, label: member.full_name })),
	];

	const controlConfigs: ControlConfig[] = [
		{
			label: "Duration",
			columnId: "duration",
			type: "custom",
			render: () => (
				<DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
			),
		},
		{
			label: "Category",
			columnId: "category",
			type: "filter",
			data: CATEGORY_OPTIONS,
			customFilter: { value: category, onChange: onCategoryChange },
		},
		{
			label: "Result",
			columnId: "result",
			type: "filter",
			data: RESULT_OPTIONS,
			customFilter: { value: result, onChange: onResultChange },
		},
		{
			label: "User",
			columnId: "user",
			type: "filter",
			data: userOptions,
			customFilter: { value: userId, onChange: onUserIdChange },
		},
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search by action or user...",
					enableCustomSearch: false,
					controlled: { value: search, onChange: onSearchChange },
				},
			}}
			desktopConfig={{ controlConfigs }}
			mobileConfig={{ controlConfigs }}
		/>
	);
}
