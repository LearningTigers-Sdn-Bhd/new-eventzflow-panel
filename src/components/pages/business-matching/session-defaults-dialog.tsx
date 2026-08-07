"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	useBusinessMatchingEventDefaults,
	useUpdateBusinessMatchingEventDefaults,
} from "@/hooks/use-business-matching";
import { useDialog } from "@/hooks/use-dialog";
import type { DefaultHoursBlock } from "@/lib/api/business-matching";

interface SessionDefaultsDialogProps {
	eventId: string;
}

export default function SessionDefaultsDialog({
	eventId,
}: SessionDefaultsDialogProps) {
	const { closeDialog } = useDialog();
	const { data: defaults, isLoading } =
		useBusinessMatchingEventDefaults(eventId);
	const { mutate: updateDefaults, isPending } =
		useUpdateBusinessMatchingEventDefaults(eventId);

	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [blocks, setBlocks] = useState<DefaultHoursBlock[]>([]);
	const [hoursEditableDefault, setHoursEditableDefault] = useState(true);

	useEffect(() => {
		if (defaults) {
			setStartDate(defaults.default_start_date || "");
			setEndDate(defaults.default_end_date || "");
			setBlocks(defaults.default_hours);
			setHoursEditableDefault(defaults.hours_editable_default);
		}
	}, [defaults]);

	const handleAddBlock = () => {
		setBlocks((prev) => [...prev, { start_time: "09:00", end_time: "17:00" }]);
	};

	const handleRemoveBlock = (index: number) => {
		setBlocks((prev) => prev.filter((_, i) => i !== index));
	};

	const handleBlockChange = (
		index: number,
		field: keyof DefaultHoursBlock,
		value: string,
	) => {
		setBlocks((prev) =>
			prev.map((block, i) =>
				i === index ? { ...block, [field]: value } : block,
			),
		);
	};

	const handleSave = () => {
		if (blocks.length === 0) {
			toast.error("Add at least one working-hours block.");
			return;
		}
		if (startDate && endDate && endDate < startDate) {
			toast.error("End date must be on or after the start date.");
			return;
		}
		updateDefaults(
			{
				default_start_date: startDate || null,
				default_end_date: endDate || null,
				default_hours: blocks,
				hours_editable_default: hoursEditableDefault,
			},
			{
				onSuccess: () => {
					toast.success("Session defaults saved!");
					closeDialog();
				},
				onError: (error) =>
					toast.error("Failed to save session defaults", {
						description: error.message || "An unexpected error occurred.",
					}),
			},
		);
	};

	if (isLoading) {
		return (
			<div className="flex h-32 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<p className="text-muted-foreground text-xs">
				New sessions created for this event will prefill from these — no need to
				set the date and hours manually every time.
			</p>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="defaults-start-date">Default Start Date</Label>
					<Input
						id="defaults-start-date"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						disabled={isPending}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="defaults-end-date">Default End Date</Label>
					<Input
						id="defaults-end-date"
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						disabled={isPending}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label className="font-semibold text-sm">
					Default Working Hours & Breaks
				</Label>
				<p className="text-muted-foreground text-xs">
					Gaps between blocks act as breaks (e.g. lunch).
				</p>
				<div className="space-y-2">
					{blocks.map((block, index) => (
						<div
							key={`${block.start_time}-${block.end_time}-${index}`}
							className="flex items-center gap-2"
						>
							<Input
								type="time"
								value={block.start_time}
								onChange={(e) =>
									handleBlockChange(index, "start_time", e.target.value)
								}
								className="h-9 w-32"
								disabled={isPending}
							/>
							<span className="text-muted-foreground text-xs">to</span>
							<Input
								type="time"
								value={block.end_time}
								onChange={(e) =>
									handleBlockChange(index, "end_time", e.target.value)
								}
								className="h-9 w-32"
								disabled={isPending}
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => handleRemoveBlock(index)}
								disabled={isPending}
								className="h-9 w-9"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					))}
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleAddBlock}
					disabled={isPending}
					className="gap-1"
				>
					<Plus className="h-3 w-3" /> Add Block
				</Button>
			</div>

			<div className="flex items-center justify-between rounded-lg border p-3">
				<div className="space-y-0.5">
					<Label htmlFor="hours-editable-default">
						Hosts can edit their own hours by default
					</Label>
					<p className="text-muted-foreground text-xs">
						Overridable per session, and per host within a session.
					</p>
				</div>
				<Switch
					id="hours-editable-default"
					checked={hoursEditableDefault}
					onCheckedChange={setHoursEditableDefault}
					disabled={isPending}
					className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 dark:data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-red-500"
				/>
			</div>

			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button type="button" onClick={handleSave} disabled={isPending}>
					{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Save Defaults
				</Button>
			</div>
		</div>
	);
}
