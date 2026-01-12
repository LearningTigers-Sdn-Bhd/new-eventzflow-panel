"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Option {
	label: string;
	value: string;
}

interface MultiSelectProps {
	options: Option[];
	selected: string[];
	onChange: (selected: string[]) => void;
	placeholder?: string;
	className?: string;
}

export function MultiSelect({
	options,
	selected,
	onChange,
	placeholder = "Select items...",
	className,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const handleSelect = (value: string) => {
		if (selected.includes(value)) {
			onChange(selected.filter((item) => item !== value));
		} else {
			onChange([...selected, value]);
		}
	};

    const selectedLabels = selected
        .map((val) => options.find((opt) => opt.value === val)?.label)
        .filter(Boolean);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-full justify-between h-auto min-h-10 py-2", className)}
				>
					<div className="flex flex-wrap gap-1 text-left font-normal">
						{selected.length === 0 && (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
						{selected.length > 0 && selected.length <= 2 && (
                             selectedLabels.map((label) => (
                                <Badge variant="secondary" key={label} className="mr-1">
                                    {label}
                                </Badge>
                             ))
						)}
                        {selected.length > 2 && (
                            <Badge variant="secondary">
                                {selected.length} selected
                            </Badge>
                        )}
					</div>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
                <ScrollArea className="max-h-60">
                    <div className="p-2 space-y-1">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className="flex items-center space-x-2 rounded-sm p-2 hover:bg-accent cursor-pointer"
                                onClick={() => handleSelect(option.value)}
                            >
                                <Checkbox
                                    id={`ms-${option.value}`}
                                    checked={selected.includes(option.value)}
                                    onCheckedChange={() => handleSelect(option.value)}
                                />
                                <label
                                    htmlFor={`ms-${option.value}`}
                                    className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
			</PopoverContent>
		</Popover>
	);
}
