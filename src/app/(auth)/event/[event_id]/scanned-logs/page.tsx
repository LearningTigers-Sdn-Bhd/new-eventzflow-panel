"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useEffect, useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { ScanLogDetailSheet } from "@/components/pages/scanned-log/scan-log-detail-sheet";
import { ScanLogExportDropdown } from "@/components/pages/scanned-log/scan-log-export-dropdown";
import { TicketScanButton } from "@/components/pages/scanned-log/ticket-scan-button";
import { columns } from "@/components/pages/scanned-log/ticket-scanned-log-columns";
import { DataTable } from "@/components/pages/scanned-log/ticket-scanned-log-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventStaff } from "@/lib/api/event/event-staff";
import { getScanLogs } from "@/lib/api/event/scan-log";
import type { ScannedLog } from "@/lib/api/event/scan-log/response";

function useDebounced<T>(value: T, delay = 300): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debounced;
}

interface ScannedLogsPageProps {
	params: Promise<{ event_id: string }>;
}

export default function ScannedLogsPage({ params }: ScannedLogsPageProps) {
	const { event_id } = use(params);
	const { user: currentUser } = useAuth();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [source, setSource] = useState("all");
	const [selectedRow, setSelectedRow] = useState<ScannedLog | null>(null);

	const debouncedSearch = useDebounced(search);

	const handleSearchChange = (value: string) => {
		setSearch(value);
		setPage(1);
	};

	const handleSourceChange = (value: string) => {
		setSource(value);
		setPage(1);
	};

	const {
		data: scanLogs,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["event", event_id, "scan-logs", page, debouncedSearch, source],
		queryFn: () =>
			getScanLogs({
				eventId: event_id,
				page,
				perPage: 25,
				q: debouncedSearch || undefined,
				source:
					source === "all"
						? undefined
						: (source as "staff_scan" | "self_check_in" | "kiosk"),
			}),
		placeholderData: (previous) => previous,
	});

	// Fetch event staff
	const { data: eventStaff } = useQuery({
		queryKey: ["event", event_id, "staff"],
		queryFn: () => getEventStaff({ eventId: event_id }),
	});

	// Check if current user has permission to scan tickets
	const canScanTickets = useMemo(() => {
		if (!currentUser || !eventStaff) return false;

		const userStaffAssignment = eventStaff.find(
			(staff: { id: string; eventRole: string }) =>
				String(staff.id) === String(currentUser.id),
		);

		if (!userStaffAssignment) return false;

		return (
			userStaffAssignment.eventRole === "event_admin" ||
			userStaffAssignment.eventRole === "event_team_member"
		);
	}, [currentUser, eventStaff]);

	const eventActions = useMemo(
		() => (
			<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
				<ScanLogExportDropdown
					eventId={event_id}
					q={debouncedSearch || undefined}
					source={
						source === "all"
							? undefined
							: (source as "staff_scan" | "self_check_in" | "kiosk")
					}
				/>
				<TicketScanButton
					eventId={event_id}
					canScanTickets={canScanTickets}
					onRefetch={refetch}
				/>
			</div>
		),
		[canScanTickets, event_id, refetch, debouncedSearch, source],
	);

	useSetEventActions(eventActions);

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading scanned logs..."
					description="Please wait while we fetch your scanned logs..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load scanned logs"
					description="We couldn't load scanned logs. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<>
					<DataTable
						columns={columns}
						data={scanLogs?.data ?? []}
						search={search}
						onSearchChange={handleSearchChange}
						source={source}
						onSourceChange={handleSourceChange}
						onRowClick={setSelectedRow}
						pagination={{
							pageIndex: (scanLogs?.pagination.current_page ?? 1) - 1,
							pageSize: scanLogs?.pagination.per_page ?? 25,
							pageCount: scanLogs?.pagination.total_pages ?? 0,
							totalCount: scanLogs?.pagination.total_count ?? 0,
							onPageChange: (pageIndex) => setPage(pageIndex + 1),
						}}
					/>
					<ScanLogDetailSheet
						eventId={event_id}
						row={selectedRow}
						onOpenChange={(open) => !open && setSelectedRow(null)}
					/>
				</>
			)}
		</div>
	);
}
