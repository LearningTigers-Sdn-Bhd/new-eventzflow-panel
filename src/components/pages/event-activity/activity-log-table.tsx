"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getCoreRowModel,
	type PaginationState,
	useReactTable,
} from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";
import { Clock, RefreshCw, SquareActivity, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import type { DateRange } from "@/components/pages/export-log/date-range-filter";
import {
	Alert,
	AlertContent,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useDebounce } from "@/hooks/use-debounce";
import { usePersistedState } from "@/hooks/use-persisted-state";
import {
	clearEventActivityLog,
	type EventActivityRecord,
	getEventActivityLog,
} from "@/lib/api/event-activity-log";
import { getActivityCategoryClass } from "@/lib/status-variants";
import { cn } from "@/lib/utils";
import { useEventActionsStore } from "@/stores/event-actions-store";
import { useUserSessionStore } from "@/stores/new-auth-store";
import {
	generateActivityLogColumns,
	ResultBadge,
	UnusualBadge,
} from "./activity-log-columns";
import { ActivityLogControl } from "./activity-log-control";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 100];

export function ActivityLogTable({ eventId }: { eventId: string }) {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("all");
	const [result, setResult] = useState("all");
	const [userId, setUserId] = useState("all");
	const [dateRange, setDateRange] = useState<DateRange>({
		from: null,
		to: null,
	});
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = usePersistedState(
		`event-${eventId}-activity-log-page-size`,
		DEFAULT_PAGE_SIZE,
	);
	const [selectedLog, setSelectedLog] = useState<EventActivityRecord | null>(
		null,
	);
	const setActions = useEventActionsStore((state) => state.setActions);
	const clearActions = useEventActionsStore((state) => state.clearActions);
	const debouncedSearch = useDebounce(search, 300);
	const currentUser = useUserSessionStore((state) => state.user);
	const queryClient = useQueryClient();

	const clearLogMutation = useMutation({
		mutationFn: () => clearEventActivityLog({ eventId }),
		onSuccess: () => {
			toast.success("Activity log cleared.");
			queryClient.invalidateQueries({ queryKey: ["event-activity", eventId] });
		},
		onError: () => {
			toast.error("Failed to clear activity log. Please try again.");
		},
	});

	const resetToFirstPage =
		<T,>(setter: (value: T) => void) =>
		(value: T) => {
			setter(value);
			setPageIndex(0);
		};

	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setPageIndex(0);
	};

	const fromDate = dateRange.from
		? format(dateRange.from, "yyyy-MM-dd")
		: undefined;
	const toDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

	const { data, isLoading, error, isFetching, refetch } = useQuery({
		queryKey: [
			"event-activity",
			eventId,
			category,
			result,
			userId,
			debouncedSearch,
			fromDate,
			toDate,
			pageIndex,
			pageSize,
		],
		queryFn: () =>
			getEventActivityLog({
				eventId,
				category: category === "all" ? undefined : category,
				result: result === "all" ? undefined : (result as "success" | "failed"),
				userId: userId === "all" ? undefined : userId,
				q: debouncedSearch || undefined,
				from_date: fromDate,
				to_date: toDate,
				page: pageIndex + 1,
				per_page: pageSize,
			}),
		placeholderData: (previous) => previous,
	});

	useEffect(() => {
		setActions(
			<>
				<Button
					variant="outline"
					type="button"
					onClick={() => refetch()}
					disabled={isFetching}
					className="rounded-none"
					aria-label="Refresh activity logs"
				>
					<RefreshCw
						className={cn("mr-2 size-4", isFetching && "animate-spin")}
					/>
					{isFetching ? "Refreshing..." : "Refresh"}
				</Button>
				{currentUser?.role === "org_owner" && (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="outline"
								type="button"
								className="rounded-none text-destructive hover:text-destructive"
								aria-label="Clear activity log"
							>
								<Trash2 className="mr-2 size-4" />
								Clear log
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent className="rounded-none">
							<AlertDialogHeader>
								<AlertDialogMedia className="rounded-none bg-destructive/10">
									<Trash2 className="text-destructive" />
								</AlertDialogMedia>
								<AlertDialogTitle>Clear activity log?</AlertDialogTitle>
								<AlertDialogDescription>
									This permanently deletes every activity log entry for this
									event. This cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel className="rounded-none">
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => clearLogMutation.mutate()}
									disabled={clearLogMutation.isPending}
									className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{clearLogMutation.isPending ? "Clearing..." : "Clear log"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</>,
		);

		return () => clearActions();
	}, [
		clearActions,
		clearLogMutation,
		currentUser?.role,
		isFetching,
		refetch,
		setActions,
	]);

	const records = data?.audit_logs.records ?? [];
	const meta = data?.audit_logs.meta;
	const columns = generateActivityLogColumns();

	const paginationState: PaginationState = { pageIndex, pageSize };

	const table = useReactTable({
		data: records,
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		manualFiltering: true,
		pageCount: meta?.total_pages ?? 0,
		onPaginationChange: (updater) => {
			const next =
				typeof updater === "function" ? updater(paginationState) : updater;
			setPageIndex(next.pageIndex);
		},
		state: { pagination: paginationState },
	});

	// A failed action's diff is only ever its intended effect — it never
	// actually applied, so don't show it as if it happened.
	const changes =
		selectedLog?.result === "failed"
			? {}
			: (selectedLog?.details?.changes ?? {});
	const resource = selectedLog?.details?.resource;

	return (
		<div className="w-full">
			<Alert variant="info" appearance="light" size="sm" className="mb-4">
				<AlertIcon>
					<Clock />
				</AlertIcon>
				<AlertContent>
					<AlertTitle>Activity logs are kept for 90 days</AlertTitle>
					<AlertDescription>
						Entries older than 90 days are automatically removed.
					</AlertDescription>
				</AlertContent>
			</Alert>

			<ActivityLogControl
				table={table}
				eventId={eventId}
				search={search}
				onSearchChange={resetToFirstPage(setSearch)}
				category={category}
				onCategoryChange={resetToFirstPage(setCategory)}
				result={result}
				onResultChange={resetToFirstPage(setResult)}
				userId={userId}
				onUserIdChange={resetToFirstPage(setUserId)}
				dateRange={dateRange}
				onDateRangeChange={resetToFirstPage(setDateRange)}
			/>

			{isLoading && !data ? (
				<LoadingState
					title="Loading activity..."
					description="Fetching the latest activity for this event."
				/>
			) : error ? (
				<ErrorState
					title="Unable to load activity"
					description="Something went wrong while loading the activity log."
				/>
			) : (
				<div className="min-h-[calc(100vh-420px)]">
					<ResponsiveLayout>
						<DesktopView>
							<BaseTable
								table={table}
								emptyStateConfig={{
									title: "No activity logs found",
									desc: "No activity logs recorded in the selected range.",
									icon: <SquareActivity />,
								}}
								clickableRowConfig={{
									isEnabled: true,
									onRowClick: (row) => setSelectedLog(row),
								}}
							/>
						</DesktopView>
						<MobileTabletView>
							{records.length > 0 ? (
								<div className="flex flex-col gap-2 border-t">
									{records.map((log) => (
										<button
											key={log.id}
											type="button"
											onClick={() => setSelectedLog(log)}
											className="w-full space-y-2 border bg-card p-3 text-left"
										>
											<div className="flex justify-between gap-2">
												<Badge
													variant="outline"
													className={cn(
														"rounded-none text-[10px] capitalize",
														getActivityCategoryClass(log.category),
													)}
												>
													{log.category.replace(/_/g, " ")}
												</Badge>
												<div className="flex items-center gap-2">
													<ResultBadge log={log} />
													<span className="text-muted-foreground text-xs">
														{formatDistanceToNow(new Date(log.created_at), {
															addSuffix: true,
														})}
													</span>
												</div>
											</div>
											<div className="flex flex-wrap items-center gap-1.5">
												<span className="font-semibold text-xs">
													{log.action_name}
												</span>
												{log.unusual && <UnusualBadge />}
											</div>
											<div className="text-muted-foreground text-xs">
												{log.user.full_name} ({log.user.email})
											</div>
										</button>
									))}
								</div>
							) : (
								<EmptyState
									title="No activity logs found"
									description="No activity logs recorded in the selected range."
									icon={<SquareActivity />}
									height="h-auto"
								/>
							)}
						</MobileTabletView>
					</ResponsiveLayout>
				</div>
			)}

			{meta && (
				<DataPagination
					table={table}
					totalRows={meta.total_count}
					pageSize={pageSize}
					onPageSizeChange={handlePageSizeChange}
					pageSizeOptions={PAGE_SIZE_OPTIONS}
				/>
			)}

			<Sheet
				open={!!selectedLog}
				onOpenChange={(open) => !open && setSelectedLog(null)}
			>
				<SheetContent className="w-full gap-0 p-0 sm:max-w-md">
					<SheetHeader className="shrink-0 border-b">
						<SheetTitle className="text-lg">
							{selectedLog?.action_name}
						</SheetTitle>
						<SheetDescription>
							{selectedLog &&
								format(
									new Date(selectedLog.created_at),
									"dd MMMM yyyy 'at' HH:mm:ss",
								)}
						</SheetDescription>
					</SheetHeader>
					{selectedLog && (
						<div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
							<div className="flex items-center gap-2">
								<Badge
									variant="outline"
									className={cn(
										"rounded-none capitalize",
										getActivityCategoryClass(selectedLog.category),
									)}
								>
									{selectedLog.category.replace(/_/g, " ")}
								</Badge>
								<ResultBadge log={selectedLog} />
								{selectedLog.unusual && <UnusualBadge />}
							</div>

							<div>
								<div className="mb-1.5 font-semibold text-foreground text-xs uppercase tracking-wide">
									Performed by
								</div>
								<div className="border bg-muted/30 p-3">
									<div className="font-medium">
										{selectedLog.user.full_name}
									</div>
									<div className="text-muted-foreground text-xs">
										{selectedLog.user.email} ·{" "}
										<span className="capitalize">
											{selectedLog.user.role.replace(/_/g, " ")}
										</span>
									</div>
								</div>
							</div>

							{resource && (
								<div>
									<div className="mb-1.5 font-semibold text-foreground text-xs uppercase tracking-wide">
										Affected {resource.type}
									</div>
									<div className="border bg-muted/30 p-3">
										{resource.attendee && (
											<div className="space-y-0.5">
												{resource.attendee.name && (
													<div className="font-medium">
														{resource.attendee.name}
													</div>
												)}
												{resource.attendee.email && (
													<div className="text-muted-foreground text-xs">
														{resource.attendee.email}
													</div>
												)}
											</div>
										)}
										<div
											className={cn(
												"break-all font-mono text-xs",
												resource.attendee &&
													"mt-2 border-t pt-2 text-muted-foreground",
											)}
										>
											{resource.attendee ? "Ticket ID" : "Reference ID"}: #
											{resource.id}
										</div>
									</div>
								</div>
							)}

							{Object.keys(changes).length > 0 && (
								<div>
									<div className="mb-1.5 font-semibold text-foreground text-xs uppercase tracking-wide">
										What changed
									</div>
									<div className="space-y-1.5">
										{Object.entries(changes).map(([field, change]) => (
											<div key={field} className="border bg-muted/30 p-3">
												<div className="font-medium">{field}</div>
												<div className="text-muted-foreground text-xs">
													{change.from} → {change.to}
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{selectedLog.result === "failed" && (
								<div>
									<div className="mb-1.5 font-semibold text-destructive text-xs uppercase tracking-wide">
										Why it failed
									</div>
									<div className="border border-destructive/30 bg-destructive/5 p-3 text-xs">
										{selectedLog.error_message ||
											"No further details available."}
									</div>
								</div>
							)}
						</div>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
