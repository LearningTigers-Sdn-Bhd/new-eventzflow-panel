"use client";

import { useParams, useSearchParams } from "next/navigation";
import { PublicFeedbackForm } from "@/components/pages/feedback-form/public-feedback-form";

export default function FeedbackPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const slug = params.slug as string;
	const ticket = searchParams.get("ticket") ?? undefined;

	return <PublicFeedbackForm slug={slug} ticketPublicId={ticket} />;
}
