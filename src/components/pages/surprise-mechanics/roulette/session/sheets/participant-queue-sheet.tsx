"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useRouletteParticipantQueueStore } from "@/stores/roulette-participant-queue-store";

interface SortableParticipantCardProps {
	item: {
		participant: { name: string; type: "ticket" | "visitor"; publicId: string };
		remainingDraws: number;
	};
	index: number;
	onRemove: (index: number) => void;
}

function SortableParticipantCard({
	item,
	index,
	onRemove,
}: SortableParticipantCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: `participant-${item.participant.publicId}-${index}` });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.8 : 1,
		boxShadow: isDragging ? "0 10px 25px rgba(0, 0, 0, 0.12)" : undefined,
	};

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={cn("gap-0 rounded-none p-0 shadow-none")}
		>
			<CardContent className="flex items-center justify-between gap-4 p-4">
				<div className="flex items-center gap-3">
					<button
						type="button"
						className="flex h-10 cursor-grab items-center justify-center rounded-none border bg-background p-1 text-muted-foreground hover:text-foreground"
						{...attributes}
						{...listeners}
					>
						<GripVertical className="size-4" />
					</button>
					<div className="rounded-none bg-primary/10 p-2">
						<User className="size-5 text-primary" />
					</div>
					<div className="flex flex-col">
						<p className="font-semibold text-base">{item.participant.name}</p>
						<div className="mt-1 flex items-center gap-2">
							<Badge variant="outline" className="rounded-none text-xs">
								{item.participant.type === "ticket" ? "Ticket" : "Visitor"}
							</Badge>
							<span className="text-muted-foreground text-xs">
								{item.remainingDraws} draw{item.remainingDraws !== 1 ? "s" : ""}{" "}
								remaining
							</span>
						</div>
					</div>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onRemove(index)}
					className="h-8 w-8 rounded-none p-0"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</CardContent>
		</Card>
	);
}

interface ParticipantQueueSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onClearQueue?: () => void;
}

export function ParticipantQueueSheet({
	open,
	onOpenChange,
	onClearQueue,
}: ParticipantQueueSheetProps) {
	const { queue, removeParticipant, reorderQueue } =
		useRouletteParticipantQueueStore();

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeId = String(active.id);
		const overId = String(over.id);

		// Extract index from IDs (format: "participant-{publicId}-{index}")
		const activeIndex = queue.findIndex((_, idx) => {
			const id = `participant-${queue[idx].participant.publicId}-${idx}`;
			return id === activeId;
		});
		const overIndex = queue.findIndex((_, idx) => {
			const id = `participant-${queue[idx].participant.publicId}-${idx}`;
			return id === overId;
		});

		if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
			return;
		}

		// Reorder queue
		const reorderedQueue = [...queue];
		const [moved] = reorderedQueue.splice(activeIndex, 1);
		reorderedQueue.splice(overIndex, 0, moved);

		reorderQueue(reorderedQueue);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
				<SheetHeader className="gap-0! border-b">
					<SheetTitle>Participant Queue</SheetTitle>
					<SheetDescription>
						Manage the queue of participants waiting to draw. Drag to reorder.
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-6 px-4 pb-4">
					{queue.length > 0 && onClearQueue && (
						<Button
							variant="destructive"
							size="sm"
							onClick={() => {
								onClearQueue();
							}}
							className="w-full gap-2 rounded-none"
						>
							<Trash className="h-4 w-4" />
							Clear All Participants
						</Button>
					)}
					<Card className="flex border-0 p-0! shadow-none">
						<CardContent className="p-0">
							<ScrollArea className="h-[calc(100vh-12rem)] pb-4">
								{queue.length === 0 ? (
									<div className="flex h-full items-center justify-center p-6">
										<p className="text-center text-muted-foreground text-sm">
											No participants in queue. Add participants using the
											scanner.
										</p>
									</div>
								) : (
									<DndContext onDragEnd={handleDragEnd}>
										<SortableContext
											items={queue.map(
												(item, idx) =>
													`participant-${item.participant.publicId}-${idx}`,
											)}
											strategy={verticalListSortingStrategy}
										>
											<div className="flex flex-col gap-3">
												{queue.map((item, index) => (
													<SortableParticipantCard
														key={`${item.participant.publicId}-${index}`}
														item={item}
														index={index}
														onRemove={removeParticipant}
													/>
												))}
											</div>
										</SortableContext>
									</DndContext>
								)}
							</ScrollArea>
						</CardContent>
					</Card>
				</div>
			</SheetContent>
		</Sheet>
	);
}
