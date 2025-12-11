"use client";

import { use } from "react";
import { ExhibitorContractorPageButton } from "@/components/pages/event-exhibitor-contractor/page-action/button";
import { ExhibitorContractorView } from "@/components/pages/event-exhibitor-contractor/exhibitor-contractor-view";
import { ContractorEventDashboard } from "@/components/pages/event-exhibitor-contractor/contractor-event-dashboard";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { useAuth } from "@/hooks/use-auth";

export default function EventExhibitorContractorPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { user } = useAuth();

	const isExhibitionContractor = user?.role === "exhibition_contractor";

	// Exhibition contractors see their dashboard
	// Org owners/organizers see the contractor management view
	useSetEventActions(isExhibitionContractor ? null : <ExhibitorContractorPageButton />);

	if (isExhibitionContractor) {
		return <ContractorEventDashboard eventId={event_id} />;
	}

	return <ExhibitorContractorView eventId={event_id} />;
}
