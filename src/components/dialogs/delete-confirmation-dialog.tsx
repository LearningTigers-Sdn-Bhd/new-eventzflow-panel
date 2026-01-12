"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";

interface DeleteConfirmationDialogProps {
	title?: string;
	description?: string;
	onConfirm: () => Promise<void> | void;
	onClose: () => void;
	isPending?: boolean;
}

export default function DeleteConfirmationDialog({
	title = "Confirm Deletion",
	description,
	onConfirm,
	onClose,
	isPending: externalIsPending = false,
}: DeleteConfirmationDialogProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleConfirm = async () => {
		if (isLoading) return;

		setIsLoading(true);
		try {
			await onConfirm();
		} catch (error) {
			console.error("Delete failed", error);
		} finally {
			// If the dialog is closed on success, this state update might happen on unmounted component
			// but React handles this gracefully in modern versions or it's a no-op if unmounted.
			setIsLoading(false);
		}
	};

	const isPending = externalIsPending || isLoading;

	return (
		<div className="grid gap-4">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-2">
					<AlertTriangle className="text-destructive" />
					{title}
				</DialogTitle>
				<DialogDescription className="pt-2">
					{description ||
						"Are you sure you want to proceed with this action?"}
					<br />
					<br />
					<span className="font-bold text-destructive">
						This action is irreversible.
					</span>
				</DialogDescription>
			</DialogHeader>
			<DialogFooter className="mt-4 flex flex-col-reverse gap-2 md:flex-row md:gap-0">
				<Button
					variant="outline"
					onClick={onClose}
					disabled={isPending}
					className="w-full md:w-auto"
				>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={handleConfirm}
					disabled={isPending}
					className="w-full md:w-auto"
				>
					{isPending ? (
						"Deleting..."
					) : (
						<>
							<Trash2 className="mr-2 h-4 w-4" />
							Confirm Delete
						</>
					)}
				</Button>
			</DialogFooter>
		</div>
	);
}
