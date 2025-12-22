"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { LocationPageButton } from "@/components/pages/location/event-location-action-modal/create-event-location-button";
import { DataTable } from "@/components/pages/location/event-location-table";
import { columns } from "@/components/pages/location/event-location-table-columns";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getLocations } from "@/lib/api/event/location";

export default function LocationPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { user } = useAuth();

	// Only show create button if user is not a vendor
	const isVendor = user?.role === "vendor";
	useSetEventActions(isVendor ? null : <LocationPageButton />);

	const {
		data: locations,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", event_id, "locations"],
		queryFn: () => getLocations({ eventId: event_id }),
	});

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading locations..."
					description="Please wait while we fetch your locations..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load locations"
					description="We couldn't load locations. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<DataTable columns={columns} data={locations || []} />
			)}
		</div>
	);
}
