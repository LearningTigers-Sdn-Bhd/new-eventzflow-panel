"use client";

import { use } from "react";
import { BigScreen } from "@/components/pages/headcount/big-screen";

/** The public door screen for a published event. `event_id` here is the event's slug, like the other public event pages. */
export default function PeopleCounterScreenPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id: slug } = use(params);
	return <BigScreen slug={slug} />;
}
