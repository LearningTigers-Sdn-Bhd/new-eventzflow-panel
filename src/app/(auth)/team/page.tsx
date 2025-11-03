"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorState, LoadingState } from "@/components/data-state";
import TeamClientWrapper from "@/components/pages/team/team-client-wrapper";
import { Button } from "@/components/ui/button";
import { useHydratedStore } from "@/hooks/use-hydrated-store";
import { getTeamMembers } from "@/lib/api/team";

export default function TeamPage() {
	const isHydrated = useHydratedStore();

	const {
		data: teamMembers,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["team", "members"],
		queryFn: getTeamMembers,
		enabled: isHydrated, // Only fetch when store is hydrated
	});

	return (
		<div className="space-y-6 p-0">
			{/* Show loading state, error state, or content */}
			{isLoading ? (
				<LoadingState
					title="Loading team members..."
					description="Please wait while we fetch your team members..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load team members"
					description="We couldn't load your team members. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<TeamClientWrapper teamMembers={teamMembers || []} />
			)}
		</div>
	);
}
