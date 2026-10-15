"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface GroupFilterSelectProps {
	options: string[];
	selected: string[];
	onChange: (selected: string[]) => void;
	allLabel: string;
}

/**
 * Same trigger/content chrome as the other Selects on this page (rounded-none
 * border, divider line between rows, regular-weight text) but with a
 * checkbox per row so several groups can stay visible at once.
 */
export function GroupFilterSelect({
	options,
	selected,
	onChange,
	allLabel,
}: GroupFilterSelectProps) {
	const toggle = (value: string) => {
		onChange(
			selected.includes(value)
				? selected.filter((v) => v !== value)
				: [...selected, value],
		);
	};

	const triggerLabel =
		selected.length === options.length
			? allLabel
			: `${selected.length}/${options.length}`;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className="w-full justify-between rounded-none px-3 py-2 font-normal"
				>
					<span className="truncate">{triggerLabel}</span>
					<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="w-(--radix-popover-trigger-width) rounded-none p-0"
			>
				<div className="max-h-72 overflow-y-auto">
					{options.map((option, index) => (
						<div key={option}>
							{index > 0 && <div className="h-px bg-border" />}
							<label
								htmlFor={`group-filter-${option}`}
								className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
							>
								<Checkbox
									id={`group-filter-${option}`}
									checked={selected.includes(option)}
									onCheckedChange={() => toggle(option)}
								/>
								{option}
							</label>
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
