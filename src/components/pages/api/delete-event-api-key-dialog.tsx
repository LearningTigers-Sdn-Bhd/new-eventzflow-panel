"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ApiKey } from "@/lib/api/api-keys";
import { deleteEventApiKey } from "@/lib/api/api-keys";

interface DeleteEventApiKeyDialogProps {
	eventId: number;
	apiKey: ApiKey;
	onClose: () => void;
}

export default function DeleteEventApiKeyDialog({
	eventId,
	apiKey,
	onClose,
}: DeleteEventApiKeyDialogProps) {
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: () => deleteEventApiKey(eventId, apiKey.id),
		onSuccess: () => {
			toast.success("API Key Revoked", {
				description: "The API key has been successfully revoked.",
			});
			queryClient.invalidateQueries({ queryKey: ["event", String(eventId), "api-keys"] });
			onClose();
		},
		onError: (error: Error) => {
			toast.error("Failed to revoke API key", {
				description: error.message || "An error occurred while revoking the API key.",
			});
		},
	});

	return (
		<div className="space-y-6">
			<div className="flex flex-col items-center gap-4 py-4">
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
					<AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" strokeWidth={2} />
				</div>
				<div className="space-y-2 text-center">
					<h4 className="font-semibold text-sm">Warning</h4>
					<p className="text-muted-foreground text-sm">
						This action cannot be undone. Any applications using this API key will lose access to this event.
					</p>
				</div>
			</div>

			<div className="space-y-2">
				<p className="font-medium text-sm">API Key:</p>
				<div className="break-all rounded-md border bg-muted p-3 font-mono text-sm">
					{apiKey.name}
				</div>
			</div>

			<Separator />

			<div className="flex gap-3">
				<Button type="button" variant="outline" onClick={onClose} disabled={deleteMutation.isPending} className="flex-1">
					Cancel
				</Button>
				<Button type="button" variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="flex-1">
					{deleteMutation.isPending ? "Revoking..." : "Revoke API Key"}
				</Button>
			</div>
		</div>
	);
}
