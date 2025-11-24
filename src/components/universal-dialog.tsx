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
				className={cn(
					sizeClass, 
					isFullScreen && "rounded-none border-0 p-0",
					// Mobile optimization: full height on mobile
					"max-h-[95vh] sm:max-h-[90vh]",
					// Responsive padding
					"p-4 sm:p-6",
					// Flex layout for scrollable content
					"flex flex-col"
				)}
				showCloseButton={config.showCloseButton}
			>
				<DialogHeader className={cn(
					isFullScreen ? "p-6" : "",
					// Sticky header
					"flex-shrink-0"
				)}>
					{config.title && (
						<DialogTitle className="text-base sm:text-lg">
							{config.title}
						</DialogTitle>
					)}
					{config.description ? (
						<DialogDescription className="text-xs sm:text-sm">
							{config.description}
						</DialogDescription>
					) : (
						<DialogDescription className="sr-only">
							Dialog content
						</DialogDescription>
					)}
				</DialogHeader>

				<div
					className={cn(
						"flex-1 justify-start overflow-y-auto",
						isFullScreen && "h-[calc(100vh-8rem)]",
						// Add custom scrollbar styling
						"scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
						// Padding for scrollable area
						"pr-2"
					)}
				>
					<ContentComponent {...props} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
