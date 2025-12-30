"use client";

import { use } from "react";
import { ContractorGuidelinesView } from "@/components/pages/exhibitor-kits/contractor-guidelines-view";

interface ContractorGuidelinesRouteProps {
	params: Promise<{ event_id: string }>;
}

export default function ContractorGuidelinesRoute({
	params,
}: ContractorGuidelinesRouteProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);

	return <ContractorGuidelinesView eventId={eventId} />;
}
