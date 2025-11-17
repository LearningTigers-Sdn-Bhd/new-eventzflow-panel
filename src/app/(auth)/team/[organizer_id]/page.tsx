"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { getTeamMembers } from "@/lib/api/team";
import OrganizerMembersContent from "@/components/pages/team/organizer-members-content";

export default function OrganizerMembersPage({
	params,
}: {
	params: Promise<{ organizer_id: string }>;
}) {
	const { organizer_id } = use(params);
	const router = useRouter();

	const {
		data: teamMembers,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["team", "members"],
		queryFn: getTeamMembers,
	});

	// Find the organizer
	const organizer = teamMembers?.find((member) => member.id === organizer_id);

	if (isLoading) {
		return (
			<LoadingState
				title="Loading organizer details..."
				description="Please wait while we fetch the organizer information..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load organizer"
				description="We couldn't load the organizer information. Please try again."
				action={
					<Button onClick={() => window.location.reload()}>Retry</Button>
				}
			/>
		);
	}

	if (!organizer) {
		return (
			<ErrorState
				title="Organizer not found"
				description="The organizer you're looking for doesn't exist."
				action={
					<Button onClick={() => router.push("/team")}>
						Back to Team Members
					</Button>
				}
			/>
		);
	}

	return (
		<div className="p-0">
			<div className="page-header mb-6">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={Users}
						title={`Members under ${organizer.full_name}`}
						description={`View and manage members assigned to ${organizer.full_name}`}
					/>
				</div>
			</div>
			<OrganizerMembersContent organizer={organizer} />
		</div>
	);
}

