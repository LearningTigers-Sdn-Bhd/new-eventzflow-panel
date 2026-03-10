"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { RsvpWizard } from "@/components/pages/rsvp/rsvp-wizard";
import { getRsvpData } from "@/lib/api/rsvp";
import { buildRsvpPageTitle } from "@/lib/rsvp/title";

export default function RsvpPage() {
	const params = useParams();
	const slug = params.slug as string;
	const publicId = params.public_id as string;

	const { data, isLoading, error } = useQuery({
		queryKey: ["rsvp", slug, publicId],
		queryFn: () => getRsvpData(slug, publicId),
		enabled: !!slug && !!publicId,
	});

	useEffect(() => {
		document.title = buildRsvpPageTitle(data?.event.title);
	}, [data?.event.title]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-stone-50">
				<div className="text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-stone-800" />
					<p className="mt-4 text-stone-600">Loading your invitation...</p>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-stone-50">
				<div className="text-center">
					<h1 className="font-semibold text-2xl text-stone-800">
						Invitation Not Found
					</h1>
					<p className="mt-2 text-stone-600">
						This invitation link may be invalid or expired.
					</p>
				</div>
			</div>
		);
	}

	return <RsvpWizard data={data} slug={slug} publicId={publicId} />;
}
