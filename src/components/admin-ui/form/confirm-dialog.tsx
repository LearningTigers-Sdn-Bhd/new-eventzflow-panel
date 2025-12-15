"use client";

import { cva } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	type?: "base" | "success" | "warning" | "info" | "destructive";
	rounded?: "rounded" | "no-rounded";
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

const iconContainerVariants = cva("flex items-center justify-center p-4", {
	variants: {
		type: {
			base: "border border-blue-200 bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40",
			success:
				"border border-emerald-200 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40",
			warning:
				"border border-amber-200 bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40",
			info: "border border-sky-200 bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40",
			destructive:
				"border border-red-200 bg-red-100 dark:border-red-800 dark:bg-red-950/40",
		},
		rounded: {
			rounded: "rounded-md",
			"no-rounded": "rounded-none",
		},
	},
	defaultVariants: {
		type: "base",
		rounded: "rounded",
	},
});

const iconVariants = cva("size-6", {
	variants: {
		type: {
			base: "text-blue-600 dark:text-blue-300",
			success: "text-emerald-600 dark:text-emerald-300",
			warning: "text-amber-600 dark:text-amber-300",
			info: "text-sky-600 dark:text-sky-300",
			destructive: "text-red-600 dark:text-red-300",
		},
	},
	defaultVariants: {
		type: "base",
	},
});

export { iconContainerVariants, iconVariants };

const buttonVariantMap: Record<
	NonNullable<ConfirmDialogProps["type"]>,
	{
		variant: React.ComponentProps<typeof Button>["variant"];
		className?: string;
	}
> = {
	base: {
		variant: "default",
	},
	success: {
		variant: "default",
		className:
			"bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500",
	},
	warning: {
		variant: "default",
		className:
			"bg-amber-500 text-amber-50 hover:bg-amber-500/90 focus-visible:ring-amber-500",
	},
	info: {
		variant: "default",
		className:
			"bg-sky-600 text-sky-50 hover:bg-sky-500/90 focus-visible:ring-sky-500",
	},
	destructive: {
		variant: "destructive",
		className: "focus-visible:ring-red-500",
	},
};

export default function ConfirmDialog({
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	type = "base",
	rounded = "rounded",
	icon,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const defaultIcon =
		type === "destructive"
			? "delete"
			: type === "warning"
				? "alert"
				: type === "info"
					? "info"
					: "check";
	const IconComponent = iconMap[icon || defaultIcon];
	const buttonConfig = buttonVariantMap[type];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col items-center gap-4 px-4 py-6">
				<div className={cn("border", iconContainerVariants({ type, rounded }))}>
					<IconComponent
						className={cn(iconVariants({ type }))}
						strokeWidth={2}
					/>
				</div>
				<p className="text-balance text-center text-muted-foreground text-sm">
					{message}
				</p>
			</div>
			<div className="flex gap-2 border-t border-dashed px-2 py-2 md:px-4 md:py-4">
				<Button
					variant="outline"
					onClick={onCancel}
					className={cn(
						"flex-1 py-6 md:py-4",
						rounded === "no-rounded" ? "rounded-none" : "rounded-md",
					)}
				>
					{cancelLabel}
				</Button>
				<Button
					variant={buttonConfig.variant}
					onClick={onConfirm}
					className={cn(
						"flex-1 py-6 md:py-4",
						buttonConfig.className,
						rounded === "no-rounded" ? "rounded-none" : "rounded-md",
					)}
				>
					{confirmLabel}
				</Button>
			</div>
		</div>
	);
}
