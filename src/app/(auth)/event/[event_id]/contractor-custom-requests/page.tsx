"use client";

import { use } from "react";
import { CustomRequestsView } from "@/components/pages/event-exhibitor/custom-requests-view";

export default function ContractorCustomRequestsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	return <CustomRequestsView eventId={event_id} />;
}
