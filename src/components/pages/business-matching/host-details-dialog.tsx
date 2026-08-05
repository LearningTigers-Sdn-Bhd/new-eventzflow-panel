// new-eventzflow-panel/src/components/pages/business-matching/host-details-dialog.tsx

import { Copy, Trash2 } from "lucide-react";
import type React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRemoveHost } from "@/hooks/use-business-matching";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import type { BusinessHost } from "@/lib/api/business-matching";

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

	const handleCopyEmail = () => {
		navigator.clipboard
			.writeText(host.email)
			.then(() => toast.success("Email copied to clipboard"))
			.catch(() => toast.error("Failed to copy email"));
	};

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="grid gap-1">
					<Label className="text-muted-foreground">Full Name</Label>
					<div className="font-medium text-lg">{host.full_name}</div>
				</div>
				<div className="grid gap-1">
					<Label className="text-muted-foreground">Email</Label>
					<div className="flex items-center gap-2 overflow-hidden">
						<div className="font-medium break-all text-sm sm:text-base max-w-full">
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
				{host.description && (
					<div className="grid gap-1 border-t pt-3 mt-1">
						<Label className="text-muted-foreground">Description / Bio</Label>
						<div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{host.description}</div>
					</div>
				)}
				{host.sourcing_intent && (
					<div className="grid gap-1 border-t pt-3 mt-1">
						<Label className="text-muted-foreground">Sourcing Intent</Label>
						<div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{host.sourcing_intent}</div>
					</div>
				)}
				{host.capabilities && (
					<div className="grid gap-1 border-t pt-3 mt-1">
						<Label className="text-muted-foreground">Capabilities</Label>
						<div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{host.capabilities}</div>
					</div>
				)}
				{host.interest_tags && host.interest_tags.length > 0 && (
					<div className="grid gap-1 border-t pt-3 mt-1">
						<Label className="text-muted-foreground">Interest Tags</Label>
						<div className="flex flex-wrap gap-1.5 mt-1">
							{host.interest_tags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center rounded bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
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
