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

		// Radix mounts SelectContent async and also runs its own scroll/focus
		// positioning right after — a single rAF can lose that race and get
		// silently reset back to the top. Poll briefly instead of guessing a
		// fixed delay, and set scrollTop directly (scrollIntoView can get
		// fought by Radix's own viewport measurement).
		let attempts = 0;
		const tryScroll = () => {
			attempts += 1;
			const item = document.querySelector<HTMLElement>(
				`[data-time-option="${target}"]`,
			);
			const viewport = item?.closest<HTMLElement>(
				"[data-radix-select-viewport]",
			);
			if (item && viewport) {
				viewport.scrollTop =
					item.offsetTop - viewport.clientHeight / 2 + item.clientHeight / 2;
				return;
			}
			if (attempts < 10) {
				setTimeout(tryScroll, 20);
			}
		};
		setTimeout(tryScroll, 20);
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
