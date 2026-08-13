// new-eventzflow-panel/src/components/pages/business-matching/host-details-dialog.tsx

import { Camera, Clock, Copy, Trash2, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { MultiSelectLegacy } from "@/components/ui/multi-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
			label: "Sourcing Intent",
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

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-3">
				<div className="relative shrink-0">
					{avatarUrl ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="block"
									disabled={isSavingAvatar}
								>
									<Avatar className="size-12 border">
										<AvatarImage src={avatarUrl} alt={host.full_name} />
										<AvatarFallback className="text-xs">
											{host.full_name.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								<DropdownMenuItem onClick={() => setShowAvatarPreview(true)}>
									View Photo
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
									Change Photo
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							disabled={isSavingAvatar}
							className="group block"
							title="Add Photo"
						>
							<Avatar className="size-12 border">
								<AvatarFallback className="relative text-xs">
									{host.full_name.slice(0, 2).toUpperCase()}
									<span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-background/90 opacity-0 transition-opacity group-hover:opacity-100">
										<Camera className="h-3.5 w-3.5 text-muted-foreground" />
									</span>
								</AvatarFallback>
							</Avatar>
							<span className="mt-0.5 block text-[9px] text-muted-foreground">
								Add Photo
							</span>
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
				<div className="min-w-0 flex-1 space-y-0.5">
					<div className="truncate font-medium text-sm">{host.full_name}</div>
					<div className="flex items-center gap-1 text-muted-foreground text-xs">
						<span className="truncate">{host.email}</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-4 w-4 shrink-0"
							onClick={handleCopyEmail}
						>
							<Copy className="h-2.5 w-2.5" />
						</Button>
					</div>
					<a
						className="block text-muted-foreground text-xs"
						href={`tel:${host.phone}`}
					>
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
						className="max-h-full max-w-full rounded-lg object-contain"
					/>
					<X className="absolute top-4 right-4 h-6 w-6 text-white" />
				</button>
			)}

			<div className="space-y-2 rounded-lg border p-2">
				<div className="grid gap-1.5">
					<Label className="text-muted-foreground text-xs">Offering Tags</Label>
					<MultiSelectLegacy
						options={(availableTags?.offering_tags || []).map((t) => ({
							label: t,
							value: t,
						}))}
						selected={offeringTags}
						onChange={setOfferingTags}
						placeholder="Select offering tags"
						className="h-8 text-xs"
					/>
				</div>
				<div className="grid gap-1.5">
					<Label className="text-muted-foreground text-xs">Interest Tags</Label>
					<MultiSelectLegacy
						options={(availableTags?.interest_tags || []).map((t) => ({
							label: t,
							value: t,
						}))}
						selected={interestTags}
						onChange={setInterestTags}
						placeholder="Select interest tags"
						className="h-8 text-xs"
					/>
				</div>
			</div>

			<Tabs defaultValue={infoSections[0].value} className="w-full">
				<TabsList className="grid h-8 w-full grid-cols-3">
					{infoSections.map((s) => (
						<TabsTrigger key={s.value} value={s.value} className="text-[11px]">
							{s.label}
						</TabsTrigger>
					))}
				</TabsList>
				{infoSections.map((s) => (
					<TabsContent key={s.value} value={s.value} className="mt-2 space-y-1">
						{!s.text && (
							<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
								<Clock className="h-2.5 w-2.5" />
								Pending host update — not added yet
							</div>
						)}
						<Textarea
							value={s.text}
							onChange={(e) => s.onChange(e.target.value)}
							rows={3}
							className="resize-y text-xs"
						/>
					</TabsContent>
				))}
			</Tabs>

			<div className="flex items-center justify-between border-t pt-3">
				<Button
					type="button"
					variant="destructive"
					size="icon"
					className="h-8 w-8"
					title="Remove Host"
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
					<Trash2 className="h-3.5 w-3.5" />
					<span className="sr-only">Remove Host</span>
				</Button>

				<div className="flex items-center gap-2">
					{infoDirty && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-7 text-xs"
							onClick={handleSaveInfo}
							disabled={isSavingInfo}
						>
							{isSavingInfo ? "Saving..." : "Save Info"}
						</Button>
					)}
					{tagsDirty && (
						<Button
							type="button"
							size="sm"
							className="h-7 text-xs"
							onClick={handleSaveTags}
							disabled={isSavingTags}
						>
							{isSavingTags ? "Saving..." : "Save Tags"}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

export default HostDetailsDialog;
