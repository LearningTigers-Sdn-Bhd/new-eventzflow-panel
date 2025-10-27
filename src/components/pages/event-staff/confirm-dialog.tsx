"use client";

import { AlertTriangle, CheckCircle2, Info, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "default" | "destructive" | "warning" | "info" | "success";
	icon?: "alert" | "check" | "delete" | "info";
	onConfirm: () => void;
	onCancel: () => void;
}

const iconMap = {
	alert: AlertTriangle,
	check: CheckCircle2,
	delete: Trash2,
	info: Info,
};

const variantStyles: Record<
	NonNullable<ConfirmDialogProps["variant"]>,
	{
		container: string;
		icon: string;
		buttonVariant: React.ComponentProps<typeof Button>["variant"];
		buttonClass?: string;
	}
> = {
	default: {
		container: "bg-blue-100 dark:bg-blue-950/40",
		icon: "text-blue-600 dark:text-blue-300",
		buttonVariant: "default",
	},
	destructive: {
		container: "bg-red-100 dark:bg-red-950/40",
		icon: "text-red-600 dark:text-red-300",
		buttonVariant: "destructive",
		buttonClass: "focus-visible:ring-red-500",
	},
	warning: {
		container: "bg-amber-100 dark:bg-amber-950/40",
		icon: "text-amber-600 dark:text-amber-300",
		buttonVariant: "default",
		buttonClass:
			"bg-amber-500 text-amber-50 hover:bg-amber-500/90 focus-visible:ring-amber-500",
	},
	info: {
		container: "bg-sky-100 dark:bg-sky-950/40",
		icon: "text-sky-600 dark:text-sky-300",
		buttonVariant: "default",
	},
	success: {
		container: "bg-emerald-100 dark:bg-emerald-950/40",
		icon: "text-emerald-600 dark:text-emerald-300",
		buttonVariant: "default",
		buttonClass:
			"bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500",
	},
};

export default function ConfirmDialog({
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	variant = "default",
	icon,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const style = variantStyles[variant];
	const defaultIcon =
		variant === "destructive"
			? "delete"
			: variant === "warning"
				? "alert"
				: variant === "info"
					? "info"
					: "check";
	const IconComponent = iconMap[icon || defaultIcon];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col items-center gap-4 py-4">
				<div
					className={cn(
						"flex h-14 w-14 items-center justify-center rounded-full",
						style.container,
					)}
				>
					<IconComponent className={cn("h-6 w-6", style.icon)} strokeWidth={2} />
				</div>
				<p className="text-center text-sm text-muted-foreground">{message}</p>
			</div>
			<Separator />
			<div className="flex gap-3">
				<Button variant="outline" onClick={onCancel} className="flex-1">
					{cancelLabel}
				</Button>
				<Button
					variant={style.buttonVariant}
					onClick={onConfirm}
					className={cn("flex-1", style.buttonClass)}
				>
					{confirmLabel}
				</Button>
			</div>
		</div>
	);
}

