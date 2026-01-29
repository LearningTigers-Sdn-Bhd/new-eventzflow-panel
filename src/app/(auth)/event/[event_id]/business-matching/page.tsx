"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Briefcase, Download, LinkIcon, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { columns } from "@/components/pages/business-matching/columns";
import { DataTable } from "@/components/pages/business-matching/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	useBusinessMatchingEvents,
	useForceRefreshBusinessMatching,
} from "@/hooks/use-business-matching";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { downloadBookingsReport } from "@/lib/api/business-matching";
import { getEventById, updateEvent } from "@/lib/api/event";
import { cable } from "@/lib/cable";

export default function BusinessMatchingPage() {
	const params = useParams();
	const event_id =
		(Array.isArray(params.event_id) ? params.event_id[0] : params.event_id) ??
		"";
	console.log("Current event_id:", event_id); // Add this log
	const { data, isLoading, error, isFetching } =
		useBusinessMatchingEvents(event_id);
	const {
		mutate: _forceRefresh,
		mutateAsync: forceRefreshAsync,
		isPending: isRefreshing,
	} = useForceRefreshBusinessMatching(event_id);
	const queryClient = useQueryClient();

	// Fetch event details to check for webhook URL
	const { data: event } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
		enabled: !!event_id,
	});

	// State for webhook URL input
	const [webhookUrlInput, setWebhookUrlInput] = useState("");

	// Update event mutation
	const updateEventMutation = useMutation({
		mutationFn: async (url: string) => {
			return await updateEvent(event_id, {
				business_matching_webhook_url: url,
			});
		},
		onSuccess: () => {
			toast.success("Webhook URL updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["event", event_id] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update webhook URL");
		},
	});

	const handleSaveWebhook = () => {
		if (!webhookUrlInput) {
			toast.error("Please enter a valid URL");
			return;
		}
		try {
			new URL(webhookUrlInput); // Basic validation
			updateEventMutation.mutate(webhookUrlInput);
		} catch {
			toast.error("Invalid URL format");
		}
	};

	const { isBusinessHost, canManageEvent } = useEventPermissions(event_id, event);

	// Filter columns for business hosts
	const filteredColumns = useMemo(() => {
		if (isBusinessHost && !canManageEvent) {
			// Remove the 'host' column for business hosts
			return columns.filter(
				(col) => (col as { accessorKey: string }).accessorKey !== "host",
			);
		}
		return columns;
	}, [isBusinessHost, canManageEvent]);

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

	const handleRefresh = async () => {
		toast.info("Refreshing events and clearing cache...", {
			description: "Fetching the latest data and reloading the page.",
		});

		try {
			await forceRefreshAsync();
			localStorage.setItem(
				`last_bm_refresh_${event_id}`,
				Date.now().toString(),
			);
			window.location.reload();
		} catch (error) {
			console.error("Manual refresh failed", error);
			toast.error("Refresh failed. Please try again.");

			// If refresh fails (e.g. invalid webhook), clear the cache so the UI shows the error state
			// instead of stale data.
			queryClient.removeQueries({ queryKey: ["business-matching-events"] });
			queryClient.removeQueries({ queryKey: ["business-matching-bookings"] });
			queryClient.removeQueries({ queryKey: ["business-matching-availability"] });
			queryClient.removeQueries({
				queryKey: ["business-matching-detailed-slots"],
			});
		}
	};

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

	const actionButtons = (
		<div className="flex items-center gap-2">
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

			<Button
				variant="outline"
				size="sm"
				onClick={handleRefresh}
				disabled={isRefreshing}
				className="h-8 rounded-none md:h-9"
			>
				<RefreshCw
					className={`h-4 w-4 md:mr-2 ${isRefreshing ? "animate-spin" : ""}`}
				/>
				<span className="hidden md:inline">Refresh</span>
			</Button>
		</div>
	);

	return (
		<div className="space-y-4">
			{canManageEvent && event && !event.business_matching_webhook_url && (
				<Card className="rounded-none border border-l-4 border-l-amber-500">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg font-medium flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-amber-500" />
							Setup Business Matching
						</CardTitle>
						<CardDescription>
							To enable real-time data synchronization for Business Matching, please provide the Webhook URL.
							(Contact your administrator if you don&apos;t have this URL).
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex w-full max-w-sm items-center space-x-2">
							<Input
								type="url"
								placeholder="https://webhook.example.com/bm"
								value={webhookUrlInput}
								onChange={(e) => setWebhookUrlInput(e.target.value)}
								disabled={updateEventMutation.isPending}
								className="rounded-none"
							/>
							<Button
								type="button"
								onClick={handleSaveWebhook}
								disabled={updateEventMutation.isPending}
								className="rounded-none"
							>
								{updateEventMutation.isPending ? "Saving..." : "Save URL"}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
			<DataTable
				columns={filteredColumns}
				data={data || []}
				actions={actionButtons}
			/>
		</div>
	);
}
