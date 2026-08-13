import { Link as LinkIcon, Loader2, UserPlus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelectLegacy } from "@/components/ui/multi-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useBusinessMatchingTags,
	useCreateAndAssignHost,
	useGenerateHostInviteToken,
} from "@/hooks/use-business-matching";
import { useDialog } from "@/hooks/use-dialog";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";

interface AttachHostDialogProps {
	bmEvent: BusinessMatchingEvent;
}

const AttachHostDialog: React.FC<AttachHostDialogProps> = ({ bmEvent }) => {
	const { closeDialog } = useDialog();
	const { mutate: createHost, isPending: isCreating } = useCreateAndAssignHost(
		bmEvent.event_id,
	);
	const { data: availableTags } = useBusinessMatchingTags(bmEvent.event_id);

	// Tab 1: Invite Link — the link carries an opaque signed token, never
	// the raw event/session IDs, so it can't be hand-edited to point at a
	// different session.
	const { data: inviteTokenData, isLoading: isLoadingInviteLink } =
		useGenerateHostInviteToken(bmEvent.event_id, bmEvent.id);
	const inviteLink = inviteTokenData
		? `${window.location.origin}/invite/host?token=${encodeURIComponent(inviteTokenData.token)}`
		: "";
	const copyInviteLink = () => {
		if (!inviteLink) return;
		navigator.clipboard
			.writeText(inviteLink)
			.then(() => toast.success("Invite link copied to clipboard"))
			.catch(() => toast.error("Failed to copy link"));
	};

	// Tab 2: Create Host Account
	const [hostName, setHostName] = useState("");
	const [hostEmail, setHostEmail] = useState("");
	const [hostPhone, setHostPhone] = useState("");
	const [hostPassword, setHostPassword] = useState("");
	const [offeringTags, setOfferingTags] = useState<string[]>([]);
	const [interestTags, setInterestTags] = useState<string[]>([]);

	const handleCreateHost = async () => {
		if (!hostName || !hostEmail || !hostPassword) {
			toast.error("Host name, email, and password are required.");
			return;
		}

		createHost(
			{
				bmEventId: bmEvent.id,
				data: {
					full_name: hostName,
					email: hostEmail,
					phone: hostPhone,
					password: hostPassword,
					// Admin-created accounts skip the click-to-verify email step —
					// there's no self-service signup flow for the host to confirm.
					email_verified_at: new Date().toISOString(),
				},
				tags: {
					offering_tags: offeringTags,
					interest_tags: interestTags,
				},
			},
			{
				onSuccess: (data) => {
					toast.success(
						`Host "${data.full_name}" created and assigned successfully!`,
					);
					closeDialog();
				},
				onError: (error) => {
					toast.error("Failed to create host", {
						description: error.message || "An unexpected error occurred.",
					});
				},
			},
		);
	};

	return (
		<Tabs defaultValue="invite" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="invite">
					<LinkIcon className="mr-2 h-4 w-4" />
					Invite with Link
				</TabsTrigger>
				<TabsTrigger value="create">
					<UserPlus className="mr-2 h-4 w-4" />
					Create Account
				</TabsTrigger>
			</TabsList>
			<TabsContent value="invite" className="py-4">
				<div className="space-y-4">
					<Label htmlFor="invite-link">Host Invitation Link</Label>
					<p className="text-muted-foreground text-sm">
						Share this link with the host to let them join this business
						matching session.
					</p>
					<div className="flex gap-2">
						<Input
							id="invite-link"
							value={isLoadingInviteLink ? "Generating link..." : inviteLink}
							readOnly
						/>
						<Button onClick={copyInviteLink} disabled={!inviteLink}>
							Copy
						</Button>
					</div>
				</div>
			</TabsContent>
			<TabsContent value="create" className="py-4">
				<div className="space-y-4">
					<p className="text-muted-foreground text-sm">
						Create an account for the host and assign them to this session
						directly. Their email will be auto-verified.
					</p>
					<div className="space-y-2">
						<Label htmlFor="host-name">Host Full Name</Label>
						<Input
							id="host-name"
							value={hostName}
							onChange={(e) => setHostName(e.target.value)}
							placeholder="John Doe"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="host-email">Host Email</Label>
						<Input
							id="host-email"
							type="email"
							value={hostEmail}
							onChange={(e) => setHostEmail(e.target.value)}
							placeholder="host@example.com"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="host-phone">Host Phone (Optional)</Label>
						<Input
							id="host-phone"
							type="tel"
							value={hostPhone}
							onChange={(e) => setHostPhone(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="host-password">Password</Label>
						<Input
							id="host-password"
							type="password"
							value={hostPassword}
							onChange={(e) => setHostPassword(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="host-offering-tags">Offering Tags (Optional)</Label>
						<MultiSelectLegacy
							options={(availableTags?.offering_tags || []).map((t) => ({
								label: t,
								value: t,
							}))}
							selected={offeringTags}
							onChange={setOfferingTags}
							placeholder="Select offering tags"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="host-interest-tags">Interest Tags (Optional)</Label>
						<MultiSelectLegacy
							options={(availableTags?.interest_tags || []).map((t) => ({
								label: t,
								value: t,
							}))}
							selected={interestTags}
							onChange={setInterestTags}
							placeholder="Select interest tags"
						/>
					</div>
					<div className="flex justify-end pt-4">
						<Button onClick={handleCreateHost} disabled={isCreating}>
							{isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Create and Assign Host
						</Button>
					</div>
				</div>
			</TabsContent>
		</Tabs>
	);
};

export default AttachHostDialog;
