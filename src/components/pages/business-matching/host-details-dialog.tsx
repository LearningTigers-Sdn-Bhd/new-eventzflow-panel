// new-eventzflow-panel/src/components/pages/business-matching/host-details-dialog.tsx

import { Copy, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import ImageUpload from "@/components/file-upload/image-upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	useAdminSetHostHoursEditableOverride,
	useAdminSetHostTagsEditableOverride,
	useAdminUpdateHostAvatar,
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
	const [avatarUrl, setAvatarUrl] = useState(
		host.avatar_url ? `${API_BASE_URL}${host.avatar_url}` : undefined,
	);
	const [tagsEditable, setTagsEditable] = useState(
		host.tags_editable_override ?? sessionTagsEditable,
	);
	const [hoursEditable, setHoursEditable] = useState(
		host.hours_editable_override ?? sessionHoursEditable,
	);

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

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="grid gap-1">
					<Label className="text-muted-foreground">Photo</Label>
					<ImageUpload
						value={avatarUrl}
						onChange={handleAvatarChange}
						disabled={isSavingAvatar}
						maxSize={5 * 1024 * 1024}
						className="max-w-[200px]"
					/>
				</div>
				<div className="grid gap-1">
					<Label className="text-muted-foreground">Full Name</Label>
					<div className="font-medium text-lg">{host.full_name}</div>
				</div>
				<div className="grid gap-1">
					<Label className="text-muted-foreground">Email</Label>
					<div className="flex items-center gap-2 overflow-hidden">
						<div className="max-w-full break-all font-medium text-sm sm:text-base">
							{host.email}
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 flex-shrink-0"
							onClick={handleCopyEmail}
						>
							<Copy className="h-3 w-3" />
						</Button>
					</div>
				</div>
				<div className="grid gap-1">
					<Label className="text-muted-foreground">Phone</Label>
					<a className="font-medium" href={`tel:${host.phone}`}>
						{host.phone || "N/A"}
					</a>
				</div>
				<div className="flex items-center justify-between gap-4 rounded-lg border p-3">
					<div className="space-y-0.5">
						<Label>Can edit own tags</Label>
						<p className="text-muted-foreground text-xs">
							{host.tags_editable_override === null ||
							host.tags_editable_override === undefined
								? `Using session default (${sessionTagsEditable ? "on" : "off"})`
								: "Overridden for this host"}
						</p>
					</div>
					<Switch
						checked={tagsEditable}
						onCheckedChange={handleTagsEditableChange}
						disabled={isSavingTagsOverride}
					/>
				</div>
				<div className="flex items-center justify-between gap-4 rounded-lg border p-3">
					<div className="space-y-0.5">
						<Label>Can edit own hours</Label>
						<p className="text-muted-foreground text-xs">
							{host.hours_editable_override === null ||
							host.hours_editable_override === undefined
								? `Using session default (${sessionHoursEditable ? "on" : "off"})`
								: "Overridden for this host"}
						</p>
					</div>
					<Switch
						checked={hoursEditable}
						onCheckedChange={handleHoursEditableChange}
						disabled={isSavingHoursOverride}
					/>
				</div>
				{host.description && (
					<div className="mt-1 grid gap-1 border-t pt-3">
						<Label className="text-muted-foreground">Description / Bio</Label>
						<div className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">
							{host.description}
						</div>
					</div>
				)}
				{host.sourcing_intent && (
					<div className="mt-1 grid gap-1 border-t pt-3">
						<Label className="text-muted-foreground">Sourcing Intent</Label>
						<div className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">
							{host.sourcing_intent}
						</div>
					</div>
				)}
				{host.capabilities && (
					<div className="mt-1 grid gap-1 border-t pt-3">
						<Label className="text-muted-foreground">Capabilities</Label>
						<div className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">
							{host.capabilities}
						</div>
					</div>
				)}
				{host.interest_tags && host.interest_tags.length > 0 && (
					<div className="mt-1 grid gap-1 border-t pt-3">
						<Label className="text-muted-foreground">Interest Tags</Label>
						<div className="mt-1 flex flex-wrap gap-1.5">
							{host.interest_tags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center rounded border border-blue-100 bg-blue-50 px-2 py-0.5 font-semibold text-blue-600 text-xs dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400"
								>
									{tag}
								</span>
							))}
						</div>
					</div>
				)}
			</div>

			<div className="flex justify-end border-t pt-4">
				<Button
					variant="destructive"
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
					<Trash2 className="mr-2 h-4 w-4" />
					Remove Host
				</Button>
			</div>
		</div>
	);
};

export default HostDetailsDialog;
