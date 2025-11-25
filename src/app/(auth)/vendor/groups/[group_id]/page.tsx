"use client";

import { use } from "react";
import { Users } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { GroupDetailsHeader } from "@/components/pages/vendor-groups/details/group-details-header";
import { GroupAffiliateCard } from "@/components/pages/vendor-groups/details/group-affiliate-card";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useGroup } from "@/hooks/use-groups";

interface GroupDetailPageProps {
	params: Promise<{
		group_id: string;
	}>;
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
	const { group_id } = use(params);
	const groupId = Number(group_id);

	const { data: group, isLoading, error } = useGroup(groupId);

	if (isLoading) {
		return (
			<LoadingState
				title="Loading group details..."
				description="Please wait while we fetch the group information..."
			/>
		);
	}

	if (error || !group) {
		return (
			<ErrorState
				title="Failed to load group"
				description="We couldn't load the group details. Please try again."
				action={
					<Button onClick={() => window.location.reload()} className="rounded-none">
						Retry
					</Button>
				}
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
				<GroupAffiliateCard groupId={groupId} group={group} />
			</div>
		</div>
	);
}

