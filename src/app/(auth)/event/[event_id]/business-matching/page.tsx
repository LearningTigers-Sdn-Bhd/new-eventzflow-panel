"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Briefcase, Download, LinkIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { columns } from "@/components/pages/business-matching/columns";
import CreateSessionDialog from "@/components/pages/business-matching/create-session-dialog";
import { DataTable } from "@/components/pages/business-matching/data-table";
import ManageTagsDialog from "@/components/pages/business-matching/manage-tags-dialog";
import { Button } from "@/components/ui/button";
import {
	useBusinessMatchingEvents,
	useForceRefreshBusinessMatching,
} from "@/hooks/use-business-matching";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import {
	downloadBookingsReport,
	getHostProfile,
} from "@/lib/api/business-matching";
import { getEventById } from "@/lib/api/event";
import { cable } from "@/lib/cable";
import { useEventActionsStore } from "@/stores/event-actions-store";

export default function BusinessMatchingPage() {
	const params = useParams();
	const event_id =
		(Array.isArray(params.event_id) ? params.event_id[0] : params.event_id) ??
		"";
	console.log("Current event_id:", event_id); // Add this log
	const { data, isLoading, error, isFetching } =
		useBusinessMatchingEvents(event_id);
	const { mutateAsync: forceRefreshAsync } =
		useForceRefreshBusinessMatching(event_id);
	const queryClient = useQueryClient();
	const { openDialog } = useDialog();
	const setActions = useEventActionsStore((state) => state.setActions);
	const clearActions = useEventActionsStore((state) => state.clearActions);

	// Fetch event details to check for webhook URL
	const { data: event } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
		enabled: !!event_id,
	});

	const router = useRouter();
	const {
		isBusinessHost,
		canManageEvent,
		isOrgOwner,
		isOrganizer,
		isEventAdmin,
		isBusinessMatchingAdmin,
	} = useEventPermissions(event_id, event);

	// Matches the backend's manage_business_matching_tags? policy exactly
	// (org_owner || organizer || event_admin || business_matching_admin) —
	// broader than canManageEvent, which intentionally excludes organizers
	// for other event-management actions.
	const canManageTags =
		isOrgOwner || isOrganizer || isEventAdmin || isBusinessMatchingAdmin;
	// Matches manage_business_matching_sessions? — event admins/BM admins can
	// create sessions, in addition to whoever canManageEvent already covers.
	const canManageSessions = canManageEvent || isBusinessMatchingAdmin;

	// Check if logged-in host has completed their profile
	const { data: hostProfile } = useQuery({
		queryKey: ["host-profile", event_id],
		queryFn: () => getHostProfile(event_id),
		enabled: isBusinessHost,
	});

	const showProfileWarning = useMemo(() => {
		if (!isBusinessHost || !hostProfile) return false;
		return (
			!hostProfile.description ||
			!hostProfile.sourcing_intent ||
			!hostProfile.capabilities ||
			hostProfile.description.includes("Professional host available") ||
			hostProfile.sourcing_intent.includes(
				"Looking for strategic partnerships",
			) ||
			hostProfile.capabilities.includes("Expertise in technology solutions")
		);
	}, [isBusinessHost, hostProfile]);

	// Filter columns for business hosts
	const filteredColumns = useMemo(() => {
		if (isBusinessHost && !canManageSessions) {
			// Remove the 'host' column for business hosts
			return columns.filter(
				(col) => (col as { accessorKey: string }).accessorKey !== "host",
			);
		}
		return columns;
	}, [isBusinessHost, canManageSessions]);

	useEffect(() => {
		const lastRefreshKey = `last_bm_refresh_${event_id}`;
		const lastRefreshStr = localStorage.getItem(lastRefreshKey);
		const now = Date.now();
		const fifteenMinutes = 15 * 60 * 1000;

		if (
			!lastRefreshStr ||
			now - Number.parseInt(lastRefreshStr, 10) > fifteenMinutes
		) {
			console.log(
				"Auto-refreshing Business Matching data (expired or new session)",
			);
			forceRefreshAsync()
				.then(() => {
					localStorage.setItem(lastRefreshKey, now.toString());
				})
				.catch((err) => console.error("Auto-refresh failed", err));
		}
	}, [event_id, forceRefreshAsync]);

	useEffect(() => {
		const subscription = cable.subscriptions.create(
			{ channel: "BusinessMatchingChannel", event_id },
			{
				received(_data: unknown) {
					// Invalidate queries to refetch data
					queryClient.invalidateQueries({
						queryKey: ["business-matching-events", event_id],
					});
					queryClient.invalidateQueries({
						queryKey: ["business-matching-bookings"],
					});
					queryClient.invalidateQueries({
						queryKey: ["business-matching-availability"],
					});
					queryClient.invalidateQueries({
						queryKey: ["business-matching-detailed-slots"],
					});
				},
				connected() {
					console.log("Connected to BusinessMatchingChannel");
				},
				disconnected() {
					console.log("Disconnected from BusinessMatchingChannel");
				},
			},
		);

		return () => {
			subscription.unsubscribe();
		};
	}, [event_id, queryClient]);

	const handleGenerateReport = async (format: "pdf" | "xlsx") => {
		toast.info(`Generating ${format.toUpperCase()} report...`, {
			description: "Please wait while we compile the data.",
		});
		try {
			// Get the IDs of the currently displayed events
			const bmEventIds = data?.map((event) => event.id) || [];
			await downloadBookingsReport(event_id, format, bmEventIds);
			toast.success("Report downloaded successfully");
		} catch (error) {
			console.error("Report generation failed", error);
			toast.error("Failed to generate report");
		}
	};

	const handleCopyPublicLink = () => {
		const publicLink = `${window.location.origin}/event/${event_id}/book-meeting`;
		navigator.clipboard
			.writeText(publicLink)
			.then(() => {
				toast.success("Public booking link copied to clipboard!");
			})
			.catch((err) => {
				toast.error("Failed to copy link.", { description: err.message });
			});
	};

	const actionButtons = (
		<div className="flex items-center gap-2">
			{canManageSessions && (
				<Button
					onClick={() => {
						openDialog({
							component: CreateSessionDialog,
							props: {
								eventId: event_id,
								eventStartDate: event?.start_date,
								eventEndDate: event?.end_date,
							},
							config: {
								title: "Create Matchmaking Session",
								size: "lg",
							},
						});
					}}
					className="h-8 rounded-none md:h-9"
				>
					Create Session
				</Button>
			)}

			{canManageTags && (
				<Button
					variant="outline"
					onClick={() => {
						openDialog({
							component: ManageTagsDialog,
							props: { eventId: event_id },
							config: {
								title: "Manage Matching Tags",
								size: "lg",
							},
						});
					}}
					className="h-8 rounded-none md:h-9"
				>
					Manage Tags
				</Button>
			)}

			{data && data.length > 0 && (
				<>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleGenerateReport("xlsx")}
						className="h-8 rounded-none md:h-9"
					>
						<Download className="h-4 w-4 md:mr-2" />
						<span className="hidden lg:inline">Generate Report</span>
						<span className="hidden md:inline lg:hidden">Report</span>
					</Button>
					{!isBusinessHost && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleCopyPublicLink}
							className="h-8 rounded-none md:h-9"
						>
							<LinkIcon className="h-4 w-4 md:mr-2" />
							<span className="hidden lg:inline">Copy Invite Link</span>
							<span className="hidden md:inline lg:hidden">Invite Link</span>
						</Button>
					)}
				</>
			)}
		</div>
	);

	useEffect(() => {
		setActions(actionButtons);
		return () => clearActions();
	}, [actionButtons, setActions, clearActions]);

	if (isLoading || isFetching) {
		return (
			<LoadingState
				title="Loading events..."
				description="Please wait while we fetch business matching events."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load events"
				description="Could not fetch business matching events. Please try again later."
				icon={<Briefcase />}
			/>
		);
	}

	return (
		<div className="space-y-4">
			{showProfileWarning && (
				<div className="mb-4 flex flex-col items-start justify-between gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3.5 text-yellow-800 sm:flex-row sm:items-center dark:text-yellow-200">
					<div className="flex items-center gap-2.5">
						<AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
						<div className="text-sm">
							<span className="font-semibold">Complete Your Host Profile:</span>{" "}
							You haven't filled out your matching details (Bio, Sourcing
							Intent, or Capabilities) yet. Fill them out to get the best
							matchmaking matches.
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push(`/event/${event_id}/host-profile`)}
						className="h-8 shrink-0 self-end border-yellow-500/30 bg-yellow-500/20 text-yellow-900 hover:bg-yellow-500/30 sm:self-center dark:text-yellow-200"
					>
						Edit Profile
					</Button>
				</div>
			)}
			<DataTable columns={filteredColumns} data={data || []} />
		</div>
	);
}
