"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDialogStore } from "@/stores/dialog-store";

const sizeClassMap: Record<string, string> = {
	sm: "sm:max-w-sm",
	md: "sm:max-w-md",
	lg: "sm:max-w-lg",
	xl: "sm:max-w-xl",
	"2xl": "sm:max-w-2xl",
	"3xl": "sm:max-w-3xl",
	"4xl": "sm:max-w-4xl",
	"5xl": "sm:max-w-5xl",
	full: "!max-w-none !h-screen w-screen",
};

export function UniversalDialog() {
	const {
		isOpen,
		content: ContentComponent,
		props,
		config,
		closeDialog,
	} = useDialogStore();

	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeDialog();
		}
	};

	if (!ContentComponent || !isMounted) {
		return null;
	}

	const sizeClass = sizeClassMap[config.size || "lg"];
	const isFullScreen = config.size === "full";

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent
				className={cn(sizeClass, isFullScreen && "rounded-none border-0 p-0")}
				showCloseButton={config.showCloseButton}
			>
				<DialogHeader className={isFullScreen ? "p-6" : ""}>
					{config.title && <DialogTitle>{config.title}</DialogTitle>}
					{config.description ? (
						<DialogDescription>{config.description}</DialogDescription>
					) : (
						<DialogDescription className="sr-only">
							Dialog content
						</DialogDescription>
					)}
				</DialogHeader>

				<div
					className={cn(
						"flex-1 justify-start",
						isFullScreen && "h-[calc(100vh-8rem)] flex-1 overflow-auto",
					)}
				>
					<ContentComponent {...props} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
