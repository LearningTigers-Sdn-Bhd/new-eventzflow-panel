"use client";

import { useParams } from "next/navigation";
import { WishesModeration } from "@/components/pages/wishes/wishes-moderation";

export default function WishesPage() {
	const params = useParams();
	const eventId = params.event_id as string;

	return <WishesModeration eventId={eventId} />;
}
