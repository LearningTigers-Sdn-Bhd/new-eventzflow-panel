"use client";

import { Button } from "@/components/ui/button";
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

	// Filter out manager roles - only show org_owner and member
	const filteredTeamMembers = teamMembers.filter(
		(member) => member.role !== "manager",
	);

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
		<div className="p-2">
			<div className="mb-8 flex items-center justify-between gap-4">
				<div className="min-w-0 flex-1">
					<h1 className="font-bold text-3xl tracking-tight">Team Members</h1>
					<p className="text-muted-foreground">
						Manage your team members and their roles.
					</p>
				</div>
				<Button onClick={handleAddMember} className="shrink-0">
					<span className="hidden sm:inline">Add Team Member</span>
					<span className="sm:hidden">Add Team</span>
				</Button>
			</div>
			<DataTable columns={columns} data={filteredTeamMembers} />
		</div>
	);
}
