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
}: TimeSelectProps) {
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
					<SelectItem key={t} value={t}>
						{t}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
