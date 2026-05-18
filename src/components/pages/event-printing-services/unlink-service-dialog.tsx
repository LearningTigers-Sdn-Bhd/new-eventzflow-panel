"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";

interface UnlinkServiceDialogProps {
	serviceName: string;
	onConfirm: () => void;
	isPending?: boolean;
}

export function UnlinkServiceDialog({
	serviceName,
	onConfirm,
	isPending = false,
}: UnlinkServiceDialogProps) {
	const { closeDialog } = useDialog();

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-4">
				<div className="rounded-full bg-destructive/10 p-3">
					<AlertTriangle className="h-6 w-6 text-destructive" />
				</div>
				<div className="space-y-2">
					<p className="text-sm">
						Are you sure you want to unlink{" "}
						<span className="font-semibold">"{serviceName}"</span> from this
						event?
					</p>
					<p className="text-muted-foreground text-sm">
						The service will no longer be available for this event. Any
						configured price tiers will also be removed.
					</p>
				</div>
			</div>

			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isPending}
					className="rounded-none"
				>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={onConfirm}
					disabled={isPending}
					className="rounded-none"
				>
					{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Unlink
				</Button>
			</div>
		</div>
	);
}
