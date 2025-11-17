"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useDialog } from "@/hooks/use-dialog";
import type { TeamMember } from "@/lib/api/team";
import { columns } from "./columns";
import CreateMemberForm from "./create-member-form";
import { DataTable } from "./data-table";

interface TeamClientWrapperProps {
	teamMembers: TeamMember[];
}

export default function TeamClientWrapper({
	teamMembers,
}: TeamClientWrapperProps) {
	const { openDialog, closeDialog } = useDialog();

	// Filter out organizer and vendor roles - only show org_owner and member
	// Sort by createdAt in descending order (latest first)
	const filteredTeamMembers = teamMembers
		.filter((member) => member.role !== "organizer" && member.role !== "vendor")
		.sort((a, b) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});

	const handleAddMember = () => {
		openDialog({
			component: CreateMemberForm,
			props: {
				onClose: closeDialog,
			},
			config: {
				title: "Add Team Member",
				description: "Create a new team member account with login credentials.",
				size: "2xl",
			},
		});
	};

	return (
		<div className="p-0">
			<div className="page-header mb-6">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={Users}
						title="Team Members"
						description="Manage your team members and their roles."
					/>
				</div>
				<div className="w-full px-0 md:w-auto md:px-4">
					<Button
						onClick={handleAddMember}
						className="w-full shrink-0 rounded-none"
					>
						Add Team Member
					</Button>
				</div>
			</div>
			<DataTable columns={columns} data={filteredTeamMembers} />
		</div>
	);
}
