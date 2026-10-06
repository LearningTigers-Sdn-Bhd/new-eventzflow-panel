import { useQuery } from "@tanstack/react-query";
import {
	CheckCircle2,
	Copy,
	Link as LinkIcon,
	Loader2,
	Mail,
	Store,
	UserPlus,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelectLegacy } from "@/components/ui/multi-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	useBusinessMatchingTags,
	useCreateAndAssignHost,
	useGenerateHostInviteToken,
	useLinkExhibitorHost,
	useSendHostInviteEmail,
} from "@/hooks/use-business-matching";
import { useDialog } from "@/hooks/use-dialog";
import { useEventVendors } from "@/hooks/use-event-vendors";
import { checkAccount, emailSchema } from "@/lib/api/auth";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import { getEventById } from "@/lib/api/event";

interface AttachHostDialogProps {
	bmEvent: BusinessMatchingEvent;
}

type HostEmailStep = "check_email" | "account_found" | "new_account";

const AttachHostDialog: React.FC<AttachHostDialogProps> = ({ bmEvent }) => {
	const { closeDialog } = useDialog();
	const { mutate: createHost, isPending: isCreating } = useCreateAndAssignHost(
		bmEvent.event_id,
	);
	const { mutate: linkExhibitor, isPending: isLinking } = useLinkExhibitorHost(
		bmEvent.event_id,
	);
	const { mutate: sendInviteEmail, isPending: isSendingInviteEmail } =
		useSendHostInviteEmail(bmEvent.event_id);
	const { data: availableTags } = useBusinessMatchingTags(bmEvent.event_id);

	const { data: event } = useQuery({
		queryKey: ["event", bmEvent.event_id],
		queryFn: () => getEventById(bmEvent.event_id),
		enabled: !!bmEvent.event_id,
	});
	const linkedExhibitorEnabled =
		event?.business_matching_linked_exhibitor_enabled ?? false;

	const { data: eventVendors, isLoading: isLoadingExhibitors } =
		useEventVendors(Number(bmEvent.event_id));
	const exhibitors = (eventVendors || []).filter((v) => v.type === "Exhibitor");

	// Tab 3: Link an existing exhibitor as host — no new account, no new
	// password, they log in with whatever they already have.
	const [selectedExhibitorId, setSelectedExhibitorId] = useState<string>("");

	const handleLinkExhibitor = () => {
		if (!selectedExhibitorId) {
			toast.error("Select an exhibitor to link.");
			return;
		}

		linkExhibitor(
			{
				bmEventId: bmEvent.id,
				eventVendorId: Number(selectedExhibitorId),
			},
			{
				onSuccess: (data) => {
					toast.success(
						`"${data.full_name}" linked as host using their exhibitor account.`,
					);
					closeDialog();
				},
				onError: (error) => {
					toast.error("Failed to link exhibitor as host", {
						description: error.message || "An unexpected error occurred.",
					});
				},
			},
		);
	};

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

	// Tab 2: Add Host by Email Flow (Canva-inspired: Check email first)
	const [hostStep, setHostStep] = useState<HostEmailStep>("check_email");
	const [hostName, setHostName] = useState("");
	const [hostEmail, setHostEmail] = useState("");
	const [hostPhone, setHostPhone] = useState("");
	const [hostPassword, setHostPassword] = useState("");
	const [offeringTags, setOfferingTags] = useState<string[]>([]);
	const [interestTags, setInterestTags] = useState<string[]>([]);
	const [isCheckingEmail, setIsCheckingEmail] = useState(false);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [customInviteNote, setCustomInviteNote] = useState("");

	const handleCheckEmail = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		setEmailError(null);

		const trimmedEmail = hostEmail.trim().toLowerCase();
		const validationResult = emailSchema.safeParse(trimmedEmail);
		if (!validationResult.success) {
			setEmailError(
				validationResult.error.issues[0]?.message || "Invalid email address",
			);
			return;
		}

		setIsCheckingEmail(true);
		try {
			const res = await checkAccount(trimmedEmail);
			if (res.data.exists) {
				setHostStep("account_found");
			} else {
				setHostStep("new_account");
			}
		} catch (err) {
			const msg =
				err instanceof Error
					? err.message
					: "Failed to check email. Please try again.";
			setEmailError(msg);
		} finally {
			setIsCheckingEmail(false);
		}
	};

	const handleSendEmailInvite = () => {
		const trimmedEmail = hostEmail.trim().toLowerCase();
		if (!trimmedEmail) return;

		sendInviteEmail(
			{
				bmEventId: bmEvent.id,
				email: trimmedEmail,
				message: customInviteNote.trim() || undefined,
			},
			{
				onSuccess: (data) => {
					toast.success(
						data.message || `Invitation email sent to ${trimmedEmail}!`,
					);
				},
				onError: (error) => {
					toast.error("Failed to send invitation email", {
						description: error.message || "An unexpected error occurred.",
					});
				},
			},
		);
	};

	const handleResetEmailFlow = () => {
		setHostStep("check_email");
		setEmailError(null);
		setCustomInviteNote("");
	};

	const handleCreateHost = async () => {
		const trimmedEmail = hostEmail.trim().toLowerCase();
		if (!hostName || !trimmedEmail || !hostPassword) {
			toast.error("Host name, email, and password are required.");
			return;
		}

		createHost(
			{
				bmEventId: bmEvent.id,
				data: {
					full_name: hostName,
					email: trimmedEmail,
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
			<TabsList
				className={`grid w-full ${linkedExhibitorEnabled ? "grid-cols-3" : "grid-cols-2"}`}
			>
				<TabsTrigger value="invite">
					<LinkIcon className="mr-2 h-4 w-4" />
					Invite with Link
				</TabsTrigger>
				<TabsTrigger value="create">
					<UserPlus className="mr-2 h-4 w-4" />
					Add by Email
				</TabsTrigger>
				{linkedExhibitorEnabled && (
					<TabsTrigger value="link-exhibitor">
						<Store className="mr-2 h-4 w-4" />
						Link Exhibitor
					</TabsTrigger>
				)}
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
				{hostStep === "check_email" && (
					<form onSubmit={handleCheckEmail} className="space-y-4">
						<p className="text-muted-foreground text-sm">
							Enter the host's email to get started. We'll check if they already
							have an EventzFlow account.
						</p>
						<div className="space-y-2">
							<Label htmlFor="host-check-email">Host Email</Label>
							<Input
								id="host-check-email"
								type="email"
								value={hostEmail}
								onChange={(e) => {
									setHostEmail(e.target.value);
									if (emailError) setEmailError(null);
								}}
								placeholder="host@example.com"
							/>
							{emailError && (
								<p className="text-destructive text-xs">{emailError}</p>
							)}
						</div>
						<div className="flex justify-end pt-2">
							<Button
								type="submit"
								disabled={isCheckingEmail || !hostEmail.trim()}
							>
								{isCheckingEmail && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Continue
							</Button>
						</div>
					</form>
				)}

				{hostStep === "account_found" && (
					<div className="space-y-4">
						<div className="space-y-2 rounded-lg border bg-muted/40 p-4">
							<div className="flex items-center gap-2 font-medium text-foreground">
								<CheckCircle2 className="h-5 w-5 text-green-600" />
								<span>Existing Account Found</span>
							</div>
							<p className="text-muted-foreground text-sm">
								An account with{" "}
								<strong className="text-foreground">
									{hostEmail.trim().toLowerCase()}
								</strong>{" "}
								already exists in EventzFlow.
							</p>
							<p className="text-muted-foreground text-xs">
								Invite them to this session using their existing account.
							</p>
						</div>

						<div className="space-y-3">
							<div className="space-y-1.5">
								<Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Option 1: Send Invitation Email
								</Label>
								<p className="text-muted-foreground text-xs">
									Send an email invite with a direct join link to{" "}
									{hostEmail.trim().toLowerCase()}.
								</p>
								<div className="space-y-1 py-1">
									<Label htmlFor="custom-invite-note" className="text-xs">
										Personal Note / Custom Message (Optional)
									</Label>
									<Textarea
										id="custom-invite-note"
										placeholder="Add a personal note or custom instructions..."
										value={customInviteNote}
										onChange={(e) => setCustomInviteNote(e.target.value)}
										rows={2}
										className="text-xs"
									/>
								</div>
								<Button
									type="button"
									onClick={handleSendEmailInvite}
									disabled={isSendingInviteEmail}
									className="w-full"
								>
									{isSendingInviteEmail ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<Mail className="mr-2 h-4 w-4" />
									)}
									Send Invitation Email
								</Button>
							</div>

							<div className="relative py-2">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground">
										Or
									</span>
								</div>
							</div>

							<div className="space-y-1.5">
								<Label
									htmlFor="invite-link-found"
									className="font-semibold text-muted-foreground text-xs uppercase tracking-wider"
								>
									Option 2: Copy Invitation Link
								</Label>
								<div className="flex gap-2">
									<Input
										id="invite-link-found"
										value={
											isLoadingInviteLink ? "Generating link..." : inviteLink
										}
										readOnly
									/>
									<Button
										type="button"
										variant="secondary"
										onClick={copyInviteLink}
										disabled={!inviteLink}
									>
										<Copy className="mr-2 h-4 w-4" />
										Copy
									</Button>
								</div>
							</div>
						</div>

						<div className="pt-2 text-center">
							<button
								type="button"
								onClick={handleResetEmailFlow}
								className="text-muted-foreground text-xs underline hover:text-foreground"
							>
								Check a different email
							</button>
						</div>
					</div>
				)}

				{hostStep === "new_account" && (
					<div className="space-y-4">
						<p className="text-muted-foreground text-sm">
							Create an account for the host and assign them to this session
							directly. Their email will be auto-verified.
						</p>
						<div className="space-y-1">
							<Label htmlFor="host-email">Host Email</Label>
							<Input
								id="host-email"
								type="email"
								value={hostEmail.trim().toLowerCase()}
								readOnly
								className="cursor-not-allowed bg-muted"
							/>
							<div>
								<button
									type="button"
									onClick={handleResetEmailFlow}
									className="text-primary text-xs underline hover:text-primary/80"
								>
									Change email
								</button>
							</div>
						</div>
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
							<Label htmlFor="host-offering-tags">
								Offering Tags (Optional)
							</Label>
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
							<Label htmlFor="host-interest-tags">
								Interest Tags (Optional)
							</Label>
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
								{isCreating && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Create and Assign Host
							</Button>
						</div>
					</div>
				)}
			</TabsContent>
			{linkedExhibitorEnabled && (
				<TabsContent value="link-exhibitor" className="py-4">
					<div className="space-y-4">
						<p className="text-muted-foreground text-sm">
							Use an existing exhibitor's account for hosting — no new account
							or password needed, they log in with what they already have.
						</p>
						<div className="space-y-2">
							<Label htmlFor="link-exhibitor-select">Exhibitor</Label>
							<Select
								value={selectedExhibitorId}
								onValueChange={setSelectedExhibitorId}
							>
								<SelectTrigger id="link-exhibitor-select">
									<SelectValue
										placeholder={
											isLoadingExhibitors
												? "Loading exhibitors..."
												: "Select an exhibitor"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{exhibitors.length === 0 && !isLoadingExhibitors && (
										<div className="px-2 py-1.5 text-muted-foreground text-sm">
											No exhibitors found for this event.
										</div>
									)}
									{exhibitors.map((exhibitor) => (
										<SelectItem key={exhibitor.id} value={String(exhibitor.id)}>
											{exhibitor.vendor.full_name} ({exhibitor.vendor.email})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex justify-end pt-4">
							<Button onClick={handleLinkExhibitor} disabled={isLinking}>
								{isLinking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Link Exhibitor as Host
							</Button>
						</div>
					</div>
				</TabsContent>
			)}
		</Tabs>
	);
};

export default AttachHostDialog;
