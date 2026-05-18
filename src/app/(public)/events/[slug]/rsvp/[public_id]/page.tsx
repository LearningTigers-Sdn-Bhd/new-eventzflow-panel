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
			<div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-stone-200 border-t-stone-800" />
					<p className="mt-6 font-serif text-lg text-stone-500 italic">
						Preparing your invitation...
					</p>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
				<div className="max-w-md text-center">
					<h1 className="font-serif text-3xl text-stone-900 sm:text-4xl">
						Invitation Not Found
					</h1>
					<div className="mx-auto mt-6 h-px w-12 bg-stone-200" />
					<p className="mt-6 font-serif text-lg text-stone-500 italic leading-relaxed">
						"This invitation link may be invalid or expired. Please check your
						link and try again."
					</p>
				</div>
			</div>
		);
	}

	return <RsvpWizard data={data} slug={slug} publicId={publicId} />;
}
