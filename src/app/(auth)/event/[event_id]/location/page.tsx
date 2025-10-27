"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { columns } from "@/components/pages/location/columns";
import { DataTable } from "@/components/pages/location/data-table";
import { LocationPageButton } from "@/components/pages/location/page-action/button";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getLocations } from "@/lib/api/event/location";

export default function LocationPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	useSetEventActions(<LocationPageButton />);

	const {
		data: locations,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", event_id, "locations"],
		queryFn: () => getLocations({ eventId: event_id }),
	});

	return (
		<div className="container mx-auto">
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
