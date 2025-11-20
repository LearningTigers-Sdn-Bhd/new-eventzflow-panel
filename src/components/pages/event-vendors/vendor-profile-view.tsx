"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorState, LoadingState } from "@/components/data-state";
import { VendorProfileCard } from "@/components/pages/event-vendors/vendor-profile-card";
import { Button } from "@/components/ui/button";
import { getVendorProfile } from "@/lib/api/vendor-profile";

/**
 * Component for vendors to view their own profile
 * Uses GET /v1/vendor_profile endpoint
 */
export function VendorProfileView() {
	const {
		data: profile,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["vendor-profile"],
		queryFn: () => getVendorProfile(),
	});

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
		<div>
			<VendorProfileCard profile={profile} />
		</div>
	);
}
