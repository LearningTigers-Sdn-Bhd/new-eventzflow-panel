"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { ExhibitorKitDetailsSection } from "@/components/pages/event-vendors/exhibitor-kit-details-section";
import { VendorProfileCard } from "@/components/pages/event-vendors/vendor-profile-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import { getEventVendor } from "@/lib/api/event-vendor";

export default function VendorProfilePage() {
	const params = useParams();
	const eventId = Number(params.event_id);
	const eventVendorId = Number(params.vendor_id);
	const { user } = useAuth();
	const permissions = useEventPermissions(eventId);

	// Get the event vendor to find the actual vendor_id
	const {
		data: eventVendor,
		isLoading: isLoadingEventVendor,
		error: eventVendorError,
	} = useQuery({
		queryKey: ["event", eventId, "vendors", eventVendorId],
		queryFn: () => getEventVendor(eventId, eventVendorId),
	});

	// Get vendor_id from event vendor
	const vendorId = eventVendor?.vendor_id;

	// Fetch vendor profile using vendor_id (only when vendorId is available)
	const {
		data: profile,
		isLoading: isLoadingProfile,
		error: profileError,
	} = useVendorProfile(
		vendorId,
		vendorId !== undefined, // Only fetch when vendorId is available
	);

	// Check if user has permission to view this vendor profile
	const canViewProfile = useMemo(() => {
		if (!user || !eventVendor) return false;

		// Vendor itself can view their own profile
		if (user.id === eventVendor.vendor_id) return true;

		// org_owner can view any vendor profile
		if (user.role === "org_owner") return true;

		// Organizer can view vendor profiles
		if (user.role === "organizer") return true;

		return false;
	}, [user, eventVendor]);

	const isLoading = isLoadingEventVendor || isLoadingProfile;
	const error = eventVendorError || profileError;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading vendor profile..."
				description="Please wait while we fetch the vendor information..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load vendor profile"
				description="We couldn't load the vendor profile. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	if (!canViewProfile) {
		return (
			<ErrorState
				title="Access Denied"
				description="You don't have permission to view this vendor profile."
			/>
		);
	}

	if (!profile || !eventVendor) {
		return (
			<ErrorState
				title="Profile not found"
				description="The vendor profile you're looking for doesn't exist."
			/>
		);
	}

	return (
		<div className="space-y-0">
			<VendorProfileCard profile={profile} />
			{eventVendor.exhibitor_kits.map((kit) => (
				<ExhibitorKitDetailsSection
					key={kit.id}
					eventVendor={eventVendor}
					kit={kit}
				/>
			))}
		</div>
	);
}
