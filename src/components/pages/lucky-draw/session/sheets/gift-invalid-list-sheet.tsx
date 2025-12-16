"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	ChevronDown,
	Edit2,
	Gift as GiftIcon,
	GripVertical,
	List,
	Plus,
	Save,
	Trash2,
	UserX,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { useLuckyDraw } from "@/hooks/use-lucky-draw";
import { cn } from "@/lib/utils";
import type { Gift as GiftType } from "@/stores/lucky-draw-store";

interface SortableGiftCardProps {
	gift: GiftType;
	onClearWinner: (giftId: string, winnerId: number) => void;
	onRemoveGift: (giftId: string) => void;
	onUpdateGift: (
		giftId: string,
		data: { name?: string; winner_counts?: number },
	) => void;
	winnerId?: number;
	allWinners?: Array<{
		id: number;
		name: string;
		type: "ticket" | "visitor";
		publicId: string;
	}>;
}

function SortableGiftCard({
	gift,
	onClearWinner,
	onRemoveGift,
	onUpdateGift,
	winnerId,
	allWinners = [],
}: SortableGiftCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState(gift.name);
	const [editWinnerCounts, setEditWinnerCounts] = useState(gift.winner_counts);
	const [isWinnersOpen, setIsWinnersOpen] = useState(false);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: gift.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.8 : 1,
		boxShadow: isDragging ? "0 10px 25px rgba(0, 0, 0, 0.12)" : undefined,
	};

	const handleSave = () => {
		if (editWinnerCounts <= 0) {
			toast.error("Winner count must be greater than 0");
			return;
		}
		if (!editName.trim()) {
			toast.error("Gift name is required");
			return;
		}
		onUpdateGift(gift.id, {
			name: editName,
			winner_counts: editWinnerCounts,
		});
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditName(gift.name);
		setEditWinnerCounts(gift.winner_counts);
		setIsEditing(false);
	};

	const isFirstOrder = gift.order === 1;
	// const actualWinnerCount = allWinners.length;
	const remaining = gift.winner_counts - (gift.actual_winner_count || 0);

	// Calculate remaining winners for collapsible (excluding first visible winner)
	const remainingWinners = allWinners.length > 1 ? allWinners.length - 1 : 0;

	return (
		<Card
			ref={isEditing ? undefined : setNodeRef}
			style={isEditing ? undefined : style}
			className={cn(
				"gap-0 rounded-none p-0 shadow-none",
				isFirstOrder && "border-2 border-primary",
			)}
		>
			{isEditing ? (
				<>
					<CardHeader className="gap-0! border-b px-4 pt-4 pb-2!">
						<CardTitle>Edit Gift Item</CardTitle>
						<CardDescription className="text-muted-foreground text-sm">
							Edit the gift item details.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4 px-4 py-2 pb-6">
						<div className="flex flex-col gap-2">
							<Label htmlFor={`edit-name-${gift.id}`}>Gift Name</Label>
							<Input
								id={`edit-name-${gift.id}`}
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								placeholder="Gift name"
							/>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<div className="col-span-2 flex flex-col justify-center gap-1">
								<Label>Total Winner</Label>
								<p className="text-balance text-muted-foreground text-sm">
									Enter the total number of winners for this gift.
								</p>
							</div>
							<div className="col-span-1 flex items-center justify-end">
								<NumberInput
									value={editWinnerCounts}
									onChange={setEditWinnerCounts}
									min={1}
									max={999}
								/>
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex justify-end gap-2 border-t px-4 pb-4">
						<Button
							variant="outline"
							onClick={handleCancel}
							className="gap-2 rounded-none"
						>
							<X className="size-4" />
							Cancel
						</Button>
						<Button onClick={handleSave} className="gap-2 rounded-none">
							<Save className="size-4" />
							Update
						</Button>
					</CardFooter>
				</>
			) : (
				<>
					<CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-2 py-2">
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
								<GiftIcon className="size-6 text-primary" />
							</div>
							<div className="flex flex-col">
								<Label className="font-semibold text-base">
									#{gift.order} {gift.name}
								</Label>
								<Label className="font-normal text-muted-foreground text-sm">
									Remaining: {remaining}
								</Label>
							</div>
						</div>
						<div className="flex items-center gap-1">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsEditing(true)}
								className="gap-2 rounded-none"
							>
								<Edit2 className="size-4" />
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => onRemoveGift(gift.id)}
								className="gap-2 rounded-none"
							>
								<Trash2 className="size-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="flex flex-col px-0 py-0">
						{allWinners.length > 0 ? (
							<Collapsible
								open={isWinnersOpen}
								onOpenChange={setIsWinnersOpen}
								className="flex flex-col gap-0"
							>
								{/* Show / Hide trigger */}
								{remainingWinners > 0 && (
									<CollapsibleTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="group w-full justify-start gap-1 rounded-none border-b"
										>
											<ChevronDown className="group-data-[state=open]:-rotate-180 size-4 transition-transform duration-300" />
											{isWinnersOpen ? (
												<div className="flex items-center gap-1">
													<span className="text-xs">Hide</span>
												</div>
											) : (
												<div className="flex items-center gap-1">
													<span className="text-xs">
														Show winner{remainingWinners !== 1 ? "s" : ""}
													</span>
													<Badge
														variant="outline"
														className="rounded-none border-green-500/50 bg-green-500/10 text-green-500 text-xs group-hover:bg-green-500/20 group-hover:text-green-500"
													>
														{remainingWinners}
													</Badge>
												</div>
											)}
										</Button>
									</CollapsibleTrigger>
								)}
								{/* First winner (always visible) */}
								<div className="grid grid-cols-3 gap-4 px-4 py-2">
									<div className="col-span-2 flex items-center font-medium text-sm">
										<span className="truncate">
											{gift.winner?.name || allWinners[0]?.name}
										</span>
									</div>
									<div className="col-span-1 flex items-center justify-end">
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												if (winnerId) {
													onClearWinner(gift.id, winnerId);
												}
											}}
											disabled={!winnerId}
											className="gap-2 rounded-none"
										>
											<UserX className="size-4" />
											<span className="hidden text-sm md:block">Remove</span>
										</Button>
									</div>
								</div>
								{/* Collapsible content list */}
								{remainingWinners > 0 && (
									<CollapsibleContent className="flex flex-col gap-0">
										{allWinners.slice(1).map((winner) => (
											<div
												key={winner.id}
												className="grid grid-cols-3 gap-4 px-4 py-2"
											>
												<div className="col-span-2 flex items-center font-medium text-sm">
													<span className="truncate">{winner.name}</span>
												</div>
												<div className="col-span-1 flex items-center justify-end">
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															onClearWinner(gift.id, winner.id);
														}}
														className="gap-2 rounded-none"
													>
														<UserX className="size-4" />
														<span className="hidden text-sm md:block">
															Remove
														</span>
													</Button>
												</div>
											</div>
										))}
									</CollapsibleContent>
								)}
							</Collapsible>
						) : (
							<div className="p-3 text-center text-muted-foreground text-sm">
								No winner assigned
							</div>
						)}
					</CardContent>
				</>
			)}
		</Card>
	);
}

interface GiftInvalidListSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	luckyDraw: ReturnType<typeof useLuckyDraw>;
}

export function GiftInvalidListSheet({
	open,
	onOpenChange,
	luckyDraw,
}: GiftInvalidListSheetProps) {
	const [newGiftName, setNewGiftName] = useState("");
	const [newGiftWinnerCounts, setNewGiftWinnerCounts] = useState(1);
	const [isAddGiftCardOpen, setIsAddGiftCardOpen] = useState(false);

	// Get all data and actions from the hook
	const {
		gifts,
		invalidParticipants,
		giftsData,
		invalidParticipantsData,
		useGifts,
		isLoadingGifts,
		isLoadingInvalidParticipants,
		addGift,
		removeGift,
		updateGift,
		clearWinner,
		reorderGifts,
		removeInvalidParticipant,
		clearInvalidParticipants,
	} = luckyDraw;

	const handleAddGift = () => {
		if (!newGiftName.trim()) {
			toast.error("Gift name is required");
			return;
		}
		if (newGiftWinnerCounts <= 0) {
			toast.error("Winner count must be greater than 0");
			return;
		}
		addGift(newGiftName.trim(), newGiftWinnerCounts);
		setNewGiftName("");
		setNewGiftWinnerCounts(1);
		setIsAddGiftCardOpen(false);
	};

	const handleUpdateGift = async (
		giftId: string,
		data: { name?: string; winner_counts?: number },
	) => {
		updateGift(giftId, data);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeId = String(active.id);
		const overId = String(over.id);

		// Reorder gifts in local state first
		const reorderedGifts = [...gifts];
		const oldIndex = reorderedGifts.findIndex((g) => g.id === activeId);
		const newIndex = reorderedGifts.findIndex((g) => g.id === overId);

		if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
			return;
		}

		const [moved] = reorderedGifts.splice(oldIndex, 1);
		reorderedGifts.splice(newIndex, 0, moved);

		// Call reorderGifts with reordered gifts array (id and order)
		const updates = reorderedGifts.map((gift, index) => ({
			id: gift.id,
			order: index + 1,
		}));
		reorderGifts(updates);
	};

	const renderGiftCards = () => {
		if (isLoadingGifts) {
			return (
				<div className="flex flex-col gap-3">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardHeader className="flex flex-row items-center gap-3">
								<Skeleton className="h-8 w-8 rounded-full" />
								<Skeleton className="h-8 w-8 rounded-full" />
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-20 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			);
		}

		const content = (
			<div className="flex flex-col gap-3">
				{gifts.length === 0 ? (
					<div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
						No gifts yet. Add prizes so winners can be assigned sequentially.
					</div>
				) : (
					<SortableContext
						items={gifts.map((gift) => gift.id)}
						strategy={verticalListSortingStrategy}
					>
						<div className="flex flex-col gap-3">
							{gifts.map((gift) => {
								const backendGift = giftsData?.find(
									(g) => String(g.id) === gift.id,
								);
								const winnerId = backendGift?.winners[0]?.id;
								const allWinners = gift.allWinners || [];

								return (
									<SortableGiftCard
										key={gift.id}
										gift={gift}
										onClearWinner={clearWinner}
										onRemoveGift={removeGift}
										onUpdateGift={handleUpdateGift}
										winnerId={winnerId}
										allWinners={allWinners}
									/>
								);
							})}
						</div>
					</SortableContext>
				)}
			</div>
		);

		return (
			<div className="flex flex-col gap-3">
				{content}
				<Card
					className="gap-0! rounded-none border-dashed py-4 shadow-none"
					onClick={() => {
						if (!isAddGiftCardOpen) {
							setIsAddGiftCardOpen(true);
						}
					}}
				>
					{isAddGiftCardOpen ? (
						<>
							<CardHeader className="gap-0! border-b px-4 pt-0! pb-2!">
								<CardTitle>Add Gift Item</CardTitle>
								<CardDescription>
									Add a new gift item to the list for lucky draw gifts.
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-6 py-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="new-gift-name">Gift Name</Label>
									<Input
										id="new-gift-name"
										placeholder="e.g., Gift Card, Cash Prize, etc."
										value={newGiftName}
										onChange={(e) => setNewGiftName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleAddGift();
											}
										}}
									/>
								</div>
								<div className="grid grid-cols-3 gap-2">
									<div className="col-span-2 flex flex-col justify-center gap-1">
										<Label className="text-balance">Total Winner</Label>
										<p className="text-balance text-muted-foreground text-sm">
											Enter the total number of winners for this gift.
										</p>
									</div>
									<div className="col-span-1 flex items-center justify-end">
										<NumberInput
											value={newGiftWinnerCounts}
											onChange={setNewGiftWinnerCounts}
											min={1}
											max={999}
										/>
									</div>
								</div>
							</CardContent>
							<CardFooter className="flex justify-end gap-2 border-t">
								<Button
									variant="outline"
									onClick={(e) => {
										e.stopPropagation();
										setIsAddGiftCardOpen(false);
										setNewGiftName("");
										setNewGiftWinnerCounts(1);
									}}
									className="gap-2 rounded-none"
								>
									<X className="size-4" />
									Cancel
								</Button>
								<Button
									onClick={(e) => {
										e.stopPropagation();
										handleAddGift();
									}}
									className="gap-2 rounded-none"
								>
									<Plus className="size-4" />
									Submit
								</Button>
							</CardFooter>
						</>
					) : (
						<CardContent className="flex cursor-pointer items-center justify-center gap-2 p-4 text-muted-foreground">
							<Plus className="size-4" />
							Add Gift
						</CardContent>
					)}
				</Card>
			</div>
		);
	};

	const renderInvalidParticipants = () => {
		if (isLoadingInvalidParticipants) {
			return (
				<div className="flex flex-col gap-3">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="rounded-none shadow-none">
							<CardContent className="flex items-center justify-between gap-4 p-4">
								<Skeleton className="h-16 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			);
		}

		return (
			<div className="flex flex-col gap-3">
				{invalidParticipants.length === 0 ? (
					<div className="text-balance rounded-none border border-dashed p-6 text-center text-muted-foreground text-sm">
						No winners yet. Winners will appear here when Use Gifts is
						off.
					</div>
				) : (
					invalidParticipants.map((participant) => {
						const backendInvalid = invalidParticipantsData?.find(
							(ip) => String(ip.participant.id) === participant.publicId,
						);
						const invalidParticipantId = backendInvalid?.id;

						return (
							<Card
								key={participant.publicId}
								className="rounded-none py-4 shadow-none"
							>
								<CardContent className="grid grid-cols-3 gap-4 px-4 pb-0">
									<div className="col-span-2 flex h-full items-center">
										<div className="text-balance font-medium text-sm">
											{participant.name}
										</div>
									</div>
									<div className="col-span-1 flex items-center justify-end">
										<Button
											variant="outline"
											size="sm"
											className="gap-2 rounded-none"
											onClick={() => {
												if (invalidParticipantId) {
													removeInvalidParticipant(invalidParticipantId);
												}
											}}
											disabled={!invalidParticipantId}
										>
											<UserX className="size-4" />
											<span className="hidden text-sm md:block">Remove</span>
										</Button>
									</div>
								</CardContent>
							</Card>
						);
					})
				)}
				{invalidParticipants.length > 0 && (
					<Card className="rounded-none border-dashed py-4 shadow-none">
						<CardContent className="grid grid-cols-3 gap-4 px-4 py-0">
							<div className="col-span-2 flex flex-col justify-center">
								<div className="text-balance font-medium text-sm">
									Clear Winner List
								</div>
								<p className="text-balance text-muted-foreground text-sm">
									Allow everyone to participate again.
								</p>
							</div>
							<div className="col-span-1 flex items-center justify-end">
								<Button
									variant="destructive"
									size="sm"
									className="gap-2 rounded-none"
									onClick={() => clearInvalidParticipants()}
								>
									<Trash2 className="size-4" />
									Clear All
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="flex items-center justify-start gap-2 rounded-none"
				>
					<List className="size-4" />
					<span className="hidden text-sm md:block">
						{useGifts ? "Manage Gifts" : "Winner List"}
					</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
				<SheetHeader className="gap-0! border-b">
					<SheetTitle>
						{useGifts ? "List of Gifts" : "Winner List"}
					</SheetTitle>
					<SheetDescription>
						{useGifts
							? "Manage prizes and their winners."
							: "Winners stored here will be skipped in future draws."}
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-6 px-4 pb-4">
					<Card className="flex border-0 p-0! shadow-none">
						<CardContent className="p-0">
							<ScrollArea className="h-[calc(100vh-12rem)] pb-4">
								{useGifts ? (
									<DndContext onDragEnd={handleDragEnd}>
										{renderGiftCards()}
									</DndContext>
								) : (
									renderInvalidParticipants()
								)}
							</ScrollArea>
						</CardContent>
					</Card>
				</div>
			</SheetContent>
		</Sheet>
	);
}
