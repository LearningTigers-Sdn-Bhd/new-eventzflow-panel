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
	const [names, setNames] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [announcingAll, setAnnouncingAll] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Load from localStorage on open
	useEffect(() => {
		if (open) {
			const saved = localStorage.getItem(storageKey);
			if (saved) {
				try {
					setNames(JSON.parse(saved));
				} catch {
					setNames([]);
				}
			}
		}
	}, [open, storageKey]);

	// Persist to localStorage
	const persistNames = useCallback(
		(updated: string[]) => {
			setNames(updated);
			localStorage.setItem(storageKey, JSON.stringify(updated));
		},
		[storageKey],
	);

	const addName = (e?: React.FormEvent) => {
		e?.preventDefault();
		const trimmed = inputValue.trim();
		if (!trimmed) return;
		persistNames([...names, trimmed]);
		setInputValue("");
		inputRef.current?.focus();
	};

	const removeName = (index: number) => {
		persistNames(names.filter((_, i) => i !== index));
	};

	const clearAll = () => {
		persistNames([]);
	};

	// Announce a single name
	const announceMutation = useMutation({
		mutationFn: (name: string) => announceGuest(eventId.toString(), name),
		onSuccess: (_, name) => {
			toast.success(`Announced: ${name}`);
			persistNames(names.filter((n) => n !== name));
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to announce guest");
		},
	});

	// Announce all names sequentially
	const handleAnnounceAll = async () => {
		if (names.length === 0) return;
		setAnnouncingAll(true);
		const toAnnounce = [...names];
		const remaining = [...names];

		for (const name of toAnnounce) {
			try {
				await announceGuest(eventId.toString(), name);
				toast.success(`Announced: ${name}`);
				remaining.shift();
				persistNames([...remaining]);
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: `Failed to announce: ${name}`,
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
						Add guest names to the list, then announce individually or all at
						once.
					</DialogDescription>
				</DialogHeader>

				{/* Add name input */}
				<form onSubmit={addName} className="flex gap-2">
					<Input
						ref={inputRef}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="Enter guest name"
						className="rounded-none"
						autoFocus
						disabled={isAnnouncing}
					/>
					<Button
						type="submit"
						variant="secondary"
						className="shrink-0 rounded-none"
						disabled={!inputValue.trim() || isAnnouncing}
					>
						Add
					</Button>
				</form>

				{/* Names list */}
				{names.length > 0 && (
					<div className="space-y-2">
						<div className="max-h-[240px] space-y-1 overflow-y-auto">
							{names.map((name, index) => (
								<div
									key={`${name}-${index}`}
									className="flex items-center gap-2 border px-3 py-2"
								>
									<span className="min-w-0 flex-1 truncate text-sm">
										{name}
									</span>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-7 w-7 shrink-0 rounded-none"
										onClick={() => announceMutation.mutate(name)}
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
										onClick={() => removeName(index)}
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
									? `Announcing (${names.length} left)...`
									: `Announce All (${names.length})`}
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
