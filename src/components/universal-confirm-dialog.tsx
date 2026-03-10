"use client";

import { cva } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Copy, Info, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useConfirmDialogStore } from "@/stores/confirm-dialog-store";

// Icon mapping from admin-ui confirm dialog
const iconMap = {
	alert: AlertTriangle,
	check: CheckCircle2,
	copy: Copy,
	delete: Trash2,
	info: Info,
};

// CVA variants for DialogContent based on type
const dialogContentVariants = cva(
	"gap-6 rounded-none border p-6 shadow-lg sm:max-w-md", // Default md size
	{
		variants: {
			type: {
				base: "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/40",
				success:
					"border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/40",
				warning:
					"border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40",
				info: "border-sky-200 bg-sky-50 dark:border-sky-900/50 dark:bg-sky-950/40",
				destructive:
					"border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40",
			},
		},
		defaultVariants: {
			type: "base",
		},
	},
);

// CVA variants for DialogTitle
const dialogTitleVariants = cva("text-center font-semibold text-xl", {
	variants: {
		type: {
			base: "text-blue-600",
			success: "text-emerald-600",
			warning: "text-amber-600",
			info: "text-sky-600",
			destructive: "text-red-600",
		},
	},
	defaultVariants: {
		type: "base",
	},
});

// CVA variants for Description/Message
const descriptionVariants = cva("text-balance text-center text-sm", {
	variants: {
		type: {
			base: "text-blue-800 dark:text-blue-200",
			success: "text-emerald-800 dark:text-emerald-200",
			warning: "text-amber-800 dark:text-amber-200",
			info: "text-sky-800 dark:text-sky-200",
			destructive: "text-red-800 dark:text-red-200",
		},
	},
	defaultVariants: {
		type: "base",
	},
});

// CVA variants for Icon Container (keeping consistent with admin-ui but ensuring it fits)
const iconContainerVariants = cva(
	"mx-auto mb-4 flex items-center justify-center rounded-none border p-4",
	{
		variants: {
			type: {
				base: "border-blue-600 bg-blue-700/10 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300",
				success:
					"border-emerald-600 bg-emerald-700/10 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
				warning:
					"border-amber-600 bg-amber-700/10 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
				info: "border-sky-600 bg-sky-700/10 text-sky-600 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300",
				destructive:
					"border-red-600 bg-red-700/20 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300",
			},
		},
		defaultVariants: {
			type: "base",
		},
	},
);

// Button variants
const confirmButtonVariants = cva("flex-1 rounded-none border py-6 md:py-4", {
	variants: {
		type: {
			base: "border-blue-200 bg-blue-600 text-white hover:bg-blue-700",
			success: "bg-emerald-600 text-white hover:bg-emerald-700",
			warning: "border-amber-200 bg-amber-600 text-white hover:bg-amber-700",
			info: "border-sky-200 bg-sky-600 text-white hover:bg-sky-700",
			destructive: "border-red-200 bg-red-600 text-white hover:bg-red-700",
		},
	},
	defaultVariants: {
		type: "base",
	},
});

const cancelButtonVariants = cva("flex-1 rounded-none border py-6 md:py-4", {
	variants: {
		type: {
			base: "border-blue-200 bg-white/50 text-blue-600 hover:bg-white/80 dark:border-blue-900/50 dark:bg-blue-950 dark:text-blue-300",
			success:
				"border-emerald-200 bg-white/50 text-emerald-600 hover:bg-white/80 dark:border-emerald-900/50 dark:bg-emerald-950 dark:text-emerald-300",
			warning:
				"border-amber-200 bg-white/50 text-amber-600 hover:bg-white/80 dark:border-amber-900/50 dark:bg-amber-950 dark:text-amber-300",
			info: "bg-white/50 text-sky-600 hover:bg-white/80 dark:bg-sky-950 dark:text-sky-300",
			destructive:
				"border-red-200 bg-white/50 text-red-600 hover:bg-white/80 dark:border-red-900/50 dark:bg-red-950 dark:text-red-300",
		},
	},
	defaultVariants: {
		type: "base",
	},
});

export function UniversalConfirmDialog() {
	const { isOpen, props, config, closeDialog } = useConfirmDialogStore();

	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeDialog();
		}
	};

	if (!props || !isMounted) {
		return null;
	}

	const {
		message,
		confirmLabel = "Confirm",
		cancelLabel = "Cancel",
		type = "base",
		icon,
		onConfirm,
		onCancel,
	} = props;

	const defaultIcon =
		type === "destructive"
			? "delete"
			: type === "warning"
				? "alert"
				: type === "info"
					? "info"
					: "check";

	const IconComponent = iconMap[icon || defaultIcon];

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent
				className={cn(dialogContentVariants({ type }))}
				showCloseButton={false}
			>
				<DialogHeader className="flex flex-col items-center gap-2">
					{/* Icon */}
					<div className={cn(iconContainerVariants({ type }))}>
						<IconComponent className="size-6" strokeWidth={2} />
					</div>

					{/* Title */}
					{config.title ? (
						<DialogTitle className={cn(dialogTitleVariants({ type }))}>
							{config.title}
						</DialogTitle>
					) : (
						<DialogTitle className="sr-only">Confirm Action</DialogTitle>
					)}

					{/* SR Description */}
					<DialogDescription className="sr-only">
						{config.description || message}
					</DialogDescription>

					{/* Visible Message */}
					<p className={cn(descriptionVariants({ type }))}>{message}</p>
				</DialogHeader>

				<div className="mt-4 flex gap-3">
					<DialogClose asChild>
						<Button
							variant="ghost"
							onClick={onCancel}
							className={cn(cancelButtonVariants({ type }))}
						>
							{cancelLabel}
						</Button>
					</DialogClose>
					<Button
						variant="default"
						onClick={() => {
							onConfirm();
							closeDialog();
						}}
						className={cn(confirmButtonVariants({ type }))}
					>
						{confirmLabel}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
