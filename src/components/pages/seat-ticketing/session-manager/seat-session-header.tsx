"use client";

import { ChevronLeft, MousePointer2, PlusSquare, Save } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSeatSessionStore } from "./store/use-seat-session-store";

export function SeatSessionHeader() {
	const pathname = usePathname();
	const sessionsListUrl =
		`${pathname.split("/sessions/")[0]}/sessions` as Route;

	const session = useSeatSessionStore((state) => state.session);
	const mode = useSeatSessionStore((state) => state.mode);
	const setMode = useSeatSessionStore((state) => state.setMode);
	const interactionMode = useSeatSessionStore((state) => state.interactionMode);
	const setInteractionMode = useSeatSessionStore(
		(state) => state.setInteractionMode,
	);
	const save = useSeatSessionStore((state) => state.save);
	const isSaving = useSeatSessionStore((state) => state.isSaving);
	const selectedSectionId = useSeatSessionStore(
		(state) => state.selectedSectionId,
	);

	const selectedSection = useSeatSessionStore((state) =>
		selectedSectionId ? state.sections[selectedSectionId] : null,
	);

	if (mode === "seat_placement" && selectedSection) {
		return (
			<div className="relative flex h-16 shrink-0 items-center justify-between border-b bg-background px-6 py-3">
				<div className="z-10 flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						className="gap-2 rounded-none pl-2"
						onClick={() => setMode("venue_blueprint")}
					>
						<ChevronLeft className="h-4 w-4" />
						Return
					</Button>
				</div>

				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
					<h1 className="font-bold text-lg leading-tight">
						{selectedSection.name}
					</h1>
					<p className="font-semibold text-muted-foreground text-sm uppercase tracking-widest">
						Seat Placement Mode
					</p>
				</div>

				<div className="z-10 flex items-center gap-4">
					<div className="flex items-center rounded-none border bg-muted p-1">
						<Button
							variant={interactionMode === "select" ? "default" : "ghost"}
							size="sm"
							onClick={() => setInteractionMode("select")}
							className={cn(
								"h-8 gap-2 rounded-none transition-all",
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
								"h-8 gap-2 rounded-none transition-all",
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
		<div className="relative flex h-16 shrink-0 items-center justify-between border-b bg-background px-6 py-3">
			<div className="z-10 flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					className="gap-2 rounded-none pl-2"
					asChild
				>
					<Link href={sessionsListUrl}>
						<ChevronLeft className="h-4 w-4" />
						Return to sessions
					</Link>
				</Button>
			</div>

			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
				<h1 className="font-bold text-lg leading-tight">{session?.name}</h1>
				<p className="font-semibold text-muted-foreground text-sm uppercase tracking-widest">
					Venue Blueprint
				</p>
			</div>

			<div className="z-10 flex items-center gap-4">
				<div className="flex items-center rounded-none border bg-muted p-1">
					<Button
						variant={interactionMode === "select" ? "default" : "ghost"}
						size="sm"
						onClick={() => setInteractionMode("select")}
						className={cn(
							"h-8 gap-2 rounded-none transition-all",
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
							"h-8 gap-2 rounded-none transition-all",
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
