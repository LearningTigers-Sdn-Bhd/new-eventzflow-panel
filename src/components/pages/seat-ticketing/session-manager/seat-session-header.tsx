"use client";

import { ChevronLeft, MousePointer2, PlusSquare, Save } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSeatSessionStore } from "./use-seat-session-store";

export function SeatSessionHeader() {
	const pathname = usePathname();
	const sessionsListUrl = `${pathname.split("/sessions/")[0]}/sessions` as Route;

	const session = useSeatSessionStore((state) => state.session);
	const mode = useSeatSessionStore((state) => state.mode);
	const setMode = useSeatSessionStore((state) => state.setMode);
	const interactionMode = useSeatSessionStore((state) => state.interactionMode);
	const setInteractionMode = useSeatSessionStore(
		(state) => state.setInteractionMode,
	);
	const save = useSeatSessionStore((state) => state.save);
	const isSaving = useSeatSessionStore((state) => state.isSaving);
	const selectedSectionId = useSeatSessionStore((state) => state.selectedSectionId);

	const selectedSection = useSeatSessionStore((state) =>
		selectedSectionId ? state.sections[selectedSectionId] : null,
	);

	if (mode === "seat_placement" && selectedSection) {
		return (
			<div className="relative flex items-center justify-between border-b px-6 py-3 bg-background shrink-0 h-16">
				<div className="flex items-center gap-4 z-10">
					<Button
						variant="ghost"
						size="sm"
						className="gap-2 pl-2 rounded-none"
						onClick={() => setMode("venue_blueprint")}
					>
						<ChevronLeft className="h-4 w-4" />
						Return
					</Button>
				</div>

				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
					<h1 className="text-lg font-bold leading-tight">
						{selectedSection.name}
					</h1>
					<p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
						Seat Placement Mode
					</p>
				</div>

				<div className="flex items-center gap-4 z-10">
					<div className="flex items-center bg-muted rounded-none p-1 border">
						<Button
							variant={interactionMode === "select" ? "default" : "ghost"}
							size="sm"
							onClick={() => setInteractionMode("select")}
							className={cn(
								"gap-2 h-8 rounded-none transition-all",
								interactionMode === "select" && "shadow-sm",
							)}
						>
							<MousePointer2 className="h-3.5 w-3.5" />
							Select
						</Button>
						<Button
							variant={interactionMode === "create" ? "default" : "ghost"}
							size="sm"
							onClick={() => setInteractionMode("create")}
							className={cn(
								"gap-2 h-8 rounded-none transition-all",
								interactionMode === "create" && "shadow-sm",
							)}
						>
							<PlusSquare className="h-3.5 w-3.5" />
							Create
						</Button>
					</div>

					<Button
						variant="default"
						onClick={() => save()}
						disabled={isSaving}
						className="gap-2 rounded-none"
					>
						<Save className="h-4 w-4" />
						{isSaving ? "Saving..." : "Save Plan"}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="relative flex items-center justify-between border-b px-6 py-3 bg-background shrink-0 h-16">
			<div className="flex items-center gap-4 z-10">
				<Button
					variant="ghost"
					size="sm"
					className="gap-2 pl-2 rounded-none"
					asChild
				>
					<Link href={sessionsListUrl}>
						<ChevronLeft className="h-4 w-4" />
						Return to sessions
					</Link>
				</Button>
			</div>

			<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
				<h1 className="text-lg font-bold leading-tight">{session?.name}</h1>
				<p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
					Venue Blueprint
				</p>
			</div>

			<div className="flex items-center gap-4 z-10">
				<div className="flex items-center bg-muted rounded-none p-1 border">
					<Button
						variant={interactionMode === "select" ? "default" : "ghost"}
						size="sm"
						onClick={() => setInteractionMode("select")}
						className={cn(
							"gap-2 h-8 rounded-none transition-all",
							interactionMode === "select" && "shadow-sm",
						)}
					>
						<MousePointer2 className="h-3.5 w-3.5" />
						Select
					</Button>
					<Button
						variant={interactionMode === "create" ? "default" : "ghost"}
						size="sm"
						onClick={() => setInteractionMode("create")}
						className={cn(
							"gap-2 h-8 rounded-none transition-all",
							interactionMode === "create" && "shadow-sm",
						)}
					>
						<PlusSquare className="h-3.5 w-3.5" />
						Create
					</Button>
				</div>

				<Button
					variant="default"
					onClick={() => save()}
					disabled={isSaving}
					className="gap-2 rounded-none"
				>
					<Save className="h-4 w-4" />
					{isSaving ? "Saving..." : "Save Plan"}
				</Button>
			</div>
		</div>
	);
}