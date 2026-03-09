"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import type { Visitor } from "@/lib/api/visitor";
import { unscanVisitor } from "@/lib/api/visitor";

interface UnscanVisitorModalProps {
	visitor: Visitor;
}

export default function UnscanVisitorModal({
	visitor,
}: UnscanVisitorModalProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();
	const params = useParams();
	const eventId = Number(params.event_id);

	const unscanMutation = useMutation({
		mutationFn: () => unscanVisitor(visitor.public_id),
		onSuccess: () => {
			queryClient.setQueryData<Visitor[]>(
				["event", eventId, "visitors"],
				(current) =>
					current?.map((currentVisitor) =>
						currentVisitor.public_id === visitor.public_id
							? {
									...currentVisitor,
									checked_in: false,
									check_in_at: undefined,
									scanned_by_id: undefined,
								}
							: currentVisitor,
					),
			);

			toast.success("Visitor unscanned successfully", {
				description: `${visitor.full_name}'s check-in has been reset.`,
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "visitors"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to unscan visitor", {
				description:
					error.message || "An error occurred while unscanning the visitor.",
			});
		},
	});

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
				<AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-500" />
				<div className="space-y-1">
					<p className="font-medium text-amber-900 text-sm dark:text-amber-100">
						Warning: This action will reset the visitor check-in
					</p>
					<p className="text-amber-800 text-xs dark:text-amber-200">
						This will set the visitor back to "Not Checked In" and clear all
						check-in information.
					</p>
				</div>
			</div>

			<div className="space-y-2 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
				<h4 className="font-medium text-sm">Visitor Information</h4>
				<div className="space-y-1 text-sm">
					<p>
						<span className="text-muted-foreground">Name:</span>{" "}
						<span className="font-medium">{visitor.full_name}</span>
					</p>
					<p>
						<span className="text-muted-foreground">Email:</span>{" "}
						<span className="font-medium">{visitor.email || "N/A"}</span>
					</p>
					<p>
						<span className="text-muted-foreground">Phone:</span>{" "}
						<span className="font-medium">{visitor.phone || "N/A"}</span>
					</p>
					<p>
						<span className="text-muted-foreground">Visitor ID:</span>{" "}
						<span className="font-medium">{visitor.public_id}</span>
					</p>
					{visitor.check_in_at && (
						<p>
							<span className="text-muted-foreground">Checked in at:</span>{" "}
							<span className="font-medium">
								{new Date(visitor.check_in_at).toLocaleString()}
							</span>
						</p>
					)}
				</div>
			</div>

			<p className="text-muted-foreground text-sm">
				Are you sure you want to unscan this visitor?
			</p>

			<div className="flex justify-end gap-2 pt-4">
				<Button
					variant="outline"
					onClick={closeDialog}
					disabled={unscanMutation.isPending}
					className="rounded-none"
				>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={() => unscanMutation.mutate()}
					disabled={unscanMutation.isPending}
					className="rounded-none"
				>
					{unscanMutation.isPending ? "Unscanning..." : "Unscan Visitor"}
				</Button>
			</div>
		</div>
	);
}
