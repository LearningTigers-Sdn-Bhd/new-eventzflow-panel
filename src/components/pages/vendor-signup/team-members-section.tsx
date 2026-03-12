"use client";

import { Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamMember {
	full_name: string;
	email: string;
	phone: string;
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
	const [newMemberEmail, setNewMemberEmail] = useState("");
	const [newMemberPhone, setNewMemberPhone] = useState("");

	const extraMembersCount =
		teamMemberLimit != null && teamMembers.length > teamMemberLimit
			? teamMembers.length - teamMemberLimit
			: 0;

	const handleAddMember = () => {
		if (!newMemberName.trim() || !newMemberEmail.trim() || !newMemberPhone.trim()) {
			return;
		}

		onTeamMembersChange([
			...teamMembers,
			{
				full_name: newMemberName.trim(),
				email: newMemberEmail.trim(),
				phone: newMemberPhone.trim(),
			},
		]);
		setNewMemberName("");
		setNewMemberEmail("");
		setNewMemberPhone("");
	};

	const handleRemoveMember = (index: number) => {
		onTeamMembersChange(teamMembers.filter((_, i) => i !== index));
	};

	const handleUpdateMember = (
		index: number,
		field: keyof TeamMember,
		value: string,
	) => {
		onTeamMembersChange(
			teamMembers.map((member, i) =>
				i === index ? { ...member, [field]: value } : member,
			),
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

			<div className="space-y-3">
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

				{/* How to use guide */}
				<div className="bg-blue-50 border border-blue-200 p-3">
					<p className="text-blue-800 text-xs">
						<span className="font-medium">How to add:</span> Enter the full name,
						real email address, and phone number for each team member, then click
						"Add".
					</p>
				</div>
			</div>

			{/* Add Member Input */}
			<div className="space-y-2">
				<Label>Add Team Member</Label>
				<p className="text-muted-foreground text-xs">
					Use the member&apos;s real email address so they can receive their QR
					code.
				</p>
				<div className="grid gap-2 md:grid-cols-[1.3fr_1fr_1fr_auto]">
					<Input
						value={newMemberName}
						onChange={(e) => setNewMemberName(e.target.value)}
						placeholder="e.g., Ahmad bin Abdullah"
						className="flex-1"
					/>
					<Input
						type="email"
						value={newMemberEmail}
						onChange={(e) => setNewMemberEmail(e.target.value)}
						placeholder="Email address"
					/>
					<Input
						value={newMemberPhone}
						onChange={(e) => setNewMemberPhone(e.target.value)}
						placeholder="Phone number"
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
						Add Member
					</Button>
				</div>
			</div>

			{/* Team Members List */}
			{teamMembers.length > 0 ? (
				<div className="space-y-2">
					<Label>Added Members ({teamMembers.length})</Label>
					<p className="text-muted-foreground text-xs">
						You can edit member details here, or remove a member with the red
						trash icon.
					</p>
					<div className="space-y-2">
						{teamMembers.map((member, index) => (
							<div
								key={`${member.email}-${member.full_name}-${index}`}
								className="grid gap-2 border bg-muted/30 p-2 lg:grid-cols-[auto_1.2fr_1fr_1fr_auto] lg:items-center"
							>
								<span className="shrink-0 font-medium text-muted-foreground text-xs">
									#{index + 1}
								</span>
								<Input
									value={member.full_name}
									onChange={(e) =>
										handleUpdateMember(index, "full_name", e.target.value)
									}
									className="min-w-0 flex-1"
								/>
								<Input
									type="email"
									value={member.email}
									onChange={(e) =>
										handleUpdateMember(index, "email", e.target.value)
									}
									className="min-w-0"
								/>
								<Input
									value={member.phone}
									onChange={(e) =>
										handleUpdateMember(index, "phone", e.target.value)
									}
									className="min-w-0"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => handleRemoveMember(index)}
									className="shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
									title="Remove this member"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="border border-dashed bg-muted/20 p-4 text-center">
					<Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
					<p className="mt-2 text-muted-foreground text-sm">
						No team members added yet
					</p>
					<p className="text-muted-foreground text-xs">
						Use the form above to add your first team member
					</p>
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
