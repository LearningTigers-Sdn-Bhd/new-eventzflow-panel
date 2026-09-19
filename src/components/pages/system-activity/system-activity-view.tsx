// src/components/pages/system-activity/system-activity-view.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
	Activity,
	AlertTriangle,
	CheckCircle2,
	Clock,
	Eye,
	RefreshCw,
	ShieldAlert,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { IconTitle } from "@/components/ui/icon-heading";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { getSystemActivity } from "@/lib/api/system-activity";
import type { SystemAuditRecord } from "@/lib/api/system-activity/types";
import { getActivityCategoryClass as getCategoryBadgeClass } from "@/lib/status-variants";
import { cn } from "@/lib/utils";

const STORAGE_KEY_INCLUDE_SUPERADMIN = "system-activity-include-superadmin";

export function SystemActivityView() {
	const [activeTab, setActiveTab] = useState("overview");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [includeSuperadmin, setIncludeSuperadmin] = useState(false);
	const [selectedLog, setSelectedLog] = useState<SystemAuditRecord | null>(
		null,
	);

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

	// Poll every 15 seconds to give a near-real-time pulse of user presence
	const { data, isLoading, isRefetching, refetch } = useQuery({
		queryKey: [
			"system-activity",
			categoryFilter,
			currentPage,
			includeSuperadmin,
		],
		queryFn: () =>
			getSystemActivity({
				category: categoryFilter !== "all" ? categoryFilter : undefined,
				page: currentPage,
				per_page: 25,
				include_superadmin: includeSuperadmin,
			}),
		refetchInterval: 15000,
	});

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
							<span className="font-medium">3 Days</span>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="p-0">
			{/* Page Header matching Item Categories pattern */}
			<div className="page-header mb-6">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={Activity}
						title="System Status & Active Users"
						description="Live user activity monitor & 3-day deployment audit."
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
				{/* Deployment Status Bar */}
				{renderDeploymentBanner()}

				{/* Tabs */}
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
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
								3-Day Activity Audit Trail
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

					{/* TAB 2: 3-Day Activity Audit Trail */}
					<TabsContent value="audit" className="m-0 space-y-3 pt-0">
						{/* Category Filter Bar without redundant bulky card header */}
						<div className="flex items-center justify-between gap-2 border bg-card p-2.5">
							<div className="flex items-center gap-2">
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
										<SelectItem value="ticketing">
											Ticketing & Check-in
										</SelectItem>
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
							</div>

							{pagination && pagination.total_count > 0 && (
								<div className="hidden font-mono text-[11px] text-muted-foreground sm:block">
									{pagination.total_count} activities recorded
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
									No activity logs recorded in the selected range.
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
												<TableHead className="text-right">Details</TableHead>
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
														<div className="font-semibold text-foreground text-xs">
															{log.action_name}
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
													<TableCell className="text-right">
														<Button
															variant="ghost"
															size="icon"
															className="size-7 rounded-none"
															onClick={(e) => {
																e.stopPropagation();
																setSelectedLog(log);
															}}
														>
															<Eye className="size-3.5 text-muted-foreground" />
														</Button>
													</TableCell>
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
												<div className="font-semibold text-foreground text-xs">
													{log.action_name}
												</div>
												<div className="mt-0.5 text-[11px] text-muted-foreground">
													<span>
														{log.user.full_name} ({log.user.email})
													</span>
												</div>
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
											{pagination.total_pages} ({pagination.total_count} total
											activities)
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												className="h-7 rounded-none text-xs"
												disabled={currentPage <= 1}
												onClick={() =>
													setCurrentPage((p) => Math.max(1, p - 1))
												}
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
				</Tabs>
			</div>

			{/* Activity Details Modal */}
			<Dialog
				open={!!selectedLog}
				onOpenChange={(open) => !open && setSelectedLog(null)}
			>
				<DialogContent className="max-w-xl rounded-none">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 font-semibold text-base">
							<Activity className="size-4 text-primary" />
							{selectedLog?.action_name}
						</DialogTitle>
						<DialogDescription className="text-xs">
							Activity audit details recorded on{" "}
							{selectedLog?.created_at &&
								format(
									new Date(selectedLog.created_at),
									"dd MMMM yyyy 'at' HH:mm:ss",
								)}
						</DialogDescription>
					</DialogHeader>

					{selectedLog && (
						<div className="space-y-4 text-xs">
							{/* User Summary */}
							<div className="grid grid-cols-2 gap-2 border bg-muted/30 p-3">
								<div>
									<span className="block text-[11px] text-muted-foreground">
										User
									</span>
									<span className="font-semibold">
										{selectedLog.user.full_name}
									</span>
									<span className="block text-[11px] text-muted-foreground">
										{selectedLog.user.email}
									</span>
								</div>
								<div>
									<span className="block text-[11px] text-muted-foreground">
										Role
									</span>
									<Badge
										variant="secondary"
										className="rounded-none text-[10px] capitalize"
									>
										{selectedLog.user.role.replace(/_/g, " ")}
									</Badge>
									<span className="mt-1 block text-[11px] text-muted-foreground">
										IP: {selectedLog.ip_address || "Unknown"}
									</span>
								</div>
							</div>

							{/* Endpoint & Method */}
							<div>
								<span className="mb-1 block font-medium text-[11px] text-muted-foreground">
									HTTP Request
								</span>
								<div className="flex items-center gap-2 border bg-muted/40 p-2.5 font-mono text-[11px]">
									<Badge
										variant="outline"
										className="rounded-none font-bold text-[10px]"
									>
										{selectedLog.http_method}
									</Badge>
									<span className="break-all">{selectedLog.path}</span>
								</div>
							</div>

							{/* Parameters & Details */}
							<div>
								<span className="mb-1 block font-medium text-[11px] text-muted-foreground">
									Sanitized Parameters / Context
								</span>
								<pre className="max-h-48 overflow-y-auto whitespace-pre-wrap break-all border bg-muted/50 p-3 font-mono text-[11px]">
									{Object.keys(selectedLog.details || {}).length > 0
										? JSON.stringify(selectedLog.details, null, 2)
										: "No extra parameters recorded."}
								</pre>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
