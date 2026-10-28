"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getEventById, updateEvent } from "@/lib/api/event";

interface TagsSettingsDialogProps {
	eventId: number;
	trigger: React.ReactNode;
}

const MAX_TAGS_PER_KIT = 50;

/** How many exhibitor tags every kit in this event includes. */
export function TagsSettingsDialog({
	eventId,
	trigger,
}: TagsSettingsDialogProps) {
	const queryClient = useQueryClient();
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");

	const { data: event } = useQuery({
		queryKey: ["event", String(eventId)],
		queryFn: () => getEventById(String(eventId)),
		enabled: open,
	});

	React.useEffect(() => {
		if (open && event) setValue(String(event.exhibitor_tags_per_kit ?? 2));
	}, [open, event]);

	const perKit = Number(value);
	const valid =
		value !== "" &&
		Number.isInteger(perKit) &&
		perKit >= 0 &&
		perKit <= MAX_TAGS_PER_KIT;

	const save = useMutation({
		mutationFn: () =>
			updateEvent(String(eventId), { exhibitor_tags_per_kit: perKit }),
		onSuccess: () => {
			toast.success("Tags per kit saved");
			queryClient.invalidateQueries({ queryKey: ["event", String(eventId)] });
			queryClient.invalidateQueries({
				queryKey: ["event", String(eventId), "vendors"],
			});
			setOpen(false);
		},
		onError: (error: Error) =>
			toast.error(error.message || "Couldn't save tags per kit"),
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="rounded-none sm:max-w-[420px]">
				<DialogHeader>
					<DialogTitle>Exhibitor Tags</DialogTitle>
					<DialogDescription>
						Tags each exhibitor kit includes. Tags collected beyond this count
						as extra.
					</DialogDescription>
				</DialogHeader>
				<form
					className="grid gap-4"
					onSubmit={(e) => {
						e.preventDefault();
						if (valid) save.mutate();
					}}
				>
					<Field orientation="vertical">
						<FieldLabel htmlFor="tags-per-kit" className="text-sm">
							Tags per kit
						</FieldLabel>
						<Input
							id="tags-per-kit"
							type="number"
							min={0}
							max={MAX_TAGS_PER_KIT}
							step={1}
							value={value}
							onChange={(e) => setValue(e.target.value)}
							disabled={save.isPending}
							className="rounded-none"
						/>
						<FieldDescription>
							A company with 20 kits gets {valid ? perKit * 20 : "…"} tags.
						</FieldDescription>
					</Field>
					<DialogFooter>
						<Button
							type="submit"
							disabled={!valid || save.isPending}
							className="rounded-none"
						>
							{save.isPending ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
