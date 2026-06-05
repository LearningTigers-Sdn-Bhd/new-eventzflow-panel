"use client";

import { Handshake, Layers } from "lucide-react";
import { use, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import EventSponsorshipTiersView from "@/components/pages/event-sponsorships/event-sponsorship-tiers-view";
import EventSponsorshipsView from "@/components/pages/event-sponsorships/event-sponsorships-view";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useEventSponsorships,
	useEventSponsorshipTiers,
} from "@/hooks/use-event-sponsorships";

interface PageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function EventSponsorshipsPage({ params }: PageProps) {
	const { event_id } = use(params);
	const [activeTab, setActiveTab] = useState("sponsorships");

	const {
		data: sponsorships,
		isLoading: isLoadingSponsorships,
		error: errorSponsorships,
	} = useEventSponsorships(event_id);

	const {
		data: tiers,
		isLoading: isLoadingTiers,
		error: errorTiers,
	} = useEventSponsorshipTiers(event_id);

	const isLoading = isLoadingSponsorships || isLoadingTiers;
	const error = errorSponsorships || errorTiers;

	return (
		<div className="space-y-6">
			{isLoading ? (
				<LoadingState
					title="Loading sponsorships..."
					description="Please wait while we fetch event sponsorship data..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load data"
					description="We couldn't load sponsorship data. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<Tabs
					defaultValue="sponsorships"
					onValueChange={setActiveTab}
					className="w-full"
				>
					<div className="w-full border-y border-dashed">
						<TabsList className="flex h-12 w-full rounded-none">
							<TabsTrigger
								value="sponsorships"
								className="flex flex-1 items-center justify-center gap-2 rounded-none"
							>
								<Handshake className="size-4" />
								Sponsorships
							</TabsTrigger>
							<TabsTrigger
								value="tiers"
								className="flex flex-1 items-center justify-center gap-2 rounded-none"
							>
								<Layers className="size-4" />
								Tiers
							</TabsTrigger>
						</TabsList>
					</div>

					<div className="mt-6">
						<TabsContent value="sponsorships" className="mt-0">
							<EventSponsorshipsView
								eventId={event_id}
								sponsorships={sponsorships || []}
								tiers={tiers || []}
							/>
						</TabsContent>

						<TabsContent value="tiers" className="mt-0">
							<EventSponsorshipTiersView
								eventId={event_id}
								tiers={tiers || []}
							/>
						</TabsContent>
					</div>
				</Tabs>
			)}
		</div>
	);
}
