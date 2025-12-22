"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Briefcase, RefreshCw, Download, LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingState, ErrorState } from "@/components/data-state";
import { DataTable } from "@/components/pages/business-matching/data-table";
import { columns } from "@/components/pages/business-matching/columns";
import { useBusinessMatchingEvents, useForceRefreshBusinessMatching } from "@/hooks/use-business-matching";
import { downloadBookingsReport } from "@/lib/api/business-matching";
import { cable } from "@/lib/cable";
import { Button } from "@/components/ui/button";
import { useEventPermissions } from "@/hooks/use-event-permissions"; // Import the hook

export default function BusinessMatchingPage() {
	const params = useParams();
	const event_id = Array.isArray(params.event_id) ? params.event_id[0] : params.event_id;
	console.log("Current event_id:", event_id); // Add this log
	const { data, isLoading, error, isFetching } = useBusinessMatchingEvents(event_id);
	const { mutate: forceRefresh, mutateAsync: forceRefreshAsync, isPending: isRefreshing } = useForceRefreshBusinessMatching(event_id);
	const queryClient = useQueryClient();
    const { isBusinessHost, canManageEvent } = useEventPermissions(event_id);

    // Filter columns for business hosts
    const filteredColumns = useMemo(() => {
        if (isBusinessHost && !canManageEvent) {
            // Remove the 'host' column for business hosts
            return columns.filter(col => (col as any).accessorKey !== "host");
        }
        return columns;
    }, [isBusinessHost, canManageEvent]);

    useEffect(() => {
        const lastRefreshKey = `last_bm_refresh_${event_id}`;
        const lastRefreshStr = localStorage.getItem(lastRefreshKey);
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;

        if (!lastRefreshStr || (now - parseInt(lastRefreshStr) > fifteenMinutes)) {
            console.log("Auto-refreshing Business Matching data (expired or new session)");
            forceRefreshAsync().then(() => {
                 localStorage.setItem(lastRefreshKey, now.toString());
            }).catch(err => console.error("Auto-refresh failed", err));
        }
    }, [event_id, forceRefreshAsync]);

	useEffect(() => {
		const subscription = cable.subscriptions.create(
			{ channel: "BusinessMatchingChannel", event_id },
			{
				received(data: any) {
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
			}
		);

		return () => {
			subscription.unsubscribe();
		};
	}, [event_id, queryClient]);

	const handleRefresh = async () => {
		toast.info("Refreshing events and clearing cache...", {
			description: "Fetching the latest data and reloading the page.",
		});

        // Clear frontend cache
        queryClient.removeQueries({ queryKey: ["business-matching-events"] });
        queryClient.removeQueries({ queryKey: ["business-matching-bookings"] });
        queryClient.removeQueries({ queryKey: ["business-matching-availability"] });
        queryClient.removeQueries({ queryKey: ["business-matching-detailed-slots"] });

        try {
		    await forceRefreshAsync();
            localStorage.setItem(`last_bm_refresh_${event_id}`, Date.now().toString());
            window.location.reload();
        } catch (error) {
            console.error("Manual refresh failed", error);
            toast.error("Refresh failed. Please try again.");
        }
	};

    const handleGenerateReport = async (format: 'pdf' | 'xlsx') => {
        toast.info(`Generating ${format.toUpperCase()} report...`, {
            description: "Please wait while we compile the data.",
        });
        try {
            // Get the IDs of the currently displayed events
            const bmEventIds = data?.map(event => event.id) || [];
            await downloadBookingsReport(event_id, format, bmEventIds);
            toast.success("Report downloaded successfully");
        } catch (error) {
            console.error("Report generation failed", error);
            toast.error("Failed to generate report");
        }
    };

    const handleCopyPublicLink = () => {
        const publicLink = `${window.location.origin}/events/${event_id}/book-meeting`;
        navigator.clipboard.writeText(publicLink)
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
					<Button variant="outline" size="sm" onClick={() => handleGenerateReport('xlsx')} className="h-8 md:h-9">
						<Download className="md:mr-2 h-4 w-4" />
						<span className="hidden lg:inline">Generate Report</span>
						<span className="lg:hidden hidden md:inline">Report</span>
					</Button>
                    {!isBusinessHost && (
                        <Button variant="outline" size="sm" onClick={handleCopyPublicLink} className="h-8 md:h-9">
                            <LinkIcon className="md:mr-2 h-4 w-4" />
                            <span className="hidden lg:inline">Copy Invite Link</span>
                            <span className="lg:hidden hidden md:inline">Invite Link</span>
                        </Button>
                    )}
				</>
			)}

			<Button
				variant="outline"
				size="sm"
				onClick={handleRefresh}
				disabled={isRefreshing}
				className="h-8 md:h-9"
			>
				<RefreshCw className={`md:mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
				<span className="hidden md:inline">Refresh</span>
			</Button>
		</div>
	);

	return (
		<div className="space-y-6 p-4">
			<DataTable 
				columns={filteredColumns} 
				data={data || []} 
				actions={actionButtons} 
			/>
		</div>
	);
}
