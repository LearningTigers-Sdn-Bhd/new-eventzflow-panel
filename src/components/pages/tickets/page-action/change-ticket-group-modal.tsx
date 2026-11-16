"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDialog } from "@/hooks/use-dialog";
import { getTicketGroups, moveTicketsToGroup } from "@/lib/api/ticket-group";

const NO_GROUP = "none";

interface ChangeTicketGroupModalProps {
	eventId: string;
	publicIds: string[];
	currentGroupId: number | null;
	onSuccess: () => void;
}

export default function ChangeTicketGroupModal({
	eventId,
	publicIds,
	currentGroupId,
	onSuccess,
}: ChangeTicketGroupModalProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();
	const [groupId, setGroupId] = useState<string>(
		currentGroupId ? String(currentGroupId) : "",
	);

	const { data, isLoading } = useQuery({
		queryKey: ["ticket-groups", eventId],
		queryFn: () => getTicketGroups(eventId),
	});

	const move = useMutation({
		mutationFn: () =>
			moveTicketsToGroup(
				eventId,
				publicIds,
				groupId === NO_GROUP ? null : Number(groupId),
			),
		onSuccess: (result) => {
			toast.success(`Moved ${result.moved} ticket(s)`);
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
			queryClient.invalidateQueries({ queryKey: ["ticket-groups", eventId] });
			onSuccess();
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to change group");
		},
	});

	return (
		<div className="space-y-4">
			<p className="text-muted-foreground text-sm">
				Move {publicIds.length} ticket{publicIds.length === 1 ? "" : "s"} to:
			</p>

			{!isLoading && data?.groups.length === 0 ? (
				<p className="text-sm">
					No groups yet. Create them first under Tools &gt; Ticket Groups.
				</p>
			) : (
				<Select value={groupId} onValueChange={setGroupId}>
					<SelectTrigger className="w-full rounded-none">
						<SelectValue placeholder="Select group" />
					</SelectTrigger>
					<SelectContent className="rounded-none">
						{data?.groups.map((g) => (
							<SelectItem
								key={g.id}
								value={String(g.id)}
								className="rounded-none"
							>
								{g.name}
							</SelectItem>
						))}
						<SelectItem value={NO_GROUP} className="rounded-none">
							No group
						</SelectItem>
					</SelectContent>
				</Select>
			)}

			<div className="flex justify-end gap-2 pt-4">
				<Button
					variant="outline"
					onClick={closeDialog}
					disabled={move.isPending}
					className="rounded-none"
				>
					Cancel
				</Button>
				<Button
					onClick={() => move.mutate()}
					disabled={!groupId || isLoading || move.isPending}
					className="rounded-none"
				>
					{move.isPending ? "Moving..." : "Change Group"}
				</Button>
			</div>
		</div>
	);
}
