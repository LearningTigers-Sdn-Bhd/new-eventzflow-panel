"use client";

import { use } from "react";
import { ExhibitorKitDetailsView } from "@/components/pages/event-exhibitor-contractor/exhibitor-kit-details-view";
import { useAuth } from "@/hooks/auth/use-auth";
import { redirect } from "next/navigation";

export default function ExhibitorKitDetailsPage({
	params,
}: {
	params: Promise<{ event_id: string; kit_id: string }>;
}) {
	const { event_id, kit_id } = use(params);
	const { user } = useAuth();

	// Only allow exhibition contractors to access this page
	if (user?.role !== "exhibition_contractor") {
		redirect(`/event/${event_id}` as any);
	}

	return <ExhibitorKitDetailsView eventId={event_id} kitId={kit_id} />;
}
