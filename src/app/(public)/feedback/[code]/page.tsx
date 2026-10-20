"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PublicFeedbackForm } from "@/components/pages/feedback-form/public-feedback-form";
import { resolveFeedbackShortLink } from "@/lib/api/feedback-form";

/** Short exhibitor feedback link (/feedback/<code>) that opens the exhibitor's form. */
export default function FeedbackShortLinkPage() {
	const { code } = useParams<{ code: string }>();
	const { data, isLoading, isError } = useQuery({
		queryKey: ["feedback-short-link", code],
		queryFn: () => resolveFeedbackShortLink(code),
		retry: false,
	});

	if (isLoading) return null;
	if (isError || !data) {
		return (
			<main className="flex min-h-svh items-center justify-center p-6 text-center">
				<div className="space-y-2">
					<h1 className="font-semibold text-lg">This link isn't valid</h1>
					<p className="text-muted-foreground text-sm">
						It may have expired. Please ask the organizer for a new feedback
						link.
					</p>
				</div>
			</main>
		);
	}

	return (
		<PublicFeedbackForm
			slug={data.event_slug}
			exhibitorToken={data.exhibitor_token}
		/>
	);
}
