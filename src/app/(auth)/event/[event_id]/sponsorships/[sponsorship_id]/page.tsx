"use client";

import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useEventSponsorship } from "@/hooks/use-event-sponsorships";
import EventSponsorshipDetailView from "@/components/pages/event-sponsorships/detail/event-sponsorship-detail-view";

interface PageProps {
  params: Promise<{
    event_id: string;
    sponsorship_id: string;
  }>;
}

export default function EventSponsorshipDetailPage({ params }: PageProps) {
  const { event_id, sponsorship_id } = use(params);

  const {
    data: sponsorship,
    isLoading,
    error,
  } = useEventSponsorship(event_id, sponsorship_id);

  if (isLoading) {
    return (
      <LoadingState
        title="Loading sponsorship..."
        description="Please wait while we fetch the details..."
      />
    );
  }

  if (error || !sponsorship) {
    return (
      <ErrorState
        title="Failed to load sponsorship"
        description="We couldn't load the sponsorship details. Please try again."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  return <EventSponsorshipDetailView sponsorship={sponsorship} />;
}
