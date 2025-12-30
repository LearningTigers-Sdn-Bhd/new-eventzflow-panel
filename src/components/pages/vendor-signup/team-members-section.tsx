"use client";

import { Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamMember {
	full_name: string;
}

interface TeamMembersSectionProps {
	teamMembers: TeamMember[];
	onTeamMembersChange: (members: TeamMember[]) => void;
	teamMemberLimit?: number | null;
	extraTeamMemberFee?: number | null;
}

export function TeamMembersSection({
	teamMembers,
	onTeamMembersChange,
	teamMemberLimit,
	extraTeamMemberFee,
}: TeamMembersSectionProps) {
	const [newMemberName, setNewMemberName] = useState("");

	const extraMembersCount =
		teamMemberLimit != null && teamMembers.length > teamMemberLimit
			? teamMembers.length - teamMemberLimit
			: 0;

	const handleAddMember = () => {
		if (!newMemberName.trim()) return;
		onTeamMembersChange([...teamMembers, { full_name: newMemberName.trim() }]);
		setNewMemberName("");
	};

	const handleRemoveMember = (index: number) => {
		onTeamMembersChange(teamMembers.filter((_, i) => i !== index));
	};

	const handleUpdateMemberName = (index: number, name: string) => {
		onTeamMembersChange(
			teamMembers.map((m, i) => (i === index ? { full_name: name } : m)),
		);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
		}).format(amount);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 border-b pb-2">
				<Users className="h-5 w-5 text-primary" />
				<h3 className="font-semibold text-lg">Team Members</h3>
				<span className="text-muted-foreground text-sm">(Optional)</span>
			</div>

			<p className="text-muted-foreground text-sm">
				Add your team members who will be participating in the exhibition.
				{teamMemberLimit != null && (
					<>
						<span className="font-medium">
							{" "}
							{teamMemberLimit} members included.
						</span>
						{extraTeamMemberFee != null && extraTeamMemberFee > 0 && (
							<span>
								{" "}
								Extra members will be charged{" "}
								<span className="font-medium">
									{formatCurrency(extraTeamMemberFee)}
								</span>{" "}
								per person.
							</span>
						)}
					</>
				)}
			</p>

			{/* Add Member Input */}
			<div className="space-y-2">
				<Label>Add Team Member</Label>
				<div className="flex flex-col gap-2 sm:flex-row">
					<Input
						value={newMemberName}
						onChange={(e) => setNewMemberName(e.target.value)}
						placeholder="Enter team member full name"
						className="flex-1"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleAddMember();
							}
						}}
					/>
					<Button
						type="button"
						variant="outline"
						onClick={handleAddMember}
						className="w-full sm:w-auto"
					>
						<Plus className="mr-2 h-4 w-4" />
						Add
					</Button>
				</div>
			</div>

			{/* Team Members List */}
			{teamMembers.length > 0 && (
				<div className="space-y-2">
					<Label>Added Members ({teamMembers.length})</Label>
					<div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
						{teamMembers.map((member, index) => (
							<div
								key={`member-${index}`}
								className="flex items-center gap-2 border bg-muted/30 p-2"
							>
								<span className="shrink-0 font-medium text-muted-foreground text-xs">
									#{index + 1}
								</span>
								<Input
									value={member.full_name}
									onChange={(e) => handleUpdateMemberName(index, e.target.value)}
									className="min-w-0 flex-1"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => handleRemoveMember(index)}
									className="shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Extra members fee notice */}
			{extraMembersCount > 0 &&
				extraTeamMemberFee != null &&
				extraTeamMemberFee > 0 && (
					<div className="rounded border border-amber-200 bg-amber-50 p-3">
						<p className="text-amber-800 text-sm">
							You have <span className="font-semibold">{extraMembersCount}</span>{" "}
							extra member{extraMembersCount > 1 ? "s" : ""} beyond the included
							limit. Additional charge:{" "}
							<span className="font-semibold">
								{formatCurrency(extraMembersCount * extraTeamMemberFee)}
							</span>
						</p>
					</div>
				)}
		</div>
	);
}
