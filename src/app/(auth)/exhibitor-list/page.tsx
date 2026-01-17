"use client";

import { useQuery } from "@tanstack/react-query";
import ExhibitorKitsClientWrapper from "@/components/pages/exhibitor-kits-public/exhibitor-kits-client-wrapper";
import { useAuth } from "@/hooks/auth/use-auth";
import { redirect } from "next/navigation";
import { getEvents } from "@/lib/api/event";
import { getEventVendors } from "@/lib/api/event-vendor";

export default function PublicExhibitorKitsPage() {
	const { user } = useAuth();

	// Only allow exhibition contractors to access this page
	if (user?.role !== "exhibition_contractor") {
		redirect("/dashboard" as any);
	}

	// Fetch all events
	const {
		data: events,
		isLoading: eventsLoading,
		error: eventsError,
	} = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
	});

	// Fetch vendors for all events
	const eventIds = events?.map(event => event.id) || [];
	
	const vendorQueries = useQuery({
		queryKey: ["all-event-vendors", eventIds],
		queryFn: async () => {
			if (!events || events.length === 0) return [];
			
			const vendorPromises = events.map(async (event) => {
				try {
					const vendors = await getEventVendors(event.id);
					return vendors.map(vendor => ({ 
						...vendor, 
						event: event,
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
	const allKitsWithEventAndVendor = (vendorQueries.data || [])
		.filter(vendor => vendor.exhibitor_kit)
		.map(vendor => ({
			...vendor.exhibitor_kit!,
			vendor: vendor,
			event: vendor.event,
		}));

	return (
		<div className="space-y-6 p-0">
			<ExhibitorKitsClientWrapper
				kits={allKitsWithEventAndVendor}
				events={events || []}
				isLoading={isLoading}
				error={error}
			/>
		</div>
	);
}