"use client";

import { Image } from "@unpic/react";
import {
	Bell,
	ChevronDown,
	Edit2,
	Gift,
	Loader2,
	Save,
	Trash2,
	UserX,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ImageUpload from "@/components/file-upload/image-upload";
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
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import type { RoulettePrize } from "@/lib/api/roulette/response";
import { validatePrize } from "@/lib/utils/prize-validation";

interface PrizeItemProps {
	prize: RoulettePrize;
	onUpdate: (
		prize: RoulettePrize,
		name: string,
		quantity: number,
		image: File | null,
		removeImage: boolean,
	) => void;
	onDelete: (prizeId: number) => void;
	onDeleteWinner: (winnerId: number) => void;
	onNotifyWinner: (winnerId: number) => void;
	isUpdating: boolean;
	isDeleting: boolean;
	isDeletingWinner: boolean;
	notifyingWinnerIds: Set<number>;
}

export function PrizeItem({
	prize,
	onUpdate,
	onDelete,
	onDeleteWinner,
	onNotifyWinner,
	isUpdating,
	isDeleting,
	isDeletingWinner,
	notifyingWinnerIds,
}: PrizeItemProps) {
	const { openConfirm } = useConfirmDialog();
	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState(prize.name);
	const [editQuantity, setEditQuantity] = useState(prize.quantity);
	const [editImage, setEditImage] = useState<File | null>(null);
	const [removeImage, setRemoveImage] = useState(false);
	const [isWinnersOpen, setIsWinnersOpen] = useState(false);
	const remaining = prize.quantity - (prize.winners?.length ?? 0);
	const winners = prize.winners || [];
	const remainingWinners = winners.length > 1 ? winners.length - 1 : 0;

	const handleSave = () => {
		const validation = validatePrize(editName, editQuantity);
		if (!validation.isValid) {
			toast.error(validation.error || "Validation failed");
			return;
		}
		onUpdate(prize, editName.trim(), editQuantity, editImage, removeImage);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditName(prize.name);
		setEditQuantity(prize.quantity);
		setEditImage(null);
		setRemoveImage(false);
		setIsEditing(false);
	};

	const handleImageChange = (file: File | null) => {
		if (file) {
			setEditImage(file);
			setRemoveImage(false);
		} else {
			setEditImage(null);
			setRemoveImage(true);
		}
	};

	const handleDeleteWinner = (winnerId: number, participantName: string) => {
		openConfirm({
			title: "Remove Winner",
			message: `Are you sure you want to remove "${participantName}" as a winner? This action cannot be undone.`,
			confirmLabel: "Remove",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			onConfirm: () => onDeleteWinner(winnerId),
		});
	};

	return (
		<Card className="gap-0 rounded-none shadow-none">
			{isEditing ? (
				<>
					<CardHeader className="gap-0! border-b px-4 pt-4 pb-2!">
						<CardTitle>Edit Prize Item</CardTitle>
						<CardDescription className="text-muted-foreground text-sm">
							Edit the prize item details.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4 px-4 py-2 pb-6">
						<div className="flex flex-col gap-2">
							<Label htmlFor={`edit-image-${prize.id}`}>Prize Image</Label>
							<div className="h-40 w-full">
								<ImageUpload
									value={
										editImage ||
										(!removeImage && prize.image_url
											? prize.image_url
											: undefined)
									}
									onChange={handleImageChange}
									fillHeight
								/>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor={`edit-name-${prize.id}`}>Prize Name</Label>
							<Input
								id={`edit-name-${prize.id}`}
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								placeholder="Prize name"
								className="rounded-none"
							/>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<div className="col-span-2 flex flex-col justify-center gap-1">
								<Label>Quantity</Label>
								<p className="text-balance text-muted-foreground text-sm">
									Enter the total quantity available for this prize.
								</p>
							</div>
							<div className="col-span-1 flex items-center justify-end">
								<NumberInput
									value={editQuantity}
									onChange={setEditQuantity}
									min={1}
									max={999}
									className="rounded-none"
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
						<Button
							onClick={handleSave}
							disabled={isUpdating}
							className="gap-2 rounded-none"
						>
							<Save className="size-4" />
							Update
						</Button>
					</CardFooter>
				</>
			) : (
				<>
					<CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-4 py-3">
						<div className="flex items-center gap-3">
							<div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted">
								{prize.image_url ? (
									<Image
										src={prize.image_url}
										alt={prize.name}
										width={48}
										height={48}
										className="h-full w-full object-cover"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-primary/10">
										<Gift className="size-6 text-primary" />
									</div>
								)}
							</div>
							<div className="flex flex-col">
								<Label className="font-semibold text-base">{prize.name}</Label>
								<Label className="font-normal text-muted-foreground text-sm">
									Remaining: {remaining} / {prize.quantity}
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
								onClick={() =>
									openConfirm({
										title: "Remove Prize",
										message: `Are you sure you want to permanently delete the prize "${prize.name}"? This action cannot be undone.`,
										confirmLabel: "Remove",
										cancelLabel: "Cancel",
										type: "destructive",
										icon: "delete",
										onConfirm: () => onDelete(prize.id),
									})
								}
								disabled={isDeleting}
								className="gap-2 rounded-none"
							>
								<Trash2 className="size-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="flex flex-col px-0 py-0">
						{winners.length > 0 ? (
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
											<ChevronDown className="size-4 transition-transform duration-300 group-data-[state=open]:-rotate-180" />
											{isWinnersOpen ? (
												<div className="flex items-center gap-1">
													<span className="text-xs">Hide</span>
												</div>
											) : (
												<div className="flex items-center gap-1">
													<span className="text-xs">
														Show winner{remainingWinners !== 1 ? "s" : ""}
													</span>
												</div>
											)}
										</Button>
									</CollapsibleTrigger>
								)}
								{/* First winner (always visible) */}
								<div className="grid grid-cols-3 gap-4 px-4 py-2">
									<div className="col-span-2 flex items-center font-medium text-sm">
										<span className="truncate">
											{winners[0]?.participant_name || "Unknown"}
										</span>
									</div>
									<div className="col-span-1 flex items-center justify-end gap-2">
										<Button
											variant="outline"
											size="sm"
											disabled={
												winners[0]
													? notifyingWinnerIds.has(winners[0].id)
													: true
											}
											onClick={() =>
												winners[0] && onNotifyWinner(winners[0].id)
											}
											className="gap-2 rounded-none"
										>
											{winners[0] && notifyingWinnerIds.has(winners[0].id) ? (
												<Loader2 className="size-4 animate-spin" />
											) : (
												<Bell className="size-4" />
											)}
										</Button>
										<Button
											variant="outline"
											size="sm"
											disabled={isDeletingWinner}
											onClick={() =>
												winners[0] &&
												handleDeleteWinner(
													winners[0].id,
													winners[0].participant_name || "Unknown",
												)
											}
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
										{winners.slice(1).map((winner) => (
											<div
												key={winner.id}
												className="grid grid-cols-3 gap-4 px-4 py-2"
											>
												<div className="col-span-2 flex items-center font-medium text-sm">
													<span className="truncate">
														{winner.participant_name || "Unknown"}
													</span>
												</div>
												<div className="col-span-1 flex items-center justify-end gap-2">
													<Button
														variant="outline"
														size="sm"
														disabled={notifyingWinnerIds.has(winner.id)}
														onClick={() => onNotifyWinner(winner.id)}
														className="gap-2 rounded-none"
													>
														{notifyingWinnerIds.has(winner.id) ? (
															<Loader2 className="size-4 animate-spin" />
														) : (
															<Bell className="size-4" />
														)}
													</Button>
													<Button
														variant="outline"
														size="sm"
														disabled={isDeletingWinner}
														onClick={() =>
															handleDeleteWinner(
																winner.id,
																winner.participant_name || "Unknown",
															)
														}
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
