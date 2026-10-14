"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDialog } from "@/hooks/use-dialog";
import { hallKeys, useCounterVenues } from "@/hooks/use-event-halls";
import { createHall, type Hall, updateHall } from "@/lib/api/event/hall";

// Radix Select cannot hold an empty-string value, so "no counter" needs a sentinel.
const NO_COUNTER = "none";

interface HallFormProps {
	eventId: string;
	/** Present when editing; absent when creating. */
	hall?: Hall;
}

/** Add or edit a hall. Only reachable from the org-owner Settings tab; the API enforces that too. */
export function HallForm({ eventId, hall }: HallFormProps) {
	const formId = useId();
	const queryClient = useQueryClient();
	const { closeDialog } = useDialog();
	const venues = useCounterVenues(eventId);

	const [name, setName] = useState(hall?.name ?? "");
	const [floor, setFloor] = useState(hall?.floor ?? "");
	const [venueId, setVenueId] = useState(
		hall?.counterVenueId ? String(hall.counterVenueId) : NO_COUNTER,
	);

	const save = useMutation({
		mutationFn: () => {
			const input = {
				name: name.trim(),
				floor: floor.trim(),
				counterVenueId: venueId === NO_COUNTER ? null : Number(venueId),
			};
			return hall
				? updateHall(eventId, hall.id, input)
				: createHall(eventId, input);
		},
		onSuccess: () => {
			toast.success(hall ? "Hall updated" : "Hall added");
			queryClient.invalidateQueries({ queryKey: hallKeys.halls(eventId) });
			queryClient.invalidateQueries({ queryKey: hallKeys.headcount(eventId) });
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(`Failed to save hall: ${error.message}`);
		},
	});

	return (
		<form
			id={formId}
			className="-mx-1 w-full space-y-4 px-1"
			onSubmit={(e) => {
				e.preventDefault();
				if (name.trim()) save.mutate();
			}}
		>
			<InputLabel
				label="Hall name"
				htmlFor={`${formId}-name`}
				value={name}
				onChange={setName}
				placeholder="Hall A"
				disabled={save.isPending}
				autoFocus
				required
			/>
			<InputLabel
				label="Level (optional)"
				htmlFor={`${formId}-floor`}
				description="Halls with the same level are grouped and totalled together, e.g. Level 1."
				value={floor}
				onChange={setFloor}
				placeholder="Level 1"
				disabled={save.isPending}
			/>

			<div className="space-y-2">
				<Label htmlFor={`${formId}-counter`}>People counter</Label>
				<Select
					value={venueId}
					onValueChange={setVenueId}
					disabled={save.isPending || venues.isLoading}
				>
					<SelectTrigger id={`${formId}-counter`} className="w-full">
						<SelectValue placeholder="Choose a counter" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={NO_COUNTER}>Not linked</SelectItem>
						{venues.data?.map((venue) => (
							<SelectItem key={venue.id} value={String(venue.id)}>
								{venue.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{venues.isError && (
					<p className="text-destructive text-xs">
						Couldn't load counters. Check the counter connection above, or save
						the hall now and link it later.
					</p>
				)}
			</div>

			<div className="flex justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="outline"
					className="rounded-none"
					onClick={closeDialog}
					disabled={save.isPending}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					className="rounded-none"
					disabled={save.isPending || !name.trim()}
				>
					{save.isPending ? "Saving..." : hall ? "Save changes" : "Add hall"}
				</Button>
			</div>
		</form>
	);
}
