// src/components/pages/system-activity/system-activity-view.tsx

"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
	Activity,
	AlertTriangle,
	Bot,
	Bug,
	CheckCircle2,
	Clock,
	Eye,
	RefreshCw,
	RotateCw,
	Search,
	ShieldAlert,
	Sparkle,
	Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { UnusualBadge } from "@/components/pages/event-activity/activity-log-columns";
import {
	type DateRange,
	DateRangeFilter,
} from "@/components/pages/export-log/date-range-filter";
import {
	Alert,
	AlertContent,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { getAiIntegrations } from "@/lib/api/ai-integration";
import {
	analyzeSystemActivityError,
	getSystemActivity,
} from "@/lib/api/system-activity";
import type { SystemAuditRecord } from "@/lib/api/system-activity/types";
import {
	getAiSeverityClass,
	getActivityCategoryClass as getCategoryBadgeClass,
} from "@/lib/status-variants";
import { cn } from "@/lib/utils";

const STORAGE_KEY_INCLUDE_SUPERADMIN = "system-activity-include-superadmin";

const AI_LOADING_MESSAGES = [
	"Analyzing the error…",
	"Reviewing the request details…",
	"Working out a likely cause and fix…",
];

function getChanges(
	details: Record<string, unknown>,
): Record<string, { from: unknown; to: unknown }> {
	const changes = details?.changes;
	if (!changes || typeof changes !== "object") return {};
	return changes as Record<string, { from: unknown; to: unknown }>;
}

export function SystemActivityView() {
	const [activeTab, setActiveTab] = usePersistedState(
		"system-activity-active-tab",
		"overview",
	);
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [dateRange, setDateRange] = useState<DateRange>({
		from: null,
		to: null,
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [includeSuperadmin, setIncludeSuperadmin] = useState(false);
	const [selectedLog, setSelectedLog] = useState<SystemAuditRecord | null>(
		null,
	);
	const [selectedModelId, setSelectedModelId] = useState<string>("default");
	const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

	// Restore user preference across page refreshes
	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY_INCLUDE_SUPERADMIN);
			if (saved !== null) {
				setIncludeSuperadmin(saved === "true");
			}
		} catch {
			// ignore storage access errors
		}
	}, []);

	const handleToggleSuperadmin = (checked: boolean) => {
		setIncludeSuperadmin(checked);
		setCurrentPage(1);
		try {
			localStorage.setItem(STORAGE_KEY_INCLUDE_SUPERADMIN, String(checked));
		} catch {
			// ignore storage access errors
		}
	};

	const fromDate = dateRange.from
		? format(dateRange.from, "yyyy-MM-dd")
		: undefined;
	const toDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;
	const resultFilter = activeTab === "errors" ? "failed" : undefined;

	// Poll every 15 seconds to give a near-real-time pulse of user presence
	const { data, isLoading, isRefetching, refetch } = useQuery({
		queryKey: [
			"system-activity",
			categoryFilter,
			resultFilter,
			debouncedSearch,
			fromDate,
			toDate,
			currentPage,
			includeSuperadmin,
		],
		queryFn: () =>
			getSystemActivity({
				category: categoryFilter !== "all" ? categoryFilter : undefined,
				result: resultFilter,
				q: debouncedSearch || undefined,
				from_date: fromDate,
				to_date: toDate,
				page: currentPage,
				per_page: 25,
				include_superadmin: includeSuperadmin,
			}),
		refetchInterval: 15000,
	});

	const analyzeMutation = useMutation({
		mutationFn: ({ id, modelId }: { id: number; modelId?: number }) =>
			analyzeSystemActivityError(id, modelId),
		onSuccess: (result) => {
			setSelectedLog((prev) =>
				prev
					? {
							...prev,
							ai_diagnosis: result.ai_diagnosis,
							ai_diagnosed_at: result.ai_diagnosed_at,
						}
					: prev,
			);
		},
	});

	// Cycle a friendly status line while the model is thinking, instead of a static spinner
	useEffect(() => {
		if (!analyzeMutation.isPending) {
			setLoadingMessageIndex(0);
			return;
		}
		const interval = setInterval(() => {
			setLoadingMessageIndex((i) => (i + 1) % AI_LOADING_MESSAGES.length);
		}, 2200);
		return () => clearInterval(interval);
	}, [analyzeMutation.isPending]);

	const aiIntegrationsQuery = useQuery({
		queryKey: ["ai-integrations"],
		queryFn: getAiIntegrations,
		enabled: !!selectedLog && selectedLog.result === "failed",
		retry: false,
	});

	const aiModelOptions = useMemo(
		() =>
			(aiIntegrationsQuery.data ?? []).flatMap((integration) =>
				integration.models.map((model) => ({
					id: model.id,
					label: `${model.model_name || model.model_id} · ${integration.provider}`,
					isDefault: model.is_default,
				})),
			),
		[aiIntegrationsQuery.data],
	);

	const handleAnalyze = (id: number) => {
		const modelId =
			selectedModelId === "default" ? undefined : Number(selectedModelId);
		analyzeMutation.mutate({ id, modelId });
	};

	const deployment = data?.deployment_status;
	const activeUsers = data?.active_users || [];
	const auditLogs = data?.audit_logs?.records || [];
	const pagination = data?.audit_logs?.meta;

	// Render Compact Deployment Pulse Bar
	const renderDeploymentBanner = () => {
		if (!deployment) {
			return (
				<div className="flex animate-pulse items-center justify-between border bg-muted/20 px-3 py-2 sm:px-4 sm:py-2.5">
					<div className="h-4 w-1/3 bg-muted" />
					<div className="h-4 w-1/4 bg-muted" />
				</div>
			);
		}

		const isSafe = deployment.status === "safe";
		const isWarning = deployment.status === "warning";

		return (
			<div
				className={cn(
					"flex flex-col justify-between gap-2.5 border px-3 py-2.5 transition-all duration-200 sm:px-4 sm:py-2.5 md:flex-row md:items-center",
					isSafe &&
						"border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200",
					isWarning &&
						"border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-200",
					!isSafe &&
						!isWarning &&
						"border-rose-500/50 bg-rose-500/15 text-rose-950 dark:text-rose-200",
				)}
			>
				{/* Status & Reason */}
				<div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
					{isSafe && (
						<CheckCircle2 className="size-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
					)}
					{isWarning && (
						<AlertTriangle className="size-4.5 shrink-0 text-amber-600 dark:text-amber-400" />
					)}
					{!isSafe && !isWarning && (
						<ShieldAlert className="size-4.5 shrink-0 animate-pulse text-rose-600 dark:text-rose-400" />
					)}

					<div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
						<span className="font-bold text-sm tracking-tight">
							{deployment.label}
						</span>
						<span className="hidden opacity-60 sm:inline">&bull;</span>
						<span className="opacity-90">{deployment.message}</span>
					</div>
				</div>

				{/* Inline Key Stats */}
				<div className="flex flex-wrap items-center gap-2 self-start text-xs sm:self-auto">
					<div className="flex flex-wrap items-center gap-2 border bg-background/70 px-2.5 py-1 text-[11px] dark:bg-background/50">
						<div className="flex items-center gap-1">
							<span className="text-muted-foreground">Active (≤5m):</span>
							<span className="font-bold font-mono">
								{data?.active_users_summary.active_last_5m ?? 0}
							</span>
						</div>
						<span className="text-border">|</span>
						<div className="flex items-center gap-1">
							<span className="text-muted-foreground">Active (15m):</span>
							<span className="font-bold font-mono">
								{data?.active_users_summary.other_active_15m ?? 0}
							</span>
						</div>
						<span className="text-border">|</span>
						<div className="flex items-center gap-1">
							<span className="text-muted-foreground">Retention:</span>
							<span className="font-medium">90 Days</span>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderAuditTrail = (errorMode: boolean) => (
		<TabsContent
			value={errorMode ? "errors" : "audit"}
			className="m-0 space-y-3 pt-0"
		>
			{/* Category Filter Bar without redundant bulky card header */}
			<div className="flex flex-col gap-2 border bg-card p-2.5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap items-center gap-2">
					<div className="relative">
						<Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setCurrentPage(1);
							}}
							placeholder="Search by action or user..."
							className="h-7 w-[340px] rounded-none pl-7 text-xs"
						/>
					</div>
					<span className="font-medium text-muted-foreground text-xs">
						Filter Category:
					</span>
					<Select
						value={categoryFilter}
						onValueChange={(val) => {
							setCategoryFilter(val);
							setCurrentPage(1);
						}}
					>
						<SelectTrigger className="h-7 w-[160px] rounded-none text-xs sm:w-[180px]">
							<SelectValue placeholder="All Categories" />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							<SelectItem value="all">All Categories</SelectItem>
							<SelectItem value="ticketing">Ticketing & Check-in</SelectItem>
							<SelectItem value="business_matching">
								Business Matching
							</SelectItem>
							<SelectItem value="vouchers">Vouchers</SelectItem>
							<SelectItem value="lucky_draw">Lucky Draw</SelectItem>
							<SelectItem value="seating">Seating & Tables</SelectItem>
							<SelectItem value="events">Events</SelectItem>
							<SelectItem value="exhibitor">Exhibitor</SelectItem>
							<SelectItem value="auth">Authentication</SelectItem>
							<SelectItem value="general">General</SelectItem>
						</SelectContent>
					</Select>
					<span className="font-medium text-muted-foreground text-xs">
						Duration:
					</span>
					<DateRangeFilter
						value={dateRange}
						onChange={(range) => {
							setDateRange(range);
							setCurrentPage(1);
						}}
					/>
				</div>

				{pagination && pagination.total_count > 0 && (
					<div className="hidden font-mono text-[11px] text-muted-foreground sm:block">
						{pagination.total_count} {errorMode ? "errors" : "activities"}{" "}
						recorded
					</div>
				)}
			</div>

			{isLoading && !data ? (
				<div className="space-y-2 border p-4">
					<Skeleton className="h-8 w-full" />
					<Skeleton className="h-8 w-full" />
					<Skeleton className="h-8 w-full" />
				</div>
			) : auditLogs.length === 0 ? (
				<div className="border p-8 text-center text-muted-foreground">
					<p className="text-sm">
						{errorMode
							? "No errors recorded in the selected range."
							: "No activity logs recorded in the selected range."}
					</p>
				</div>
			) : (
				<>
					{/* Desktop Table View */}
					<div className="hidden overflow-x-auto border md:block">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Time</TableHead>
									<TableHead>User</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Endpoint Path</TableHead>
									<TableHead>IP Address</TableHead>
									{errorMode && <TableHead>Error</TableHead>}
								</TableRow>
							</TableHeader>
							<TableBody>
								{auditLogs.map((log) => (
									<TableRow
										key={log.id}
										className="cursor-pointer transition-colors hover:bg-muted/40"
										onClick={() => setSelectedLog(log)}
									>
										<TableCell className="whitespace-nowrap text-muted-foreground text-xs">
											<div>
												{format(
													new Date(log.created_at),
													"dd MMM yyyy, HH:mm:ss",
												)}
											</div>
											<div className="text-[10px] opacity-75">
												(
												{formatDistanceToNow(new Date(log.created_at), {
													addSuffix: true,
												})}
												)
											</div>
										</TableCell>
										<TableCell>
											<div className="font-medium text-xs">
												{log.user.full_name}
											</div>
											<div className="text-[11px] text-muted-foreground">
												{log.user.email}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col items-start gap-1">
												<span className="font-semibold text-foreground text-xs">
													{log.action_name}
												</span>
												{log.unusual && <UnusualBadge />}
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={cn(
													"rounded-none font-medium text-[10px] capitalize",
													getCategoryBadgeClass(log.category),
												)}
											>
												{log.category.replace(/_/g, " ")}
											</Badge>
										</TableCell>
										<TableCell className="font-mono text-muted-foreground text-xs">
											<span className="mr-1 font-semibold text-foreground/80">
												{log.http_method}
											</span>
											{log.path}
										</TableCell>
										<TableCell className="font-mono text-muted-foreground text-xs">
											{log.ip_address || "—"}
										</TableCell>
										{errorMode && (
											<TableCell
												className="max-w-[240px] truncate text-destructive text-xs"
												title={log.error_message ?? undefined}
											>
												{log.error_message || "—"}
											</TableCell>
										)}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Mobile Card View (Prevents Overflow) */}
					<div className="space-y-2 md:hidden">
						{auditLogs.map((log) => (
							<button
								type="button"
								key={log.id}
								onClick={() => setSelectedLog(log)}
								className="w-full cursor-pointer space-y-2 border bg-card p-3 text-left transition-colors hover:bg-muted/30"
							>
								<div className="flex items-start justify-between gap-2">
									<Badge
										variant="outline"
										className={cn(
											"rounded-none font-medium text-[10px] capitalize",
											getCategoryBadgeClass(log.category),
										)}
									>
										{log.category.replace(/_/g, " ")}
									</Badge>
									<span className="shrink-0 font-mono text-[10px] text-muted-foreground">
										{formatDistanceToNow(new Date(log.created_at), {
											addSuffix: true,
										})}
									</span>
								</div>

								<div>
									<div className="flex flex-wrap items-center gap-1.5">
										<span className="font-semibold text-foreground text-xs">
											{log.action_name}
										</span>
										{log.unusual && <UnusualBadge />}
									</div>
									<div className="mt-0.5 text-[11px] text-muted-foreground">
										<span>
											{log.user.full_name} ({log.user.email})
										</span>
									</div>
									{errorMode && log.error_message && (
										<div className="mt-1 text-[11px] text-destructive">
											{log.error_message}
										</div>
									)}
								</div>

								<div className="flex items-center justify-between gap-2 border-t pt-2 text-[11px]">
									<div className="max-w-[200px] truncate font-mono text-[10px] text-muted-foreground">
										<span className="mr-1 font-bold text-foreground">
											{log.http_method}
										</span>
										{log.path}
									</div>
									<div className="flex shrink-0 items-center font-medium text-[10px] text-muted-foreground">
										<Eye className="mr-1 size-3" />
										Details
									</div>
								</div>
							</button>
						))}
					</div>

					{/* Pagination Controls */}
					{pagination && pagination.total_pages > 1 && (
						<div className="flex flex-col items-center justify-between gap-2 border bg-card p-3 text-muted-foreground text-xs sm:flex-row">
							<div>
								Showing page {pagination.current_page} of{" "}
								{pagination.total_pages} ({pagination.total_count} total{" "}
								{errorMode ? "errors" : "activities"})
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									className="h-7 rounded-none text-xs"
									disabled={currentPage <= 1}
									onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
								>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-7 rounded-none text-xs"
									disabled={currentPage >= pagination.total_pages}
									onClick={() => setCurrentPage((p) => p + 1)}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</TabsContent>
	);

	return (
		<div className="p-0">
			{/* Page Header matching Item Categories pattern */}
			<div className="page-header mb-6">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={Activity}
						title="System Status & Active Users"
						description="Live user activity monitor & deployment audit."
					/>
				</div>
				<div className="flex w-full items-center gap-2 px-2 md:w-auto md:px-4">
					<Button
						variant="outline"
						onClick={() => refetch()}
						disabled={isRefetching}
						className="w-full shrink-0 rounded-none md:w-auto"
					>
						<RefreshCw
							className={cn("mr-2 size-4", isRefetching && "animate-spin")}
						/>
						{isRefetching ? "Refreshing..." : "Refresh Pulse"}
					</Button>
				</div>
			</div>

			{/* Main Content Area with standard padding */}
			<div className="space-y-4 px-2 md:px-4">
				{/* Deployment Status Bar on Overview, retention notice on Audit Trail / Error Logs */}
				{activeTab === "audit" || activeTab === "errors" ? (
					<Alert variant="info" appearance="light" size="sm">
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
				) : (
					renderDeploymentBanner()
				)}

				{/* Tabs */}
				<Tabs
					value={activeTab}
					onValueChange={(tab) => {
						setActiveTab(tab);
						setCurrentPage(1);
					}}
					className="space-y-3"
				>
					<div className="flex flex-col justify-between gap-2 border-b sm:flex-row sm:items-center">
						<TabsList className="h-auto w-auto justify-start space-x-2 rounded-none border-b-0 bg-transparent p-0">
							<TabsTrigger
								value="overview"
								className="rounded-none border-transparent border-b-2 px-3 py-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent sm:px-4 sm:text-sm"
							>
								<Users className="mr-1.5 size-4 sm:mr-2" />
								Currently Active Users ({activeUsers.length})
							</TabsTrigger>
							<TabsTrigger
								value="audit"
								className="rounded-none border-transparent border-b-2 px-3 py-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent sm:px-4 sm:text-sm"
							>
								<Clock className="mr-1.5 size-4 sm:mr-2" />
								Activity Audit Trail
							</TabsTrigger>
							<TabsTrigger
								value="errors"
								className="rounded-none border-transparent border-b-2 px-3 py-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent sm:px-4 sm:text-sm"
							>
								<Bug className="mr-1.5 size-4 sm:mr-2" />
								Error Logs
							</TabsTrigger>
						</TabsList>

						<div className="flex items-center gap-2 px-1 pb-2 sm:px-0 sm:pb-0">
							<label className="flex cursor-pointer select-none items-center gap-1.5 text-muted-foreground text-xs hover:text-foreground">
								<input
									type="checkbox"
									checked={includeSuperadmin}
									onChange={(e) => handleToggleSuperadmin(e.target.checked)}
									className="size-3.5 cursor-pointer rounded-none accent-primary"
								/>
								<span>Include superadmin actions</span>
							</label>
						</div>
					</div>

					{/* TAB 1: Currently Active Users */}
					<TabsContent value="overview" className="m-0 pt-0">
						{isLoading && !data ? (
							<div className="space-y-2 border p-4">
								<Skeleton className="h-8 w-full" />
								<Skeleton className="h-8 w-full" />
								<Skeleton className="h-8 w-full" />
							</div>
						) : activeUsers.length === 0 ? (
							<div className="border p-8 text-center text-muted-foreground">
								<CheckCircle2 className="mx-auto mb-2 size-10 text-emerald-500 opacity-80" />
								<p className="font-medium text-foreground">
									No users currently active
								</p>
								<p className="mt-1 text-xs">
									No other user activity detected in the past 15 minutes.
								</p>
							</div>
						) : (
							<>
								{/* Desktop Table View */}
								<div className="hidden overflow-x-auto border md:block">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>User / Email</TableHead>
												<TableHead>Role</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Latest Activity</TableHead>
												<TableHead>Last Active</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{activeUsers.map((user) => (
												<TableRow
													key={user.id}
													className={user.is_current_user ? "bg-muted/30" : ""}
												>
													<TableCell>
														<div className="flex items-center gap-2">
															<div className="flex size-7 items-center justify-center rounded-none bg-primary/10 font-bold text-primary text-xs uppercase">
																{user.full_name?.charAt(0) ||
																	user.email.charAt(0)}
															</div>
															<div>
																<div className="flex items-center gap-1.5 font-medium text-sm">
																	{user.full_name}
																	{user.is_current_user && (
																		<Badge
																			variant="outline"
																			className="h-4 rounded-none px-1.5 py-0 text-[10px]"
																		>
																			You
																		</Badge>
																	)}
																</div>
																<div className="text-muted-foreground text-xs">
																	{user.email}
																</div>
															</div>
														</div>
													</TableCell>
													<TableCell>
														<Badge
															variant="secondary"
															className="rounded-none font-normal text-xs capitalize"
														>
															{user.role
																? user.role.replace(/_/g, " ")
																: "User"}
														</Badge>
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-2">
															<span
																className={cn(
																	"size-2 rounded-full",
																	user.status === "active"
																		? "animate-pulse bg-emerald-500"
																		: "bg-amber-500",
																)}
															/>
															<span className="font-medium text-xs capitalize">
																{user.status === "active"
																	? "Active Now"
																	: "Idle"}
															</span>
														</div>
													</TableCell>
													<TableCell>
														{user.latest_activity ? (
															<div>
																<div className="font-medium text-sm">
																	{user.latest_activity.action_name}
																</div>
																<div className="font-mono text-muted-foreground text-xs">
																	<span className="font-semibold text-primary">
																		{user.latest_activity.http_method}
																	</span>{" "}
																	{user.latest_activity.path}
																</div>
															</div>
														) : (
															<span className="text-muted-foreground text-xs italic">
																Browsing session
															</span>
														)}
													</TableCell>
													<TableCell className="text-muted-foreground text-xs">
														{user.last_active_at ? (
															<div>
																{formatDistanceToNow(
																	new Date(user.last_active_at),
																	{ addSuffix: true },
																)}
															</div>
														) : (
															"—"
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>

								{/* Mobile Card View (Prevents Overflow) */}
								<div className="space-y-2 md:hidden">
									{activeUsers.map((user) => (
										<div
											key={user.id}
											className="space-y-2 border bg-card p-3 shadow-none"
										>
											<div className="flex items-start justify-between gap-2">
												<div className="flex items-center gap-2">
													<div className="flex size-7 shrink-0 items-center justify-center rounded-none bg-primary/10 font-bold text-primary text-xs uppercase">
														{user.full_name?.charAt(0) || user.email.charAt(0)}
													</div>
													<div className="min-w-0">
														<div className="flex items-center gap-1.5 font-semibold text-xs">
															<span className="truncate">{user.full_name}</span>
															{user.is_current_user && (
																<Badge
																	variant="outline"
																	className="h-3.5 shrink-0 rounded-none px-1 py-0 text-[9px]"
																>
																	You
																</Badge>
															)}
														</div>
														<div className="truncate text-[11px] text-muted-foreground">
															{user.email}
														</div>
													</div>
												</div>
												<Badge
													variant="secondary"
													className="shrink-0 rounded-none font-normal text-[10px] capitalize"
												>
													{user.role ? user.role.replace(/_/g, " ") : "User"}
												</Badge>
											</div>

											<div className="space-y-1.5 border-t pt-2 text-xs">
												<div className="flex items-center justify-between text-[11px]">
													<div className="flex items-center gap-1.5">
														<span
															className={cn(
																"size-2 rounded-full",
																user.status === "active"
																	? "animate-pulse bg-emerald-500"
																	: "bg-amber-500",
															)}
														/>
														<span className="font-medium capitalize">
															{user.status === "active" ? "Active Now" : "Idle"}
														</span>
													</div>
													<span className="text-[10px] text-muted-foreground">
														{user.last_active_at
															? formatDistanceToNow(
																	new Date(user.last_active_at),
																	{ addSuffix: true },
																)
															: "—"}
													</span>
												</div>

												{user.latest_activity ? (
													<div className="mt-1 rounded-none border bg-muted/40 p-2">
														<div className="font-medium text-foreground text-xs">
															{user.latest_activity.action_name}
														</div>
														<div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
															<span className="mr-1 font-bold text-primary">
																{user.latest_activity.http_method}
															</span>
															{user.latest_activity.path}
														</div>
													</div>
												) : (
													<div className="text-[11px] text-muted-foreground italic">
														Browsing session
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</>
						)}
					</TabsContent>

					{renderAuditTrail(false)}
					{renderAuditTrail(true)}
				</Tabs>
			</div>

			{/* Activity Details Sheet */}
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
							{selectedLog?.created_at &&
								format(
									new Date(selectedLog.created_at),
									"dd MMMM yyyy 'at' HH:mm:ss",
								)}
						</SheetDescription>
					</SheetHeader>

					{selectedLog && (
						<div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
							<Badge
								variant="outline"
								className={cn(
									"rounded-none capitalize",
									getCategoryBadgeClass(selectedLog.category),
								)}
							>
								{selectedLog.category.replace(/_/g, " ")}
							</Badge>
							{selectedLog.unusual && (
								<span className="ml-2 inline-block">
									<UnusualBadge />
								</span>
							)}

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

							<div>
								<div className="mb-1.5 font-semibold text-foreground text-xs uppercase tracking-wide">
									Request
								</div>
								<div className="space-y-1 border bg-muted/30 p-3 font-mono text-xs">
									<div className="break-all">
										<span className="mr-1 font-bold text-primary">
											{selectedLog.http_method}
										</span>
										{selectedLog.path}
									</div>
									<div className="text-[11px] text-muted-foreground">
										IP: {selectedLog.ip_address || "Unknown"}
									</div>
								</div>
							</div>

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

							{selectedLog.result === "failed" && (
								<div>
									<div className="mb-1.5 flex items-center justify-between gap-2">
										<div className="font-semibold text-primary text-xs uppercase tracking-wide">
											AI Diagnosis
										</div>
										{!analyzeMutation.isPending && (
											<div className="flex items-center gap-1.5">
												{aiModelOptions.length > 0 && (
													<Select
														value={selectedModelId}
														onValueChange={setSelectedModelId}
													>
														<SelectTrigger
															size="sm"
															className="h-7 w-40 rounded-none text-xs"
														>
															<SelectValue placeholder="Model" />
														</SelectTrigger>
														<SelectContent className="rounded-none">
															<SelectItem value="default">
																Default model
															</SelectItem>
															{aiModelOptions.map((model) => (
																<SelectItem
																	key={model.id}
																	value={String(model.id)}
																>
																	{model.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												)}
												<Button
													size="sm"
													variant="outline"
													className="h-7 gap-1.5 rounded-none text-xs"
													onClick={() => handleAnalyze(selectedLog.id)}
												>
													{selectedLog.ai_diagnosis ? (
														<RotateCw className="size-3.5" />
													) : (
														<Bot className="size-3.5" />
													)}
													{selectedLog.ai_diagnosis ? "Reanalyze" : "Analyze"}
												</Button>
											</div>
										)}
									</div>

									{analyzeMutation.isPending && (
										<div className="flex items-center gap-2 border border-primary/30 bg-primary/5 p-3 text-primary text-xs">
											<Sparkle className="size-3.5 shrink-0 animate-pulse" />
											{AI_LOADING_MESSAGES[loadingMessageIndex]}
										</div>
									)}

									{!analyzeMutation.isPending && analyzeMutation.isError && (
										<div className="border border-destructive/30 bg-destructive/5 p-3 text-destructive text-xs">
											{analyzeMutation.error instanceof Error
												? analyzeMutation.error.message
												: "Failed to analyze this error."}
										</div>
									)}

									{!analyzeMutation.isPending &&
										!analyzeMutation.isError &&
										!selectedLog.ai_diagnosis && (
											<div className="flex items-center gap-2 border border-dashed bg-muted/20 p-3 text-muted-foreground text-xs">
												<Bot className="size-3.5 shrink-0" />
												No analysis yet — run it to see the likely cause and a
												suggested fix.
											</div>
										)}

									{!analyzeMutation.isPending && selectedLog.ai_diagnosis && (
										<div className="space-y-2 border border-primary/30 bg-primary/5 p-3 text-xs">
											<div className="flex items-center justify-between">
												<span className="font-semibold uppercase tracking-wide">
													Likely cause
												</span>
												<Badge
													variant="outline"
													className={cn(
														"rounded-none capitalize",
														getAiSeverityClass(
															selectedLog.ai_diagnosis.severity,
														),
													)}
												>
													{selectedLog.ai_diagnosis.severity} severity
												</Badge>
											</div>
											<p>{selectedLog.ai_diagnosis.cause}</p>
											<div className="border-primary/20 border-t pt-2 font-semibold uppercase tracking-wide">
												Suggested fix
											</div>
											<p>{selectedLog.ai_diagnosis.suggested_fix}</p>
											{selectedLog.ai_diagnosed_at && (
												<p className="pt-1 text-[11px] text-muted-foreground">
													Analyzed{" "}
													{formatDistanceToNow(
														new Date(selectedLog.ai_diagnosed_at),
														{ addSuffix: true },
													)}
												</p>
											)}
										</div>
									)}
								</div>
							)}

							{selectedLog.result !== "failed" &&
								Object.keys(getChanges(selectedLog.details)).length > 0 && (
									<div>
										<div className="mb-1.5 font-semibold text-foreground text-xs uppercase tracking-wide">
											What changed
										</div>
										<div className="space-y-1.5">
											{Object.entries(getChanges(selectedLog.details)).map(
												([field, change]) => (
													<div key={field} className="border bg-muted/30 p-3">
														<div className="font-medium">{field}</div>
														<div className="text-muted-foreground text-xs">
															{String(change.from)} → {String(change.to)}
														</div>
													</div>
												),
											)}
										</div>
									</div>
								)}

							{Object.keys(selectedLog.details || {}).length > 0 && (
								<div>
									<div className="mb-1.5 font-semibold text-foreground text-xs uppercase tracking-wide">
										Sanitized Parameters / Context
									</div>
									<pre className="max-h-48 overflow-y-auto whitespace-pre-wrap break-all border bg-muted/50 p-3 font-mono text-[11px]">
										{JSON.stringify(selectedLog.details, null, 2)}
									</pre>
								</div>
							)}
						</div>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
