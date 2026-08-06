"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	useBusinessMatchingSystemSettings,
	useUpdateBusinessMatchingSystemSettings,
} from "@/hooks/use-business-matching";
import type { DefaultHoursBlock } from "@/lib/api/business-matching";

export function BusinessMatchingDefaultsForm() {
	const { data: settings, isLoading } = useBusinessMatchingSystemSettings();
	const { mutate: updateSettings, isPending } =
		useUpdateBusinessMatchingSystemSettings();

	const [blocks, setBlocks] = useState<DefaultHoursBlock[]>([]);
	const [hoursEditableDefault, setHoursEditableDefault] = useState(true);

	useEffect(() => {
		if (settings) {
			setBlocks(settings.default_hours);
			setHoursEditableDefault(settings.hours_editable_default);
		}
	}, [settings]);

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
		updateSettings(
			{ default_hours: blocks, hours_editable_default: hoursEditableDefault },
			{
				onSuccess: () => toast.success("Business Matching defaults saved!"),
				onError: (error) =>
					toast.error("Failed to save defaults", {
						description: error.message || "An unexpected error occurred.",
					}),
			},
		);
	};

	if (isLoading) {
		return (
			<div className="flex h-24 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label className="font-semibold text-sm">
					Default Working Hours & Breaks
				</Label>
				<p className="text-muted-foreground text-xs">
					Pre-fills every new Business Matching session's schedule. Gaps between
					blocks act as breaks.
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
				/>
			</div>

			<div className="flex justify-end">
				<Button type="button" onClick={handleSave} disabled={isPending}>
					{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Save Defaults
				</Button>
			</div>
		</div>
	);
}
