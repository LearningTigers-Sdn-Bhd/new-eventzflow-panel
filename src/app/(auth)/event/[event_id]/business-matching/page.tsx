"use client";

import { use, useEffect } from "react";
import { Briefcase, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingState, ErrorState } from "@/components/data-state";
import { DataTable } from "@/components/pages/business-matching/data-table";
import { columns } from "@/components/pages/business-matching/columns";
import { useBusinessMatchingEvents, useForceRefreshBusinessMatching } from "@/hooks/use-business-matching";
import { cable } from "@/lib/cable";
import { Button } from "@/components/ui/button";

interface BusinessMatchingPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function BusinessMatchingPage({ params }: BusinessMatchingPageProps) {
	const { event_id } = use(params);
	const { data, isLoading, error, isFetching } = useBusinessMatchingEvents(event_id);
	const { mutate: forceRefresh, mutateAsync: forceRefreshAsync, isPending: isRefreshing } = useForceRefreshBusinessMatching(event_id);
	const queryClient = useQueryClient();

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
					console.log("Received Business Matching update:", data);
					toast.info("Business Matching updated", {
						description: "New data has been received from the backend.",
					});
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
		<div className="space-y-6 p-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold tracking-tight">Business Matching</h1>
				<Button
					variant="outline"
					size="sm"
					onClick={handleRefresh}
					disabled={isRefreshing}
				>
					<RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
					Refresh
				</Button>
			</div>
			<DataTable columns={columns} data={data || []} />
		</div>
	);
}
