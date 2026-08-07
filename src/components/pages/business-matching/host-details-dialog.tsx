// new-eventzflow-panel/src/components/pages/business-matching/host-details-dialog.tsx

import { Copy, Trash2, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useAdminSetHostHoursEditableOverride,
	useAdminSetHostTagsEditableOverride,
	useAdminUpdateHostAvatar,
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
	// The session's defaults for tags_editable/hours_editable — used to show
	// what each toggle resolves to when there's no per-host override.
	sessionTagsEditable?: boolean;
	sessionHoursEditable?: boolean;
}

const HostDetailsDialog: React.FC<HostDetailsDialogProps> = ({
	host,
	bmEventId,
	eventId,
	sessionTagsEditable = true,
	sessionHoursEditable = true,
}) => {
	const { closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const { mutate: removeHost, isPending: isRemoving } = useRemoveHost(eventId);
	const { mutateAsync: updateAvatar, isPending: isSavingAvatar } =
		useAdminUpdateHostAvatar(eventId);
	const { mutateAsync: setTagsOverride, isPending: isSavingTagsOverride } =
		useAdminSetHostTagsEditableOverride(eventId);
	const { mutateAsync: setHoursOverride, isPending: isSavingHoursOverride } =
		useAdminSetHostHoursEditableOverride(eventId);
	const { mutateAsync: saveHostTags, isPending: isSavingTags } =
		useAdminUpdateHostTags(eventId);
	const { data: availableTags } = useBusinessMatchingTags(eventId);

	const [avatarUrl, setAvatarUrl] = useState(
		host.avatar_url ? `${API_BASE_URL}${host.avatar_url}` : undefined,
	);
	const [showAvatarPreview, setShowAvatarPreview] = useState(false);
	const [tagsEditable, setTagsEditable] = useState(
		host.tags_editable_override ?? sessionTagsEditable,
	);
	const [hoursEditable, setHoursEditable] = useState(
		host.hours_editable_override ?? sessionHoursEditable,
	);
	const [offeringTags, setOfferingTags] = useState(host.offering_tags || []);
	const [interestTags, setInterestTags] = useState(host.interest_tags || []);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const tagsDirty =
		JSON.stringify(offeringTags) !== JSON.stringify(host.offering_tags || []) ||
		JSON.stringify(interestTags) !== JSON.stringify(host.interest_tags || []);

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

	const handleTagsEditableChange = async (checked: boolean) => {
		setTagsEditable(checked);
		try {
			await setTagsOverride({
				hostUserId: host.id,
				bmEventId,
				override: checked === sessionTagsEditable ? null : checked,
			});
			toast.success("Host's tag-editing access updated");
		} catch (err) {
			setTagsEditable(!checked);
			toast.error("Failed to update tag-editing access", {
				description: err instanceof Error ? err.message : "Please try again.",
			});
		}
	};

	const handleHoursEditableChange = async (checked: boolean) => {
		setHoursEditable(checked);
		try {
			await setHoursOverride({
				hostUserId: host.id,
				bmEventId,
				override: checked === sessionHoursEditable ? null : checked,
			});
			toast.success("Host's hours-editing access updated");
		} catch (err) {
			setHoursEditable(!checked);
			toast.error("Failed to update hours-editing access", {
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

	const infoSections = [
		{ value: "description", label: "Description", content: host.description },
		{
			value: "sourcing_intent",
			label: "Sourcing Intent",
			content: host.sourcing_intent,
		},
		{
			value: "capabilities",
			label: "Capabilities",
			content: host.capabilities,
		},
	].filter((s) => s.content);

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
							className="block"
						>
							<Avatar className="size-12 border">
								<AvatarFallback className="text-xs">
									{host.full_name.slice(0, 2).toUpperCase()}
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

			<div className="grid grid-cols-2 gap-2">
				<div className="flex items-center justify-between gap-2 rounded-lg border p-2">
					<Label className="text-xs">Edit own tags</Label>
					<Switch
						checked={tagsEditable}
						onCheckedChange={handleTagsEditableChange}
						disabled={isSavingTagsOverride}
						className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 dark:data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-red-500"
					/>
				</div>
				<div className="flex items-center justify-between gap-2 rounded-lg border p-2">
					<Label className="text-xs">Edit own hours</Label>
					<Switch
						checked={hoursEditable}
						onCheckedChange={handleHoursEditableChange}
						disabled={isSavingHoursOverride}
						className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 dark:data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-red-500"
					/>
				</div>
			</div>

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

			{infoSections.length > 0 && (
				<Tabs defaultValue={infoSections[0].value} className="w-full">
					<TabsList className="grid h-8 w-full grid-cols-3">
						{infoSections.map((s) => (
							<TabsTrigger
								key={s.value}
								value={s.value}
								className="text-[11px]"
							>
								{s.label}
							</TabsTrigger>
						))}
					</TabsList>
					{infoSections.map((s) => (
						<TabsContent key={s.value} value={s.value} className="mt-2">
							<div className="max-h-[120px] overflow-y-auto whitespace-pre-wrap text-foreground text-xs leading-relaxed">
								{s.content}
							</div>
						</TabsContent>
					))}
				</Tabs>
			)}

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
	);
};

export default HostDetailsDialog;
