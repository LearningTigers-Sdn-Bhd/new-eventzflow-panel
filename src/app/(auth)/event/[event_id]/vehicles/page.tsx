"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import { VehicleTable } from "@/components/pages/vehicles/vehicle-table";
import { Button } from "@/components/ui/button";
import { getEventById } from "@/lib/api/event";
import { getEventVehicleRegistrations } from "@/lib/api/vehicle-registration";

export default function VehiclesPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const router = useRouter();

	const { data: event, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
	});

	const vehiclesEnabled = event?.vehicles_enabled === true;

	// The Vehicles page is gated behind the event's vehicles flag — send staff
	// back to the overview when it isn't enabled (mirrors the backend's 404).
	useEffect(() => {
		if (!isLoadingEvent && event && !vehiclesEnabled) {
			router.replace(`/event/${event_id}` as Route);
		}
	}, [isLoadingEvent, event, vehiclesEnabled, router, event_id]);

	const [archivedFilter, setArchivedFilter] = useState<"active" | "archived">(
		"active",
	);

	const {
		data: vehicles,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["event", event_id, "vehicle-registrations", archivedFilter],
		queryFn: () =>
			getEventVehicleRegistrations({
				eventId: event_id,
				archived: archivedFilter === "archived" ? "true" : undefined,
			}),
		enabled: vehiclesEnabled,
	});

	if (!isLoadingEvent && !vehiclesEnabled) {
		// Redirect is in flight (or already navigated away); show a locked state
		// rather than flash the table.
		return <FeatureLockedState featureName="Vehicles" />;
	}

	return (
		<div className="space-y-4">
			{isLoading || isLoadingEvent ? (
				<LoadingState
					title="Loading vehicles..."
					description="Please wait while we fetch the vehicles..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load vehicles"
					description="We couldn't load the vehicles. Please try again."
					action={<Button onClick={() => refetch()}>Retry</Button>}
				/>
			) : (
				<VehicleTable
					eventId={event_id}
					vehicles={vehicles ?? []}
					archivedFilter={archivedFilter}
					onArchivedFilterChange={setArchivedFilter}
				/>
			)}
		</div>
	);
}
