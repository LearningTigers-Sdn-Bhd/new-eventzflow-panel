"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "destructive" | "warning" | "success";
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmDialog({
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	variant = "destructive",
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-start gap-4">
				<div
					className={`rounded-full p-2 ${
						variant === "destructive"
							? "bg-red-100 text-red-600"
							: variant === "warning"
								? "bg-yellow-100 text-yellow-600"
								: "bg-green-100 text-green-600"
					}`}
				>
					{variant === "destructive" ? (
						<Trash2 className="h-5 w-5" />
					) : (
						<AlertTriangle className="h-5 w-5" />
					)}
				</div>
				<p className="text-muted-foreground text-sm">{message}</p>
			</div>
			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={onCancel} className="rounded-none">
					{cancelLabel}
				</Button>
				<Button
					variant={variant === "destructive" ? "destructive" : "default"}
					onClick={onConfirm}
					className="rounded-none"
				>
					{confirmLabel}
				</Button>
			</div>
		</div>
	);
}
