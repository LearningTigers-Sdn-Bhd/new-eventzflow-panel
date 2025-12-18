"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateExhibitorKit } from "@/lib/api/exhibitor-kit";
import type { ExhibitorKitPrinting } from "@/lib/api/exhibitor-kit";

interface EditPrintingFormProps {
	eventId: number;
	kitId: number;
	printing: ExhibitorKitPrinting;
	onSuccess?: () => void;
}

export function EditPrintingForm({
	eventId,
	kitId,
	printing,
	onSuccess,
}: EditPrintingFormProps) {
	const queryClient = useQueryClient();
	const [notes, setNotes] = useState(printing.notes || "");
	const [fileReference, setFileReference] = useState(printing.file_reference || "");

	const mutation = useMutation({
		mutationFn: (data: { notes: string | null; file_reference: string | null }) =>
			updateExhibitorKit(eventId, kitId, {
				exhibitor_kit_printings_attributes: [
					{
						id: printing.id,
						notes: data.notes,
						file_reference: data.file_reference,
					},
				],
			}),
		onSuccess: () => {
			toast.success("Printing details updated successfully");
			queryClient.invalidateQueries({
				queryKey: ["events", eventId, "vendors"],
			});
			onSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update printing details");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		mutation.mutate({
			notes: notes.trim() || null,
			file_reference: fileReference.trim() || null,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6 min-w-0 overflow-hidden">
			{/* Service Info Card */}
			<div className="flex items-center gap-3 border bg-muted/30 p-4 min-w-0">
				<div className="flex size-10 shrink-0 items-center justify-center bg-primary/10">
					<Printer className="size-5 text-primary" />
				</div>
				<p className="font-medium truncate">
					{printing.printing_service?.name || "Unknown Service"}
				</p>
			</div>

			{/* File Reference Field */}
			<div className="space-y-2 min-w-0">
				<Label htmlFor="file_reference">File Reference</Label>
				<Input
					id="file_reference"
					value={fileReference}
					onChange={(e) => setFileReference(e.target.value)}
					placeholder="Enter file reference or URL..."
					className="rounded-none"
				/>
				<p className="text-muted-foreground text-xs">
					Link to your design file (Google Drive, Dropbox, etc.) or a reference number.
				</p>
			</div>

			{/* Notes Field */}
			<div className="space-y-2 min-w-0">
				<Label htmlFor="notes">Notes</Label>
				<Textarea
					id="notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Add any special instructions for this printing service..."
					className="min-h-[100px] max-h-[200px] rounded-none resize-none break-all [word-break:break-all] overflow-y-auto"
				/>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					type="submit"
					disabled={mutation.isPending}
					className="rounded-none"
				>
					{mutation.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
