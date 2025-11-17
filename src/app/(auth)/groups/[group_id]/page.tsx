"use client";

import { useParams } from "next/navigation";
import { Users } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { GroupDetailsHeader } from "@/components/pages/groups/details/group-details-header";
import { GroupAffiliateCard } from "@/components/pages/groups/details/group-affiliate-card";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroup } from "@/hooks/use-groups";

export default function GroupDetailsPage() {
	const params = useParams();
	const groupId = Number(params.group_id);

	const { data: group, isLoading, error } = useGroup(groupId);

	if (isLoading) {
		return (
			<LoadingState
				title="Loading group details..."
				description="Please wait while we fetch the group information..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load group"
				description="We couldn't load the group details. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	if (!group) {
		return (
			<ErrorState
				title="Group not found"
				description="The group you're looking for doesn't exist."
			/>
		);
	}

	return (
		<div className="p-0">
			<div className="border-b border-dashed">
				<div className="page-header">
					<div className="px-2 md:px-4">
						<IconTitle
							icon={Users}
							title="Group Details"
							description={`Manage and view details for ${group.name}`}
						/>
					</div>
				</div>
			</div>

			<div className="space-y-6 rounded-none border border-dashed bg-card p-2 md:p-4">
				<GroupDetailsHeader group={group} />

				<div className="space-y-6">
					<GroupAffiliateCard groupId={groupId} />
				</div>
			</div>
		</div>
	);
}
