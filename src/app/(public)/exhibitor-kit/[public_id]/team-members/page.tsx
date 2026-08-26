"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	Loader2,
	Pencil,
	Plus,
	Trash2,
	Users,
	X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getVisibleTeamMemberSections } from "@/components/pages/event-exhibitor/forms/manage-team-members-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	getPublicExhibitorKitTeamMembers,
	type PublicExhibitorTeamMember,
	updatePublicExhibitorKitTeamMembers,
} from "@/lib/api/public-exhibitor-team-members";
import { cn } from "@/lib/utils";

interface MemberInput extends Omit<PublicExhibitorTeamMember, "id"> {
	id?: number;
	_destroy?: boolean;
}

function initials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function ExhibitorKitTeamMembersPage() {
	const params = useParams();
	const publicId = params.public_id as string;
	const queryClient = useQueryClient();
	const queryKey = ["public-exhibitor-kit-team-members", publicId];

	const { data, isLoading, isError } = useQuery({
		queryKey,
		queryFn: () => getPublicExhibitorKitTeamMembers(publicId),
		retry: false,
	});

	const [members, setMembers] = useState<MemberInput[]>([]);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [formName, setFormName] = useState("");
	const [formEmail, setFormEmail] = useState("");
	const [formPhone, setFormPhone] = useState("");

	useEffect(() => {
		if (data) setMembers(data.team_members);
	}, [data]);

	useEffect(() => {
		document.title = data?.company_name
			? `Team Members — ${data.company_name}`
			: "Team Members";
	}, [data?.company_name]);

	const updateMutation = useMutation({
		mutationFn: (payload: MemberInput[]) =>
			updatePublicExhibitorKitTeamMembers(publicId, payload),
		onSuccess: (result) => {
			setMembers(result.team_members);
			queryClient.setQueryData(queryKey, result);
			toast.success("Team members updated");
		},
		onError: (err: Error) => {
			toast.error(err.message || "Failed to update team members");
		},
	});

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background px-4">
				<div className="w-full max-w-sm text-center">
					<div className="mx-auto mb-4 flex size-12 items-center justify-center border-2 border-destructive">
						<AlertCircle className="size-6 text-destructive" />
					</div>
					<h1 className="font-bold text-xl">Invalid Link</h1>
					<p className="mt-2 text-muted-foreground text-sm">
						This invite link is invalid or has expired. Ask the organizer for a
						fresh link.
					</p>
				</div>
			</div>
		);
	}

	const limit = data.team_member_limit;
	const hasLimit = limit !== null;
	const fee = Number(data.extra_team_member_fee) || 0;
	const { visibleMembers, freeMembers, paidMembers } =
		getVisibleTeamMemberSections(members, limit);
	const excessCount = hasLimit
		? Math.max(visibleMembers.length - (limit ?? 0), 0)
		: 0;
	const extraCharges = excessCount * fee;
	const isEditing = editingIndex !== null;

	const resetForm = () => {
		setEditingIndex(null);
		setFormName("");
		setFormEmail("");
		setFormPhone("");
	};

	const handleEdit = (index: number) => {
		const member = members[index];
		setEditingIndex(index);
		setFormName(member.full_name);
		setFormEmail(member.email);
		setFormPhone(member.phone);
	};

	const handleSubmitForm = () => {
		if (!formName.trim()) {
			toast.error("Please enter a name");
			return;
		}
		const value = {
			full_name: formName.trim(),
			email: formEmail.trim(),
			phone: formPhone.trim(),
		};
		if (editingIndex !== null) {
			setMembers(
				members.map((m, i) => (i === editingIndex ? { ...m, ...value } : m)),
			);
		} else {
			setMembers([...members, value]);
		}
		resetForm();
	};

	const handleRemove = (index: number) => {
		const member = members[index];
		if (member.id) {
			setMembers(
				members.map((m, i) => (i === index ? { ...m, _destroy: true } : m)),
			);
		} else {
			setMembers(members.filter((_, i) => i !== index));
		}
		if (editingIndex === index) resetForm();
	};

	const handleSave = () => {
		updateMutation.mutate(members);
	};

	const renderMemberRow = (
		entry: { member: MemberInput; index: number },
		options: {
			isPaid: boolean;
			avatarClassName: string;
			rowClassName?: string;
		},
	) => (
		<div
			key={entry.member.id ?? `new-${entry.index}`}
			className={cn(
				"flex items-center gap-4 px-4 py-3",
				editingIndex === entry.index && "bg-muted/50",
				options.rowClassName,
			)}
		>
			<div
				className={cn(
					"flex size-9 shrink-0 items-center justify-center font-semibold text-xs",
					options.avatarClassName,
				)}
			>
				{initials(entry.member.full_name)}
			</div>
			<div className="grid min-w-0 flex-1 gap-0.5 sm:grid-cols-3 sm:items-center sm:gap-3">
				<span className="truncate font-medium text-sm">
					{entry.member.full_name}
				</span>
				<span className="truncate text-muted-foreground text-xs sm:text-sm">
					{entry.member.email || "—"}
				</span>
				<span className="truncate text-muted-foreground text-xs sm:text-sm">
					{entry.member.phone || "—"}
				</span>
			</div>
			{options.isPaid && fee > 0 && (
				<span className="shrink-0 whitespace-nowrap font-medium text-amber-700 text-xs dark:text-amber-400">
					+RM {fee.toFixed(2)}
				</span>
			)}
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				onClick={() => handleEdit(entry.index)}
				className="shrink-0 rounded-none text-muted-foreground hover:bg-muted"
			>
				<Pencil className="size-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				onClick={() => handleRemove(entry.index)}
				className={cn(
					"shrink-0 rounded-none text-red-500",
					options.isPaid
						? "hover:bg-red-100 hover:text-red-600"
						: "hover:bg-red-50 hover:text-red-600",
				)}
			>
				<Trash2 className="size-4" />
			</Button>
		</div>
	);

	return (
		<div className="min-h-screen bg-background">
			{/* Hero band */}
			<div className="border-foreground/10 border-b bg-foreground text-background">
				<div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-10">
					<p className="font-semibold text-[11px] text-background/80 uppercase tracking-[0.2em]">
						{data.event_title}
					</p>
					<div className="mt-3 flex flex-wrap items-end justify-between gap-4">
						<h1 className="font-bold text-3xl tracking-tight sm:text-4xl">
							{data.company_name}
						</h1>
						<span className="border border-background/30 px-3 py-1 font-mono text-xs tracking-wider">
							BOOTH {data.booth_number ?? "TBD"}
						</span>
					</div>
				</div>
			</div>

			<div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-10">
				{/* Member list */}
				<div className="mb-10">
					<div className="mb-3 flex items-center justify-between">
						<h2 className="font-semibold text-sm uppercase tracking-wide">
							Team
						</h2>
						{hasLimit && (
							<span className="text-muted-foreground text-xs">
								{visibleMembers.length} / {limit} free slot
								{limit === 1 ? "" : "s"}
							</span>
						)}
					</div>

					{visibleMembers.length === 0 ? (
						<div className="flex flex-col items-center gap-3 border border-dashed py-14 text-center">
							<Users className="size-6 text-muted-foreground" />
							<p className="text-muted-foreground text-sm">
								No team members added yet.
							</p>
						</div>
					) : (
						<div className="space-y-5">
							<div className="divide-y border">
								{freeMembers.map((entry) =>
									renderMemberRow(entry, {
										isPaid: false,
										avatarClassName: "bg-foreground text-background",
									}),
								)}
							</div>

							{paidMembers.length > 0 && (
								<div>
									<div className="mb-2 flex items-center justify-between">
										<p className="font-semibold text-amber-700 text-xs uppercase tracking-wide dark:text-amber-400">
											Additional Team Members — Extra Fee
										</p>
										{fee > 0 && (
											<p className="font-medium text-amber-700 text-xs dark:text-amber-400">
												{excessCount} × RM {fee.toFixed(2)} = RM{" "}
												{extraCharges.toFixed(2)}
											</p>
										)}
									</div>
									<div className="divide-y divide-amber-200 border border-amber-300 dark:divide-amber-900 dark:border-amber-800">
										{paidMembers.map((entry) =>
											renderMemberRow(entry, {
												isPaid: true,
												avatarClassName: "bg-amber-600 text-white",
												rowClassName: "bg-amber-50 dark:bg-amber-950/20",
											}),
										)}
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Add / edit member */}
				<div
					className={cn("mb-10 border p-5", isEditing && "border-foreground")}
				>
					<div className="mb-4 flex items-center justify-between">
						<h2 className="font-semibold text-sm uppercase tracking-wide">
							{isEditing ? "Edit Team Member" : "Add Team Member"}
						</h2>
						{isEditing && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={resetForm}
								className="h-7 rounded-none text-muted-foreground text-xs"
							>
								<X className="mr-1 size-3.5" />
								Cancel
							</Button>
						)}
					</div>
					<div className="grid gap-2 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
						<Input
							value={formName}
							onChange={(e) => setFormName(e.target.value)}
							placeholder="Full name"
							className="rounded-none"
						/>
						<Input
							type="email"
							value={formEmail}
							onChange={(e) => setFormEmail(e.target.value)}
							placeholder="Email"
							className="rounded-none"
						/>
						<Input
							value={formPhone}
							onChange={(e) => setFormPhone(e.target.value)}
							placeholder="Phone"
							className="rounded-none"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleSubmitForm();
								}
							}}
						/>
						<Button
							type="button"
							onClick={handleSubmitForm}
							className="rounded-none"
						>
							{isEditing ? (
								"Update"
							) : (
								<>
									<Plus className="mr-2 size-4" />
									Add
								</>
							)}
						</Button>
					</div>
					<p className="mt-3 flex items-center gap-1.5 text-muted-foreground text-xs">
						<AlertCircle className="size-3.5 shrink-0" />
						Use each member's real email so they can receive their QR code.
					</p>
				</div>

				<div className="flex justify-end">
					<Button
						onClick={handleSave}
						disabled={updateMutation.isPending}
						size="lg"
						className="rounded-none px-10"
					>
						{updateMutation.isPending ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save Changes"
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
