"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDialogStore } from "@/stores/dialog-store";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "./admin-ui/layout/responsive-layout";

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
		goBack,
		history,
	} = useDialogStore();
	const canGoBack = history.length > 0;

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
			<ResponsiveLayout>
				<MobileTabletView>
					<DialogContent
						className={cn(
							"flex flex-col gap-0 overflow-hidden rounded-none border-0 p-0",
							"h-screen! w-screen max-w-none!",
						)}
						showCloseButton={config.showCloseButton}
					>
						<DialogHeader
							className={cn(
								"flex shrink-0 flex-col items-start gap-1 px-4 py-3 pr-10",
							)}
						>
							{canGoBack && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={goBack}
									className="mb-1 -ml-2 h-7 gap-1 self-start px-2 text-muted-foreground"
								>
									<ArrowLeft className="h-3.5 w-3.5" />
									Back
								</Button>
							)}
							{config.title ? (
								<DialogTitle className="line-clamp-2 text-left text-base leading-tight">
									{config.title}
								</DialogTitle>
							) : (
								<DialogTitle className="sr-only">Dialog</DialogTitle>
							)}
							{config.description ? (
								<DialogDescription className="text-xs">
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
								"min-h-0 flex-1 justify-start overflow-y-auto",
								!isFullScreen && "px-4",
							)}
						>
							<ContentComponent {...props} />
						</div>
					</DialogContent>
				</MobileTabletView>
				<DesktopView>
					<DialogContent
						className={cn(
							"gap-0 p-6",
							sizeClass,
							isFullScreen && "rounded-none border-0 p-0",
							config.className,
						)}
						showCloseButton={config.showCloseButton}
					>
						<DialogHeader
							className={cn(
								"flex flex-col items-center gap-1 pb-4 md:items-start",
								isFullScreen ? "px-6 pt-6" : "px-0",
							)}
						>
							{canGoBack && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={goBack}
									className="mb-1 -ml-2 h-7 gap-1 self-start px-2 text-muted-foreground"
								>
									<ArrowLeft className="h-3.5 w-3.5" />
									Back
								</Button>
							)}
							{config.title ? (
								<DialogTitle>{config.title}</DialogTitle>
							) : (
								<DialogTitle className="sr-only">Dialog</DialogTitle>
							)}
							{config.description ? (
								<DialogDescription className="text-sm">
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
								"flex-1 justify-start",
								isFullScreen && "h-[calc(100vh-8rem)] flex-1 overflow-auto",
							)}
						>
							<ContentComponent {...props} />
						</div>
					</DialogContent>
				</DesktopView>
			</ResponsiveLayout>
		</Dialog>
	);
}
