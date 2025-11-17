"use client";

import { ErrorState, LoadingState } from "@/components/data-state";
import GroupClientWrapper from "@/components/pages/groups/group-client-wrapper";
import { Button } from "@/components/ui/button";
import { useHydratedStore } from "@/hooks/use-hydrated-store";
import { useGroups } from "@/hooks/use-groups";

export default function GroupsPage() {
	const isHydrated = useHydratedStore();
	const { data: groups, isLoading, error } = useGroups();

	return (
		<div className="space-y-6">
			{isLoading ? (
				<LoadingState
					title="Loading groups..."
					description="Please wait while we fetch your groups..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load groups"
					description="We couldn't load your groups. Please try again."
					action={<Button onClick={() => window.location.reload()}>Retry</Button>}
				/>
			) : (
				<GroupClientWrapper groups={groups || []} />
			)}
		</div>
	);
}
