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
	// Sort by createdAt in descending order (latest first)
	const filteredTeamMembers = teamMembers
		.filter((member) => member.role !== "manager")
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
		<div className="p-2">
			<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div className="min-w-0 flex-1">
					<h1 className="font-bold text-3xl tracking-tight">Team Members</h1>
					<p className="text-muted-foreground">
						Manage your team members and their roles.
					</p>
				</div>
				<Button onClick={handleAddMember} className="w-full lg:w-auto lg:shrink-0">
					Add Team Member
				</Button>
			</div>
			<DataTable columns={columns} data={filteredTeamMembers} />
		</div>
	);
}
