"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
	createRoulettePrize,
	deleteRoulettePrize,
	deleteRouletteWinner,
	getRoulettePrizes,
	notifyRouletteWinner,
	updateRoulettePrize,
} from "@/lib/api/roulette";
import type { RoulettePrize } from "@/lib/api/roulette/response";
import { getErrorMessage } from "@/lib/utils/error-handling";
import { validatePrize } from "@/lib/utils/prize-validation";
import { AddPrizeCard } from "./components/add-prize-card";
import { PrizeItem } from "./components/prize-item";

interface PrizeConfigSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventId: string;
	sessionId: number;
}

export function PrizeConfigSheet({
	open,
	onOpenChange,
	eventId,
	sessionId,
}: PrizeConfigSheetProps) {
	const queryClient = useQueryClient();
	const [newName, setNewName] = useState("");
	const [newQuantity, setNewQuantity] = useState(1);
	const [newImage, setNewImage] = useState<File | null>(null);
	const [isAddPrizeCardOpen, setIsAddPrizeCardOpen] = useState(false);
	const [notifyingWinnerIds, setNotifyingWinnerIds] = useState<Set<number>>(new Set());

	const {
		data: prizes,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["roulette-prizes", eventId, sessionId],
		queryFn: () => getRoulettePrizes(eventId, sessionId),
	});

	const createMutation = useMutation({
		mutationFn: (payload: { name: string; quantity: number; image?: File }) =>
			createRoulettePrize(eventId, sessionId, payload),
		onSuccess: () => {
			toast.success("Prize created");
			queryClient.invalidateQueries({
				queryKey: ["roulette-prizes", eventId, sessionId],
			});
			setNewName("");
			setNewQuantity(1);
			setNewImage(null);
			setIsAddPrizeCardOpen(false);
		},
		onError: (err: unknown) => {
			toast.error(getErrorMessage(err) || "Failed to create prize");
		},
	});

	const updateMutation = useMutation({
		mutationFn: (payload: {
			prizeId: number;
			data: {
				name?: string;
				quantity?: number;
				image?: File;
				remove_image?: boolean;
			};
		}) =>
			updateRoulettePrize(eventId, sessionId, payload.prizeId, payload.data),
		onSuccess: () => {
			toast.success("Prize updated");
			queryClient.invalidateQueries({
				queryKey: ["roulette-prizes", eventId, sessionId],
			});
		},
		onError: (err: unknown) => {
			toast.error(getErrorMessage(err) || "Failed to update prize");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (prizeId: number) =>
			deleteRoulettePrize(eventId, sessionId, prizeId),
		onSuccess: () => {
			toast.success("Prize deleted");
			queryClient.invalidateQueries({
				queryKey: ["roulette-prizes", eventId, sessionId],
			});
		},
		onError: (err: unknown) => {
			toast.error(getErrorMessage(err) || "Failed to delete prize");
		},
	});

	const deleteWinnerMutation = useMutation({
		mutationFn: (winnerId: number) =>
			deleteRouletteWinner(eventId, sessionId, winnerId),
		onSuccess: (updatedPrize) => {
			toast.success("Winner removed");
			// Update the prize in the cache with the returned updated prize
			queryClient.setQueryData<RoulettePrize[]>(
				["roulette-prizes", eventId, sessionId],
				(oldPrizes) => {
					if (!oldPrizes) return oldPrizes;
					return oldPrizes.map((prize) =>
						prize.id === updatedPrize.id ? updatedPrize : prize,
					);
				},
			);
			// Invalidate winners query so draw component updates
			queryClient.invalidateQueries({
				queryKey: ["roulette-winners", eventId, sessionId],
			});
		},
		onError: (err: unknown) => {
			toast.error(getErrorMessage(err) || "Failed to remove winner");
		},
	});

	const notifyWinnerMutation = useMutation({
		mutationFn: (winnerId: number) =>
			notifyRouletteWinner(eventId, sessionId, winnerId),
		onMutate: (winnerId) => {
			setNotifyingWinnerIds(prev => new Set(prev).add(winnerId));
		},
		onSuccess: () => {
			toast.success("Notification sent successfully");
		},
		onError: (err: unknown) => {
			toast.error(getErrorMessage(err) || "Failed to send notification");
		},
		onSettled: (_data, _error, winnerId) => {
			setNotifyingWinnerIds(prev => {
				const next = new Set(prev);
				next.delete(winnerId);
				return next;
			});
		},
	});

	const handleCreate = () => {
		const validation = validatePrize(newName, newQuantity);
		if (!validation.isValid) {
			toast.error(validation.error || "Validation failed");
			return;
		}
		createMutation.mutate({
			name: newName.trim(),
			quantity: newQuantity,
			image: newImage || undefined,
		});
	};

	const handleUpdate = (
		prize: RoulettePrize,
		name: string,
		quantity: number,
		image: File | null,
		removeImage: boolean,
	) => {
		const validation = validatePrize(name, quantity);
		if (!validation.isValid) {
			toast.error(validation.error || "Validation failed");
			return;
		}
		updateMutation.mutate({
			prizeId: prize.id,
			data: {
				name: name.trim(),
				quantity,
				image: image || undefined,
				remove_image: removeImage,
			},
		});
	};

	const handleDelete = (prizeId: number) => {
		deleteMutation.mutate(prizeId);
	};

	const handleDeleteWinner = (winnerId: number) => {
		deleteWinnerMutation.mutate(winnerId);
	};

	const handleNotifyWinner = (winnerId: number) => {
		notifyWinnerMutation.mutate(winnerId);
	};

	const renderPrizeCards = () => {
		if (isLoading) {
			return (
				<div className="flex flex-col gap-3">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardHeader className="flex flex-row items-center gap-3">
								<Skeleton className="h-8 w-8 rounded-full" />
								<Skeleton className="h-6 w-32" />
							</CardHeader>
						</Card>
					))}
				</div>
			);
		}

		return (
			<div className="flex flex-col gap-3">
				{!prizes || prizes.length === 0 ? (
					<div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
						No prizes yet. Add prizes to configure available rewards.
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{prizes.map((prize) => (
							<PrizeItem
								key={prize.id}
								prize={prize}
								onUpdate={handleUpdate}
								onDelete={handleDelete}
								onDeleteWinner={handleDeleteWinner}
								onNotifyWinner={handleNotifyWinner}
								isUpdating={updateMutation.isPending}
								isDeleting={deleteMutation.isPending}
								isDeletingWinner={deleteWinnerMutation.isPending}
								notifyingWinnerIds={notifyingWinnerIds}
							/>
						))}
					</div>
				)}
				<AddPrizeCard
					isOpen={isAddPrizeCardOpen}
					name={newName}
					quantity={newQuantity}
					image={newImage}
					onNameChange={setNewName}
					onQuantityChange={setNewQuantity}
					onImageChange={setNewImage}
					onOpenChange={setIsAddPrizeCardOpen}
					onSubmit={handleCreate}
					onCancel={() => {
						setIsAddPrizeCardOpen(false);
						setNewName("");
						setNewQuantity(1);
						setNewImage(null);
					}}
					isSubmitting={createMutation.isPending}
				/>
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
					<Gift className="size-4" />
					<span className="hidden text-sm md:block">Prize Configuration</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
				<SheetHeader className="gap-0! border-b">
					<SheetTitle>Prize Configuration</SheetTitle>
					<SheetDescription>
						Configure available prizes and their quantities for roulette draws.
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-6 px-4 pb-4">
					<Card className="flex border-0 p-0! shadow-none">
						<CardContent className="p-0">
							<ScrollArea className="h-[calc(100vh-12rem)] pb-4">
								{error ? (
									<div className="p-4 text-center text-destructive text-sm">
										Failed to load prizes. Please try again.
									</div>
								) : (
									renderPrizeCards()
								)}
							</ScrollArea>
						</CardContent>
					</Card>
				</div>
			</SheetContent>
		</Sheet>
	);
}
