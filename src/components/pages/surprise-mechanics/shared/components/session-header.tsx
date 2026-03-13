"use client";

import { format } from "date-fns";
import { ArrowLeft, Download, Eye, EyeOff, Maximize, Minimize } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Main container for session header
 */
export function SessionHeader({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col gap-4 pt-4">{children}</div>;
}

/**
 * Session info display component
 * Shows event name, session title, and draw date
 */
interface SessionInfoProps {
	eventName?: string;
	session: {
		title: string;
		draw_date: string | null;
	};
}

export function SessionInfo({ eventName, session }: SessionInfoProps) {
	return (
		<div className="flex flex-1 items-center justify-center gap-4">
			<div className="flex flex-col items-center">
				{eventName && (
					<p className="text-muted-foreground text-sm">{eventName}</p>
				)}
				<h1 className="font-bold text-xl">{session.title}</h1>
				{session.draw_date && (
					<span className="text-muted-foreground text-xs">
						{format(new Date(session.draw_date), "PPP")}
					</span>
				)}
			</div>
		</div>
	);
}

/**
 * Back navigation button
 */
interface SessionBackButtonProps {
	route: string | Route;
}

export function SessionBackButton({ route }: SessionBackButtonProps) {
	const router = useRouter();
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={() => router.push(route as Route)}
			className="gap-2 rounded-none"
		>
			<ArrowLeft className="h-4 w-4" />
			<span className="text-sm">Back</span>
		</Button>
	);
}

/**
 * Display mode toggle button
 */
interface SessionDisplayModeToggleProps {
	isDisplayMode: boolean;
	onToggle: () => void;
}

export function SessionDisplayModeToggle({
	isDisplayMode,
	onToggle,
}: SessionDisplayModeToggleProps) {
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={onToggle}
			className="gap-2 rounded-none"
		>
			{isDisplayMode ? (
				<>
					<EyeOff className="h-4 w-4" />
					<span className="text-sm">Hide Controls</span>
				</>
			) : (
				<>
					<Eye className="h-4 w-4" />
					<span className="text-sm">Show Controls</span>
				</>
			)}
		</Button>
	);
}

/**
 * Fullscreen toggle button
 */
interface SessionFullscreenToggleProps {
	isFullscreen: boolean;
	onToggle: () => void;
	isOverlay?: boolean;
}

export function SessionFullscreenToggle({
	isFullscreen,
	onToggle,
	isOverlay = false,
}: SessionFullscreenToggleProps) {
	return (
		<Button
			variant={isOverlay ? "ghost" : "outline"}
			size="sm"
			onClick={onToggle}
			className={cn(
				"gap-2 rounded-none",
				isOverlay &&
					"bg-background/20 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background/40 hover:opacity-100",
			)}
		>
			{isFullscreen ? (
				<>
					<Minimize className="h-4 w-4" />
					{!isOverlay && <span className="text-sm">Exit Fullscreen</span>}
				</>
			) : (
				<>
					<Maximize className="h-4 w-4" />
					{!isOverlay && <span className="text-sm">Fullscreen</span>}
				</>
			)}
		</Button>
	);
}

/**
 * Draw action button
 */
interface SessionDrawButtonProps {
	onClick: () => void;
	disabled: boolean;
	isDrawing: boolean;
}

export function SessionDrawButton({
	onClick,
	disabled,
	isDrawing,
}: SessionDrawButtonProps) {
	return (
		<Button
			size="sm"
			onClick={onClick}
			disabled={disabled}
			className="flex items-center justify-start gap-2 rounded-none"
		>
			<Download className="size-4" />
			{isDrawing ? "Drawing..." : "Draw"}
		</Button>
	);
}

/**
 * Menu container - three-column flex layout
 */
export function SessionHeaderMenu({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex w-full flex-row items-center justify-between gap-2">
			{children}
		</div>
	);
}

/**
 * Center section wrapper
 * Used for display mode toggle and domain-specific sheets
 */
export function SessionHeaderCenter({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div className="flex items-center gap-2">{children}</div>;
}

/**
 * Actions section wrapper
 * Used for domain-specific action buttons and draw button
 */
export function SessionHeaderActions({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div className="flex items-center gap-2">{children}</div>;
}
