"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorState, LoadingState } from "@/components/data-state";
import { ExhibitorKitDetailsSection } from "@/components/pages/event-vendors/exhibitor-kit-details-section";
import { VendorProfileCard } from "@/components/pages/event-vendors/vendor-profile-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { getEventVendors } from "@/lib/api/event-vendor";
import { getVendorProfile } from "@/lib/api/vendor-profile";

interface VendorProfileViewProps {
	eventId?: string;
}

/**
 * Component for vendors to view their own profile
 * Uses GET /v1/vendor_profile endpoint
 */
export function VendorProfileView({ eventId }: VendorProfileViewProps) {
	const { user } = useAuth();

	const {
		data: profile,
		isLoading: isLoadingProfile,
		error: profileError,
	} = useQuery({
		queryKey: ["vendor-profile"],
		queryFn: () => getVendorProfile(),
	});

	// Fetch event vendors to find the current user's event vendor record
	const {
		data: eventVendors,
		isLoading: isLoadingVendors,
		error: vendorsError,
	} = useQuery({
		queryKey: ["event", eventId, "vendors"],
		queryFn: () => getEventVendors(Number(eventId)),
		enabled: !!eventId && !!user,
	});

	// Find the current user's event vendor record
	const currentEventVendor = eventVendors?.find(
		(ev) => ev.vendor_id === user?.id,
	);

	const isLoading = isLoadingProfile || isLoadingVendors;
	const error = profileError || vendorsError;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading vendor profile..."
				description="Please wait while we fetch your vendor information..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load vendor profile"
				description="We couldn't load your vendor profile. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	if (!profile) {
		return (
			<ErrorState
				title="Profile not found"
				description="Your vendor profile doesn't exist."
			/>
		);
	}

	return (
		<div className="space-y-0">
			<VendorProfileCard profile={profile} />
			{currentEventVendor?.exhibitor_kits.map((kit) => (
				<ExhibitorKitDetailsSection
					key={kit.id}
					eventVendor={currentEventVendor}
					kit={kit}
					batchSize={
						currentEventVendor.exhibitor_kits.filter(
							(other) => other.booking_batch_id === kit.booking_batch_id,
						).length
					}
				/>
			))}
		</div>
	);
}
