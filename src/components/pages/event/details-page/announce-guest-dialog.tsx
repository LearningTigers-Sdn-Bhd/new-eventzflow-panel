"use client";

import { useMutation } from "@tanstack/react-query";
import { Megaphone, Play, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { announceGuest } from "@/lib/api/check-in-display";

const STORAGE_KEY_PREFIX = "announce_guest_list_";

interface AnnounceGuestItem {
	name: string;
	tableNumber?: string;
}

interface AnnounceGuestDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventId: number;
}

export function AnnounceGuestDialog({
	open,
	onOpenChange,
	eventId,
}: AnnounceGuestDialogProps) {
	const storageKey = `${STORAGE_KEY_PREFIX}${eventId}`;
	const [guests, setGuests] = useState<AnnounceGuestItem[]>([]);
	const [inputName, setInputName] = useState("");
	const [inputTableNumber, setInputTableNumber] = useState("");
	const [announcingAll, setAnnouncingAll] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Load from localStorage on open
	useEffect(() => {
		if (open) {
			const saved = localStorage.getItem(storageKey);
			if (saved) {
				try {
					const parsed = JSON.parse(saved);
					if (!Array.isArray(parsed)) {
						setGuests([]);
						return;
					}

					const normalizedGuests = parsed
						.map((entry) => {
							if (typeof entry === "string") {
								return { name: entry.trim() };
							}

							if (
								typeof entry === "object" &&
								entry !== null &&
								typeof entry.name === "string"
							) {
								const tableNumber =
									typeof entry.tableNumber === "string"
										? entry.tableNumber.trim()
										: "";
								return {
									name: entry.name.trim(),
									tableNumber: tableNumber || undefined,
								};
							}

							return null;
						})
						.filter(
							(
								entry,
							): entry is {
								name: string;
								tableNumber?: string;
							} => Boolean(entry?.name),
						);

					setGuests(normalizedGuests);
				} catch {
					setGuests([]);
				}
			}
		}
	}, [open, storageKey]);

	// Persist to localStorage
	const persistGuests = useCallback(
		(updated: AnnounceGuestItem[]) => {
			setGuests(updated);
			localStorage.setItem(storageKey, JSON.stringify(updated));
		},
		[storageKey],
	);

	const addGuest = (e?: React.FormEvent) => {
		e?.preventDefault();
		const trimmed = inputName.trim();
		const trimmedTable = inputTableNumber.trim();
		if (!trimmed) return;
		persistGuests([
			...guests,
			{ name: trimmed, tableNumber: trimmedTable || undefined },
		]);
		setInputName("");
		setInputTableNumber("");
		inputRef.current?.focus();
	};

	const removeGuest = (index: number) => {
		persistGuests(guests.filter((_, i) => i !== index));
	};

	const clearAll = () => {
		persistGuests([]);
	};

	// Announce a single name
	const announceMutation = useMutation({
		mutationFn: async ({
			guest,
			index,
		}: {
			guest: AnnounceGuestItem;
			index: number;
		}) => {
			const customFieldsData = guest.tableNumber
				? { table_number: guest.tableNumber }
				: undefined;
			await announceGuest(eventId.toString(), guest.name, customFieldsData);
			return { guest, index };
		},
		onSuccess: ({ guest, index }) => {
			const tableSuffix = guest.tableNumber ? ` (${guest.tableNumber})` : "";
			toast.success(`Announced: ${guest.name}${tableSuffix}`);
			persistGuests(guests.filter((_, currentIndex) => currentIndex !== index));
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to announce guest");
		},
	});

	// Announce all names sequentially
	const handleAnnounceAll = async () => {
		if (guests.length === 0) return;
		setAnnouncingAll(true);
		const toAnnounce = [...guests];
		const remaining = [...guests];

		for (const guest of toAnnounce) {
			try {
				const customFieldsData = guest.tableNumber
					? { table_number: guest.tableNumber }
					: undefined;
				await announceGuest(eventId.toString(), guest.name, customFieldsData);
				const tableSuffix = guest.tableNumber ? ` (${guest.tableNumber})` : "";
				toast.success(`Announced: ${guest.name}${tableSuffix}`);
				remaining.shift();
				persistGuests([...remaining]);
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: `Failed to announce: ${guest.name}`,
				);
				break;
			}
		}
		setAnnouncingAll(false);
	};

	const isAnnouncing = announceMutation.isPending || announcingAll;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Announce Guest</DialogTitle>
					<DialogDescription>
						Add guest names (with optional table number), then announce
						individually or all at once.
					</DialogDescription>
				</DialogHeader>

				{/* Add name input */}
				<form
					onSubmit={addGuest}
					className="grid gap-2 sm:grid-cols-[1fr_150px_auto]"
				>
					<Input
						ref={inputRef}
						value={inputName}
						onChange={(e) => setInputName(e.target.value)}
						placeholder="Enter guest name"
						className="rounded-none"
						autoFocus
						disabled={isAnnouncing}
					/>
					<Input
						value={inputTableNumber}
						onChange={(e) => setInputTableNumber(e.target.value)}
						placeholder="No. meja"
						className="rounded-none"
						disabled={isAnnouncing}
					/>
					<Button
						type="submit"
						variant="secondary"
						className="shrink-0 rounded-none"
						disabled={!inputName.trim() || isAnnouncing}
					>
						Add
					</Button>
				</form>

				{/* Names list */}
				{guests.length > 0 && (
					<div className="space-y-2">
						<div className="max-h-[240px] space-y-1 overflow-y-auto">
							{guests.map((guest, index) => (
								<div
									key={`${guest.name}-${guest.tableNumber || ""}-${index}`}
									className="flex items-center gap-2 border px-3 py-2"
								>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm">{guest.name}</p>
										{guest.tableNumber && (
											<p className="truncate text-muted-foreground text-xs">
												Meja {guest.tableNumber}
											</p>
										)}
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-7 w-7 shrink-0 rounded-none"
										onClick={() => announceMutation.mutate({ guest, index })}
										disabled={isAnnouncing}
										title="Announce"
									>
										<Megaphone className="h-3.5 w-3.5" />
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-7 w-7 shrink-0 rounded-none text-muted-foreground hover:text-destructive"
										onClick={() => removeGuest(index)}
										disabled={isAnnouncing}
										title="Remove"
									>
										<X className="h-3.5 w-3.5" />
									</Button>
								</div>
							))}
						</div>

						{/* Actions */}
						<div className="flex items-center justify-between pt-1">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="rounded-none text-muted-foreground text-xs"
								onClick={clearAll}
								disabled={isAnnouncing}
							>
								<Trash2 className="mr-1 h-3 w-3" />
								Clear List
							</Button>
							<Button
								type="button"
								size="sm"
								className="rounded-none"
								onClick={handleAnnounceAll}
								disabled={isAnnouncing}
							>
								<Play className="mr-1 h-3 w-3" />
								{announcingAll
									? `Announcing (${guests.length} left)...`
									: `Announce All (${guests.length})`}
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
