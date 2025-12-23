import { Link as LinkIcon, Loader2, UserPlus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateAndAssignHost } from "@/hooks/use-business-matching";
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

	// Tab 1: Invite Link
	const inviteLink = `${window.location.origin}/invite/host?event_id=${bmEvent.event_id}&bm_event_id=${bmEvent.id}`;
	const copyInviteLink = () => {
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
						<Input id="invite-link" value={inviteLink} readOnly />
						<Button onClick={copyInviteLink}>Copy</Button>
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
