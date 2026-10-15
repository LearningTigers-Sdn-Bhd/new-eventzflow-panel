// new-eventzflow-panel/src/components/pages/business-matching/host-details-dialog.tsx

import { Camera, Clock, Copy, Mail, Phone, Trash2, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { MultiSelectLegacy } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import {
	useAdminUpdateHostAvatar,
	useAdminUpdateHostProfileInfo,
	useAdminUpdateHostTags,
	useBusinessMatchingTags,
	useRemoveHost,
} from "@/hooks/use-business-matching";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import type { BusinessHost } from "@/lib/api/business-matching";
import { uploadFile } from "@/lib/api/upload/endpoints";
import { PROFILE_TEXT_FIELD_MAX_LENGTH } from "@/lib/constants/business-matching-constants";
import { API_BASE_URL } from "@/utils/rest-api";

interface HostDetailsDialogProps {
	host: BusinessHost;
	bmEventId: string;
	eventId: string;
}

const HostDetailsDialog: React.FC<HostDetailsDialogProps> = ({
	host,
	bmEventId,
	eventId,
}) => {
	const { closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const { mutate: removeHost, isPending: isRemoving } = useRemoveHost(eventId);
	const { mutateAsync: updateAvatar, isPending: isSavingAvatar } =
		useAdminUpdateHostAvatar(eventId);
	const { mutateAsync: saveHostTags, isPending: isSavingTags } =
		useAdminUpdateHostTags(eventId);
	const { mutateAsync: saveHostInfo, isPending: isSavingInfo } =
		useAdminUpdateHostProfileInfo(eventId);
	const { data: availableTags } = useBusinessMatchingTags(eventId);

	const [avatarUrl, setAvatarUrl] = useState(
		host.avatar_url ? `${API_BASE_URL}${host.avatar_url}` : undefined,
	);
	const [showAvatarPreview, setShowAvatarPreview] = useState(false);
	const [offeringTags, setOfferingTags] = useState(host.offering_tags || []);
	const [interestTags, setInterestTags] = useState(host.interest_tags || []);
	const [description, setDescription] = useState(host.description || "");
	const [sourcingIntent, setSourcingIntent] = useState(
		host.sourcing_intent || "",
	);
	const [capabilities, setCapabilities] = useState(host.capabilities || "");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const tagsDirty =
		JSON.stringify(offeringTags) !== JSON.stringify(host.offering_tags || []) ||
		JSON.stringify(interestTags) !== JSON.stringify(host.interest_tags || []);

	const infoDirty =
		description !== (host.description || "") ||
		sourcingIntent !== (host.sourcing_intent || "") ||
		capabilities !== (host.capabilities || "");

	const handleCopyEmail = () => {
		navigator.clipboard
			.writeText(host.email)
			.then(() => toast.success("Email copied to clipboard"))
			.catch(() => toast.error("Failed to copy email"));
	};

	const handleAvatarChange = async (file: File | null) => {
		if (!file) return;
		try {
			const uploaded = await uploadFile(file, "general");
			await updateAvatar({
				hostUserId: host.id,
				avatarSignedId: uploaded.signed_id,
			});
			setAvatarUrl(URL.createObjectURL(file));
			toast.success("Host photo updated");
		} catch (err) {
			toast.error("Failed to update host photo", {
				description: err instanceof Error ? err.message : "Please try again.",
			});
		}
	};

	const handleSaveTags = async () => {
		try {
			await saveHostTags({
				hostUserId: host.id,
				offeringTags,
				interestTags,
			});
			toast.success("Host's tags updated");
		} catch (err) {
			toast.error("Failed to update host's tags", {
				description: err instanceof Error ? err.message : "Please try again.",
			});
		}
	};

	const handleSaveInfo = async () => {
		try {
			await saveHostInfo({
				hostUserId: host.id,
				description,
				sourcingIntent,
				capabilities,
			});
			toast.success("Host's profile info updated");
		} catch (err) {
			toast.error("Failed to update host's profile info", {
				description: err instanceof Error ? err.message : "Please try again.",
			});
		}
	};

	const infoSections = [
		{
			value: "description",
			label: "Description",
			text: description,
			onChange: setDescription,
		},
		{
			value: "sourcing_intent",
			label: "Sourcing intent",
			text: sourcingIntent,
			onChange: setSourcingIntent,
		},
		{
			value: "capabilities",
			label: "Capabilities",
			text: capabilities,
			onChange: setCapabilities,
		},
	];

	const isDirty = tagsDirty || infoDirty;
	const isSaving = isSavingInfo || isSavingTags;

	const handleSaveAll = async () => {
		if (infoDirty) await handleSaveInfo();
		if (tagsDirty) await handleSaveTags();
	};

	const initials = host.full_name.slice(0, 2).toUpperCase();

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
				<div className="flex items-center gap-4">
					<div className="relative shrink-0">
						{avatarUrl ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										type="button"
										className="block"
										disabled={isSavingAvatar}
									>
										<Avatar className="size-16 border">
											<AvatarImage src={avatarUrl} alt={host.full_name} />
											<AvatarFallback className="bg-primary/10 font-semibold text-base text-primary">
												{initials}
											</AvatarFallback>
										</Avatar>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start" className="rounded-none">
									<DropdownMenuItem
										className="rounded-none"
										onClick={() => setShowAvatarPreview(true)}
									>
										View photo
									</DropdownMenuItem>
									<DropdownMenuItem
										className="rounded-none"
										onClick={() => fileInputRef.current?.click()}
									>
										Change photo
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={isSavingAvatar}
								className="group block"
								title="Add photo"
							>
								<Avatar className="size-16 border">
									<AvatarFallback className="relative bg-primary/10 font-semibold text-base text-primary">
										{initials}
										<span className="absolute inset-0 flex items-center justify-center bg-background/90 opacity-0 transition-opacity group-hover:opacity-100">
											<Camera className="h-5 w-5 text-muted-foreground" />
										</span>
									</AvatarFallback>
								</Avatar>
							</button>
						)}
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="sr-only"
							onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
						/>
					</div>
					<div className="min-w-0 flex-1 space-y-1">
						<div className="truncate font-semibold text-lg leading-tight">
							{host.full_name}
						</div>
						<div className="flex items-center gap-1.5 text-muted-foreground text-sm">
							<Mail className="h-3.5 w-3.5 shrink-0" />
							<span className="truncate">{host.email}</span>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 shrink-0 rounded-none"
								onClick={handleCopyEmail}
								title="Copy email"
							>
								<Copy className="h-3 w-3" />
							</Button>
						</div>
						<a
							className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
							href={`tel:${host.phone}`}
						>
							<Phone className="h-3.5 w-3.5 shrink-0" />
							{host.phone || "N/A"}
						</a>
					</div>
				</div>

				{showAvatarPreview && avatarUrl && (
					<button
						type="button"
						onClick={() => setShowAvatarPreview(false)}
						className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/80 p-8"
					>
						<img
							src={avatarUrl}
							alt={host.full_name}
							className="max-h-full max-w-full object-contain"
						/>
						<X className="absolute top-4 right-4 h-6 w-6 text-white" />
					</button>
				)}

				<section className="space-y-3 border-t pt-4">
					<h4 className="font-semibold text-sm">Matching tags</h4>
					<div className="grid gap-4">
						<div className="grid gap-1.5">
							<Label className="text-muted-foreground text-xs">
								Offering tags
							</Label>
							<MultiSelectLegacy
								options={(availableTags?.offering_tags || []).map((t) => ({
									label: t,
									value: t,
								}))}
								selected={offeringTags}
								onChange={setOfferingTags}
								placeholder="Select offering tags"
								className="min-h-9 rounded-none text-sm"
							/>
						</div>
						<div className="grid gap-1.5">
							<Label className="text-muted-foreground text-xs">
								Interest tags
							</Label>
							<MultiSelectLegacy
								options={(availableTags?.interest_tags || []).map((t) => ({
									label: t,
									value: t,
								}))}
								selected={interestTags}
								onChange={setInterestTags}
								placeholder="Select interest tags"
								className="min-h-9 rounded-none text-sm"
							/>
						</div>
					</div>
				</section>

				<section className="space-y-4 border-t pt-4">
					<h4 className="font-semibold text-sm">Profile</h4>
					{infoSections.map((sec) => (
						<div key={sec.value} className="grid gap-1.5">
							<div className="flex items-center justify-between gap-2">
								<Label className="text-muted-foreground text-xs">
									{sec.label}
								</Label>
								{!sec.text && (
									<Badge
										variant="secondary"
										className="rounded-none bg-amber-100 text-amber-800"
									>
										<Clock />
										Not added yet
									</Badge>
								)}
							</div>
							<Textarea
								value={sec.text}
								onChange={(e) => sec.onChange(e.target.value)}
								rows={3}
								maxLength={PROFILE_TEXT_FIELD_MAX_LENGTH}
								className="resize-y rounded-none text-sm"
							/>
							<span className="text-right text-muted-foreground text-xs tabular-nums">
								{sec.text.length}/{PROFILE_TEXT_FIELD_MAX_LENGTH}
							</span>
						</div>
					))}
				</section>
			</div>

			<div className="flex shrink-0 items-center justify-between gap-2 border-t bg-background pt-4">
				<Button
					type="button"
					variant="outline"
					className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
					onClick={() => {
						openConfirm({
							message: `Are you absolutely sure you want to remove ${host.full_name} as the host for this business matching session? This action cannot be undone.`,
							confirmLabel: "Yes, Remove Host",
							variant: "destructive",
							onConfirm: () => {
								removeHost(bmEventId, {
									onSuccess: () => {
										toast.success("Host removed successfully");
										closeDialog();
									},
									onError: (error) => {
										toast.error("Failed to remove host", {
											description:
												error.message || "An unexpected error occurred.",
										});
									},
								});
							},
						});
					}}
					disabled={isRemoving}
				>
					<Trash2 className="h-4 w-4" />
					Remove host
				</Button>

				<Button
					type="button"
					className="rounded-none"
					onClick={handleSaveAll}
					disabled={!isDirty || isSaving}
				>
					{isSaving ? "Saving..." : "Save changes"}
				</Button>
			</div>
		</div>
	);
};

export default HostDetailsDialog;
