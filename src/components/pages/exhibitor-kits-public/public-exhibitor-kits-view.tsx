"use client";

import { useQuery } from "@tanstack/react-query";

import { getEvents } from "@/lib/api/event";
import { getEventVendors } from "@/lib/api/event-vendor";
import { type ExhibitorKitWithEventAndVendor } from "./columns";
import ExhibitorKitsClientWrapper from "./exhibitor-kits-client-wrapper";

export function PublicExhibitorKitsView() {
	// Fetch all events
	const {
		data: events,
		isLoading: eventsLoading,
		error: eventsError,
	} = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
	});

	// Fetch vendors for all events (we'll need to do this for each event)
	const eventIds = events?.map(event => event.id) || [];
	
	const vendorQueries = useQuery({
		queryKey: ["all-event-vendors", eventIds],
		queryFn: async () => {
			if (!events || events.length === 0) return [];
			
			// Fetch vendors for all events in parallel
			const vendorPromises = events.map(async (event) => {
				try {
					const vendors = await getEventVendors(event.id);
					// Attach event data to each vendor
					return vendors.map(vendor => ({ 
						...vendor, 
						event: event,
						// Also attach event to the exhibitor_kit if it exists
						exhibitor_kit: vendor.exhibitor_kit ? {
							...vendor.exhibitor_kit,
							event: event
						} : undefined
					}));
				} catch (error) {
					console.error(`Failed to fetch vendors for event ${event.id}:`, error);
					return [];
				}
			});
			
			const allVendorArrays = await Promise.all(vendorPromises);
			return allVendorArrays.flat();
		},
		enabled: !!events && events.length > 0,
	});

	const isLoading = eventsLoading || vendorQueries.isLoading;
	const error = eventsError || vendorQueries.error;

	// Extract exhibitor kits from all vendors across all events
	const allKitsWithEventAndVendor: ExhibitorKitWithEventAndVendor[] = (vendorQueries.data || [])
		.filter(vendor => vendor.exhibitor_kit) // Only vendors with exhibitor kits
		.map(vendor => ({
			...vendor.exhibitor_kit!,
			vendor: vendor,
			event: vendor.event,
		}));

	return (
		<ExhibitorKitsClientWrapper
			kits={allKitsWithEventAndVendor}
			events={events || []}
			isLoading={isLoading}
			error={error ? error as Error : null}
		/>
	);
}