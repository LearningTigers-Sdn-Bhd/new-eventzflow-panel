"use client";

import { ErrorState, LoadingState } from "@/components/data-state";
import { VendorProfileCard } from "@/components/pages/event-vendors/vendor-profile-card";
import { StampAnalyticsCard } from "@/components/pages/visitors/stamp-analytics-card";
import { Button } from "@/components/ui/button";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import { useStampAnalytics } from "@/hooks/use-stamp-analytics";
import { useParams } from "next/navigation";

export default function VendorProfilePage() {
	const params = useParams();
	const eventId = Number(params.event_id);
	const vendorId = Number(params.vendor_id);

	const { data: profile, isLoading, error } = useVendorProfile(eventId, vendorId);
	const { data: analytics } = useStampAnalytics(eventId, vendorId);

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

	if (!profile) {
		return (
			<ErrorState
				title="Profile not found"
				description="The vendor profile you're looking for doesn't exist."
			/>
		);
	}

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Vendor Profile</h1>
				<p className="text-muted-foreground">
					View and manage vendor information
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<VendorProfileCard eventId={eventId} vendorId={vendorId} profile={profile} />
				{analytics && (
					<StampAnalyticsCard analytics={analytics} />
				)}
			</div>
		</div>
	);
}
