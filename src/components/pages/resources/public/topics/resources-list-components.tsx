"use client";

import { LayoutGrid, List, Search, X } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

// --- Topic Button ---

interface ResourcesTopicButtonProps {
	label: string;
	isSelected: boolean;
	onClick: () => void;
	className?: string;
}

export const ResourcesTopicButton = memo(function ResourcesTopicButton({
	label,
	isSelected,
	onClick,
	className,
}: ResourcesTopicButtonProps) {
	return (
		<Button
			onClick={onClick}
			className={cn(
				"h-10 shrink-0 cursor-pointer rounded-none border border-black px-6 font-medium shadow-none transition-all",
				isSelected
					? "bg-black! text-white hover:bg-black!"
					: "bg-white! text-black hover:bg-gray-200!",
				className,
			)}
		>
			{label}
		</Button>
	);
});

// --- Search Input ---

interface ResourcesSearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export const ResourcesSearchInput = memo(function ResourcesSearchInput({
	value,
	onChange,
	placeholder = "Search resources...",
}: ResourcesSearchInputProps) {
	const [inputValue, setInputValue] = useState(value);

	// Sync local state with prop when prop changes externally (e.g. clear filters)
	useEffect(() => {
		setInputValue(value);
	}, [value]);

	// Debounce the onChange call
	useEffect(() => {
		const timer = setTimeout(() => {
			if (inputValue !== value) {
				onChange(inputValue);
			}
		}, 400);

		return () => clearTimeout(timer);
	}, [inputValue, onChange, value]);

	return (
		<div className="relative flex-1">
			<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black" />
			<Input
				placeholder={placeholder}
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				className="h-10 rounded-none border-black bg-white! pl-9 text-black shadow-none placeholder:text-black focus-visible:border-black focus-visible:ring-0"
			/>
		</div>
	);
});

// --- Filter MultiSelect ---

interface ResourcesFilterSelectProps {
	value: string[];
	onChange: (value: string[]) => void;
	options: { label: string; value: string }[];
	placeholder: string;
}

export const ResourcesFilterSelect = memo(function ResourcesFilterSelect({
	value,
	onChange,
	options,
	placeholder,
}: ResourcesFilterSelectProps) {
	return (
		<div className="w-full">
			<MultiSelect value={value} onValueChange={onChange}>
				<MultiSelectTrigger
					className="h-10 cursor-pointer rounded-none border border-black! bg-white! text-black shadow-none hover:bg-gray-200! focus:ring-0"
					iconClassName="text-black opacity-100"
				>
					<MultiSelectValue
						placeholder={placeholder}
						className="text-black"
						options={options}
					/>
				</MultiSelectTrigger>
				<MultiSelectContent className="rounded-none border-black bg-white!">
					{options.map((option) => (
						<MultiSelectItem
							key={option.value}
							value={option.value}
							className="cursor-pointer rounded-none text-black hover:bg-gray-200 focus:bg-gray-200 [&_button[data-state=checked]]:border-black [&_button[data-state=checked]]:bg-black [&_button[data-state=checked]]:text-white [&_button]:rounded-none [&_button]:border-black hover:[&_button]:border-black"
						>
							{option.label}
						</MultiSelectItem>
					))}
				</MultiSelectContent>
			</MultiSelect>
		</div>
	);
});

// --- View Switcher ---

interface ResourcesViewSwitcherProps {
	viewMode: "grid" | "list";
	onChange: (mode: "grid" | "list") => void;
}

export const ResourcesViewSwitcher = memo(function ResourcesViewSwitcher({
	viewMode,
	onChange,
}: ResourcesViewSwitcherProps) {
	return (
		<div className="flex items-center border border-black bg-white!">
			<Button
				size="icon"
				className={cn(
					"h-10 w-10 cursor-pointer rounded-none shadow-none transition-colors",
					viewMode === "grid"
						? "bg-black! text-white hover:bg-black!"
						: "bg-white! text-black hover:bg-gray-200!",
				)}
				onClick={() => onChange("grid")}
			>
				<LayoutGrid className="h-4 w-4" />
			</Button>
			<Button
				size="icon"
				className={cn(
					"h-10 w-10 cursor-pointer rounded-none border-black border-l shadow-none transition-colors",
					viewMode === "list"
						? "bg-black! text-white hover:bg-black!"
						: "bg-white! text-black hover:bg-gray-200!",
				)}
				onClick={() => onChange("list")}
			>
				<List className="h-4 w-4" />
			</Button>
		</div>
	);
});

// --- Filter Trigger Button ---

interface ResourcesFilterButtonProps {
	onClick: () => void;
	label?: string;
	isActive?: boolean;
}

export const ResourcesFilterButton = memo(function ResourcesFilterButton({
	onClick,
	label = "Filters",
	isActive = false,
}: ResourcesFilterButtonProps) {
	return (
		<Button
			onClick={onClick}
			className={cn(
				"flex h-10 cursor-pointer items-center gap-2 rounded-none border border-black px-6 font-medium shadow-none transition-all",
				isActive
					? "bg-black! text-white hover:bg-black!"
					: "bg-white! text-black hover:bg-gray-200!",
			)}
		>
			<List className="h-4 w-4" />
			{label}
		</Button>
	);
});

export const ResourcesCloseFilterButton = memo(
	function ResourcesCloseFilterButton({
		onClick,
		label = "Close",
		className,
	}: {
		onClick: () => void;
		label?: string;
		className?: string;
	}) {
		return (
			<Button
				onClick={onClick}
				className={cn(
					"flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-none border border-black bg-white! text-black shadow-none hover:bg-gray-200!",
					className,
				)}
			>
				<X className="h-4 w-4" />
				<span>{label}</span>
			</Button>
		);
	},
);
