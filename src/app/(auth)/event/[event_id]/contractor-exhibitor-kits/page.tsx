"use client";

import { use } from "react";
import { ContractorExhibitorKitsView } from "@/components/pages/event-exhibitor-contractor/contractor-exhibitor-kits-view";
import { useAuth } from "@/hooks/auth/use-auth";
import { redirect } from "next/navigation";

export default function ContractorExhibitorKitsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { user } = useAuth();

	// Only allow exhibition contractors to access this page
	if (user?.role !== "exhibition_contractor") {
		redirect(`/event/${event_id}` as any);
	}

	return <ContractorExhibitorKitsView eventId={event_id} />;
}