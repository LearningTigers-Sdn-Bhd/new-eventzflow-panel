"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "default" | "destructive" | "warning" | "success";
	icon?: "alert" | "check";
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmDialog({
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	variant = "default",
	icon = "alert",
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-start gap-4">
				<div
					className={cn(
						"rounded-full p-2",
						variant === "destructive" && "bg-destructive/10",
						variant === "warning" && "bg-yellow-500/10",
						variant === "success" && "bg-green-500/10",
						variant === "default" && "bg-primary/10",
					)}
				>
					{icon === "alert" ? (
						<AlertCircle
							className={cn(
								"h-6 w-6",
								variant === "destructive" && "text-destructive",
								variant === "warning" && "text-yellow-500",
								variant === "success" && "text-green-500",
								variant === "default" && "text-primary",
							)}
						/>
					) : (
						<CheckCircle
							className={cn(
								"h-6 w-6",
								variant === "destructive" && "text-destructive",
								variant === "warning" && "text-yellow-500",
								variant === "success" && "text-green-500",
								variant === "default" && "text-primary",
							)}
						/>
					)}
				</div>
				<p className="flex-1 text-muted-foreground text-sm">{message}</p>
			</div>

			<div className="flex justify-end gap-3">
				<Button
					variant="outline"
					onClick={onCancel}
					className="rounded-none"
				>
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
