"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEventById, updateEvent } from "@/lib/api/event";

const DEFAULT_BOOTH_TYPES = [
	{ value: "shell_scheme", label: "Shell Scheme" },
	{ value: "raw_space", label: "Raw Space" },
];

interface BoothTypesDialogProps {
	eventId: number;
	trigger?: React.ReactNode;
}

const formatBoothType = (boothType: string) =>
	boothType
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");

export function BoothTypesDialog({ eventId, trigger }: BoothTypesDialogProps) {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = React.useState(false);
	const [newType, setNewType] = React.useState("");
	const [customTypes, setCustomTypes] = React.useState<string[]>([]);

	const { data: event, isLoading } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId.toString()),
		enabled: isOpen,
	});

	// Sync custom types when event data loads
	React.useEffect(() => {
		if (event?.booth_types) {
			setCustomTypes(event.booth_types);
		}
	}, [event]);

	const updateMutation = useMutation({
		mutationFn: (boothTypes: string[]) =>
			updateEvent(eventId.toString(), { booth_types: boothTypes }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["event", eventId] });
			toast.success("Booth types updated");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update booth types");
		},
	});

	const handleAdd = () => {
		const trimmed = newType.trim();
		if (!trimmed) {
			toast.error("Please enter a booth type name");
			return;
		}

		// Convert to snake_case for storage
		const snakeCase = trimmed
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "_")
			.replace(/^_|_$/g, "");

		if (!snakeCase) {
			toast.error("Invalid booth type name");
			return;
		}

		// Check if it already exists in defaults or custom types
		const allExisting = [
			...DEFAULT_BOOTH_TYPES.map((t) => t.value),
			...customTypes,
		];
		if (allExisting.includes(snakeCase)) {
			toast.error("This booth type already exists");
			return;
		}

		const updated = [...customTypes, snakeCase];
		setCustomTypes(updated);
		setNewType("");
		updateMutation.mutate(updated);
	};

	const handleRemove = (typeToRemove: string) => {
		const updated = customTypes.filter((t) => t !== typeToRemove);
		setCustomTypes(updated);
		updateMutation.mutate(updated);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAdd();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" className="w-full rounded-none sm:w-auto">
						Booth Types
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="rounded-none sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Manage Booth Types</DialogTitle>
					<DialogDescription>
						Add custom booth types for this event. Default types (Shell Scheme,
						Raw Space) are always available.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="space-y-4">
						{/* Add new type */}
						<div className="space-y-2">
							<Label htmlFor="new-booth-type">Add Custom Booth Type</Label>
							<div className="flex gap-2">
								<Input
									id="new-booth-type"
									placeholder="e.g., Island Booth"
									value={newType}
									onChange={(e) => setNewType(e.target.value)}
									onKeyDown={handleKeyDown}
									disabled={updateMutation.isPending}
									className="h-9 rounded-none"
								/>
								<Button
									type="button"
									size="sm"
									onClick={handleAdd}
									disabled={updateMutation.isPending || !newType.trim()}
									className="h-9 rounded-none px-3"
								>
									{updateMutation.isPending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Plus className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>

						{/* Default types */}
						<div className="space-y-2">
							<Label className="text-muted-foreground text-xs">
								Default Types
							</Label>
							<div className="flex flex-wrap gap-2">
								{DEFAULT_BOOTH_TYPES.map((type) => (
									<Badge
										key={type.value}
										variant="secondary"
										className="rounded-none px-3 py-1"
									>
										{type.label}
									</Badge>
								))}
							</div>
						</div>

						{/* Custom types */}
						{customTypes.length > 0 && (
							<div className="space-y-2">
								<Label className="text-muted-foreground text-xs">
									Custom Types
								</Label>
								<div className="space-y-1">
									{customTypes.map((type) => (
										<div
											key={type}
											className="flex items-center justify-between border border-dashed px-3 py-2"
										>
											<span className="text-sm font-medium">{formatBoothType(type)}</span>
											<button
												type="button"
												onClick={() => handleRemove(type)}
												disabled={updateMutation.isPending}
												className="p-1 text-muted-foreground hover:text-destructive"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						className="rounded-none"
						onClick={() => setIsOpen(false)}
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
