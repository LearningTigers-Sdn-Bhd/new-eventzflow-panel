"use client";

import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import SponsorDetailView from "@/components/pages/sponsors/detail/sponsor-detail-view";
import { Button } from "@/components/ui/button";
import { useSponsor } from "@/hooks/use-sponsorships";

interface PageProps {
	params: Promise<{
		sponsor_id: string;
	}>;
}

export default function SponsorDetailPage({ params }: PageProps) {
	const { sponsor_id } = use(params);

	const { data: sponsor, isLoading, error } = useSponsor(sponsor_id);

	if (isLoading) {
		return (
			<LoadingState
				title="Loading sponsor..."
				description="Please wait while we fetch the details..."
			/>
		);
	}

	if (error || !sponsor) {
		return (
			<ErrorState
				title="Failed to load sponsor"
				description="We couldn't load the sponsor details. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	return <SponsorDetailView sponsor={sponsor} />;
}
