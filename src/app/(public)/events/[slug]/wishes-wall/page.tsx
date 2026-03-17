"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { WishesGrid } from "@/components/pages/wishes-wall/wishes-grid";
import { normalizeWallSettings } from "@/components/pages/wishes-wall/wall-settings";
import { getPublicEventById } from "@/lib/api/event";

export default function WishesWallPage() {
	const params = useParams();
	const slug = params.slug as string;

	const { data, isLoading, error } = useQuery({
		queryKey: ["public-event", slug],
		queryFn: () => getPublicEventById(slug),
		enabled: !!slug,
		retry: 2,
	});

	useEffect(() => {
		if (data?.title) {
			document.title = `Live Wishes Wall - ${data.title}`;
		} else {
			document.title = "Live Wishes Wall";
		}
	}, [data?.title]);

	if (isLoading) {
		return (
			<LoadingState
				title="Preparing the wishes wall..."
				description="Loading approved blessings for display."
				height="min-h-screen"
				className="bg-[#120f0c] text-white"
			/>
		);
	}

	if (error || !data) {
		return (
			<ErrorState
				title="Unable to load the wishes wall"
				description={
					error instanceof Error
						? error.message
						: "Please check the event link and try again."
				}
				height="min-h-screen"
				className="bg-[#120f0c] text-white"
			/>
		);
	}

	return (
		<WishesGrid
			eventId={String(data.id)}
			eventTitle={data.title}
			slug={slug}
			wallSettings={normalizeWallSettings(data.wish_wall_setting)}
		/>
	);
}
