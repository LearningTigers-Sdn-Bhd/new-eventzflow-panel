"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateExhibitorKit } from "@/lib/api/exhibitor-kit";
import type { ExhibitorKitItem } from "@/lib/api/exhibitor-kit";

interface EditItemNotesFormProps {
	eventId: number;
	kitId: number;
	item: ExhibitorKitItem;
	onSuccess?: () => void;
}

export function EditItemNotesForm({
	eventId,
	kitId,
	item,
	onSuccess,
}: EditItemNotesFormProps) {
	const queryClient = useQueryClient();
	const [notes, setNotes] = useState(item.notes || "");

	const mutation = useMutation({
		mutationFn: (notesValue: string | null) =>
			updateExhibitorKit(eventId, kitId, {
				exhibitor_kit_items_attributes: [
					{
						id: item.id,
						notes: notesValue,
					},
				],
			}),
		onSuccess: () => {
			toast.success("Notes updated successfully");
			queryClient.invalidateQueries({
				queryKey: ["events", eventId, "vendors"],
			});
			onSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update notes");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		mutation.mutate(notes.trim() || null);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6 min-w-0 overflow-hidden">
			{/* Item Info Card */}
			<div className="flex items-center gap-3 border bg-muted/30 p-4 min-w-0">
				<div className="flex size-10 shrink-0 items-center justify-center bg-primary/10">
					<Package className="size-5 text-primary" />
				</div>
				<p className="font-medium truncate">
					{item.rentable_item?.name || "Unknown Item"}
				</p>
			</div>

			{/* Notes Field */}
			<div className="space-y-2 min-w-0">
				<Label htmlFor="notes">Notes</Label>
				<Textarea
					id="notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Add any special instructions or notes for this item..."
					className="min-h-[120px] max-h-[200px] rounded-none resize-none break-all [word-break:break-all] overflow-y-auto"
				/>
				<p className="text-muted-foreground text-xs">
					These notes will be visible to the contractor handling your order.
				</p>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					type="submit"
					disabled={mutation.isPending}
					className="rounded-none"
				>
					{mutation.isPending ? "Saving..." : "Save Notes"}
				</Button>
			</div>
		</form>
	);
}
