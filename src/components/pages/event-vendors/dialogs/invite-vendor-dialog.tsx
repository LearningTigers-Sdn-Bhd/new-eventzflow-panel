"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link2, Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { generateVendorInviteLink } from "@/lib/api/vendor-invitation";
import { getGroups } from "@/lib/api/group";
import { getTeamMembers } from "@/lib/api/team";
import { useAuth } from "@/hooks/use-auth";

interface InviteVendorDialogProps {
	eventId: number;
	trigger?: React.ReactNode;
}

export function InviteVendorDialog({ eventId, trigger }: InviteVendorDialogProps) {
	const [open, setOpen] = useState(false);
	const [inviteUrl, setInviteUrl] = useState<string | null>(null);
	const [expiresAt, setExpiresAt] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [selectedGroupId, setSelectedGroupId] = useState<string>("");
	const [selectedOrganizerId, setSelectedOrganizerId] = useState<string>("");
	const { user } = useAuth();
	const isOrgOwner = user?.role === "org_owner";

	// Fetch groups for the dropdown
	const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
		queryKey: ["groups"],
		queryFn: getGroups,
		enabled: open,
	});

	// Fetch organizers for org_owner dropdown
	const { data: teamMembers = [], isLoading: isLoadingOrganizers } = useQuery({
		queryKey: ["team_members"],
		queryFn: getTeamMembers,
		enabled: open && isOrgOwner,
	});

	// Filter only organizers and the org_owner themselves
	const organizers = teamMembers.filter(
		(member) => member.role === "organizer" || member.role === "org_owner"
	);

	const generateMutation = useMutation({
		mutationFn: () => {
			const groupId = selectedGroupId && selectedGroupId !== "none"
				? Number.parseInt(selectedGroupId)
				: undefined;
			const organizerId = isOrgOwner && selectedOrganizerId && selectedOrganizerId !== "self"
				? selectedOrganizerId
				: undefined;
			return generateVendorInviteLink(eventId, groupId, organizerId);
		},
		onSuccess: (response) => {
			setInviteUrl(response.data.invite_url);
			setExpiresAt(response.data.expires_at);
		},
		onError: (error: Error) => {
			toast.error("Failed to generate link", {
				description: error.message,
			});
		},
	});

	// Don't auto-generate - wait for user to optionally select a group first
	const handleGenerateLink = () => {
		generateMutation.mutate();
	};

	const handleCopy = async () => {
		if (inviteUrl) {
			await navigator.clipboard.writeText(inviteUrl);
			setCopied(true);
			toast.success("Link copied to clipboard!");
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			// Reset state when dialog closes
			setInviteUrl(null);
			setExpiresAt(null);
			setCopied(false);
			setSelectedGroupId("");
			setSelectedOrganizerId("");
		}
	};

	const formatExpiryDate = (isoDate: string) => {
		return new Date(isoDate).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline">
						<Link2 className="mr-2 h-4 w-4" />
						Invite Vendor
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Invite Vendor</DialogTitle>
					<DialogDescription>
						Share this invitation link with vendors. They can use it to register
						and join your event.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 pt-4">
					{!inviteUrl && !generateMutation.isPending ? (
						// Step 1: Select group (optional) and generate link
						<div className="space-y-4">
							{isOrgOwner && (
								<div className="space-y-2">
									<Label>Attach Vendor To (Required for Org Owner)</Label>
									<Select
										value={selectedOrganizerId}
										onValueChange={setSelectedOrganizerId}
										disabled={isLoadingOrganizers}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder={isLoadingOrganizers ? "Loading organizers..." : "Select organizer or yourself"} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="self">Myself (Org Owner)</SelectItem>
											{organizers
												.filter((org) => org.role === "organizer")
												.map((organizer) => (
													<SelectItem key={organizer.id} value={organizer.id}>
														{organizer.full_name} ({organizer.email})
													</SelectItem>
												))}
										</SelectContent>
									</Select>
									<p className="text-muted-foreground text-xs">
										The vendor will be attached to the selected organizer or yourself.
									</p>
								</div>
							)}
							<div className="space-y-2">
								<Label>Assign to Group (Optional)</Label>
								<Select
									value={selectedGroupId}
									onValueChange={setSelectedGroupId}
									disabled={isLoadingGroups}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder={isLoadingGroups ? "Loading groups..." : "Select a group"} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">No group</SelectItem>
										{groups.map((group) => (
											<SelectItem key={group.id} value={group.id.toString()}>
												{group.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-muted-foreground text-xs">
									The vendor will be automatically added to this group when they register.
								</p>
							</div>

							<Button
								onClick={handleGenerateLink}
								disabled={generateMutation.isPending || (isOrgOwner && !selectedOrganizerId)}
								className="w-full"
							>
								{generateMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Generating...
									</>
								) : (
									<>
										<Link2 className="mr-2 h-4 w-4" />
										Generate Invitation Link
									</>
								)}
							</Button>
						</div>
					) : generateMutation.isPending ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
							<p className="text-muted-foreground text-sm">
								Generating invitation link...
							</p>
						</div>
					) : inviteUrl ? (
						<>
							<div className="space-y-2">
								<Label>Invitation Link</Label>
								<div className="flex gap-2">
									<Input
										value={inviteUrl}
										readOnly
										className="font-mono text-sm"
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={handleCopy}
										className="shrink-0"
									>
										{copied ? (
											<Check className="h-4 w-4 text-green-500" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</Button>
								</div>
								{expiresAt && (
									<p className="text-muted-foreground text-xs">
										This link expires on {formatExpiryDate(expiresAt)}
									</p>
								)}
							</div>

							{selectedGroupId && selectedGroupId !== "none" && (
								<div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
									<p className="text-sm">
										<span className="text-muted-foreground">Will be assigned to group: </span>
										<span className="font-medium">
											{groups.find((g) => g.id.toString() === selectedGroupId)?.name}
										</span>
									</p>
								</div>
							)}

							<div className="rounded-lg border bg-muted/50 p-4">
								<h4 className="mb-2 font-medium text-sm">How to use:</h4>
								<ol className="list-inside list-decimal space-y-1 text-muted-foreground text-sm">
									<li>Copy the invitation link above</li>
									<li>Share it with the vendor (email, WhatsApp, etc.)</li>
									<li>The vendor clicks the link and registers their account</li>
									<li>They will automatically be added to this event</li>
								</ol>
							</div>

							<div className="flex justify-end pt-2">
								<Button onClick={handleCopy}>
									{copied ? (
										<Check className="mr-2 h-4 w-4" />
									) : (
										<Copy className="mr-2 h-4 w-4" />
									)}
									{copied ? "Copied!" : "Copy Link"}
								</Button>
							</div>
						</>
					) : (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<div className="mb-4 rounded-full bg-destructive/10 p-4">
								<Link2 className="h-8 w-8 text-destructive" />
							</div>
							<p className="mb-4 text-muted-foreground text-sm">
								Failed to generate invitation link. Please try again.
							</p>
							<Button
								onClick={() => generateMutation.mutate()}
								disabled={generateMutation.isPending}
							>
								Retry
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
