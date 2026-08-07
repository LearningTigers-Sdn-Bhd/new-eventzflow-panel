"use client";

import { useEffect } from "react";
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
	// Radix only calls onOpenChange for opens it triggers itself (trigger
	// click, Escape, etc.) — not when we drive `open` externally, which is
	// exactly how these get auto-opened (start picked -> end auto-opens). A
	// plain effect on the `open` prop catches both cases.
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally only re-runs on `open` — options/value/scrollToTime are read at trigger time, not watched for changes
	useEffect(() => {
		if (!open || value) return;

		const target = options.find((t) => t >= scrollToTime) ?? options[0];
		if (!target) return;

		// Radix mounts SelectContent async, so poll briefly instead of
		// guessing a fixed delay, and set scrollTop directly (scrollIntoView
		// can get fought by Radix's own viewport measurement).
		let attempts = 0;
		let timer: ReturnType<typeof setTimeout>;
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
			if (attempts < 15) {
				timer = setTimeout(tryScroll, 20);
			}
		};
		timer = setTimeout(tryScroll, 20);

		return () => clearTimeout(timer);
	}, [open]);

	return (
		<Select
			open={open}
			onOpenChange={onOpenChange}
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
