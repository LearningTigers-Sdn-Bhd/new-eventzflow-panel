"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { deleteLuckyDrawSession } from "@/lib/api/lucky-draw";
import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";

interface DeleteAlertProps {
	session: LuckyDrawSession;
}

export default function DeleteAlert({ session }: DeleteAlertProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();
	const params = useParams();
	const eventId = params.event_id as string;

	const { mutate, isPending } = useMutation({
		mutationFn: async () => deleteLuckyDrawSession(eventId, session.id),
		onSuccess: () => {
			toast.success("Session deleted successfully");
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw-sessions", eventId],
			});
			closeDialog();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<p className="text-muted-foreground text-sm">
					Are you sure you want to delete the session{" "}
					<span className="font-semibold text-foreground">{session.title}</span>
					? This action cannot be undone. All gifts and invalid participants
					associated with this session will also be deleted.
				</p>
			</div>
			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={closeDialog} disabled={isPending}>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={() => mutate()}
					disabled={isPending}
				>
					{isPending ? "Deleting..." : "Delete Session"}
				</Button>
			</div>
		</div>
	);
}
