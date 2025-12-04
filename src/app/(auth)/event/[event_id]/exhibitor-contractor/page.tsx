"use client";

import { use } from "react";
import { ExhibitorContractorPageButton } from "@/components/pages/event-exhibitor-contractor/page-action/button";
import { ExhibitorContractorView } from "@/components/pages/event-exhibitor-contractor/exhibitor-contractor-view";
import { useSetEventActions } from "@/hooks/use-set-event-actions";

export default function EventExhibitorContractorPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	useSetEventActions(<ExhibitorContractorPageButton />);

	return <ExhibitorContractorView eventId={event_id} />;
}
