"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimeSelectProps {
	options: string[];
	value: string;
	onValueChange: (value: string) => void;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	// Scrolls here on open instead of starting at 12AM, since most blocks
	// start well after midnight. Only applies when nothing is picked yet —
	// Radix already scrolls to the selected item once one exists.
	scrollToTime?: string;
}

export function TimeSelect({
	options,
	value,
	onValueChange,
	open,
	onOpenChange,
	placeholder = "Select time",
	disabled,
	className,
	scrollToTime = "06:00",
}: TimeSelectProps) {
	const handleOpenChange = (nextOpen: boolean) => {
		onOpenChange?.(nextOpen);
		if (!nextOpen || value) return;

		const target = options.find((t) => t >= scrollToTime) ?? options[0];
		if (!target) return;

		// Radix portals + mounts SelectContent async on open, so wait a couple
		// of frames before the target item actually exists in the DOM.
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				document
					.querySelector(`[data-time-option="${target}"]`)
					?.scrollIntoView({ block: "start" });
			});
		});
	};

	return (
		<Select
			open={open}
			onOpenChange={handleOpenChange}
			value={value}
			onValueChange={onValueChange}
			disabled={disabled}
		>
			<SelectTrigger className={cn("h-8 w-28 text-xs", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="max-h-[240px]">
				{options.map((t) => (
					<SelectItem key={t} value={t} data-time-option={t}>
						{t}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
