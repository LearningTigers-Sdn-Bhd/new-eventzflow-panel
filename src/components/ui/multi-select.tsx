"use client";

import { ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// --- Context ---

interface MultiSelectContextProps {
	value: string[];
	onValueChange: (value: string[]) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
}

const MultiSelectContext = React.createContext<MultiSelectContextProps | null>(
	null,
);

const useMultiSelect = () => {
	const context = React.useContext(MultiSelectContext);
	if (!context) {
		throw new Error("useMultiSelect must be used within MultiSelect");
	}
	return context;
};

// --- Components ---

interface MultiSelectProps {
	value: string[];
	onValueChange: (value: string[]) => void;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
}

const MultiSelect = ({
	value,
	onValueChange,
	open,
	onOpenChange,
	children,
}: MultiSelectProps) => {
	const [internalOpen, setInternalOpen] = React.useState(false);

	const isControlled = open !== undefined;
	const currentOpen = isControlled ? open : internalOpen;
	const handleOpenChange = isControlled ? onOpenChange : setInternalOpen;

	return (
		<MultiSelectContext.Provider
			value={{
				value,
				onValueChange,
				open: currentOpen || false,
				setOpen: handleOpenChange || (() => {}),
			}}
		>
			<Popover open={currentOpen} onOpenChange={handleOpenChange}>
				{children}
			</Popover>
		</MultiSelectContext.Provider>
	);
};

// Trigger
interface MultiSelectTriggerProps
	extends React.ComponentPropsWithoutRef<typeof Button> {
	asChild?: boolean;
	iconClassName?: string;
}

const MultiSelectTrigger = React.forwardRef<
	HTMLButtonElement,
	MultiSelectTriggerProps
>(({ className, children, asChild = false, iconClassName, ...props }, ref) => {
	return (
		<PopoverTrigger asChild>
			<Button
				ref={ref}
				variant="outline"
				role="combobox"
				className={cn(
					"h-auto min-h-10 w-full justify-between py-2 transition-all",
					className,
				)}
				{...props}
			>
				{children}
				<ChevronsUpDown
					className={cn("ml-2 h-4 w-4 shrink-0 opacity-50", iconClassName)}
				/>
			</Button>
		</PopoverTrigger>
	);
});
MultiSelectTrigger.displayName = "MultiSelectTrigger";

// Value Display
interface MultiSelectValueProps {
	placeholder?: string;
	maxDisplay?: number;
	// Helper to map values to labels if needed for display
	options?: { label: string; value: string }[];
	className?: string;
	children?: (value: string[]) => React.ReactNode;
}

const MultiSelectValue = ({
	placeholder = "Select items...",
	maxDisplay = 2,
	options = [],
	className,
	children,
}: MultiSelectValueProps) => {
	const { value } = useMultiSelect();

	if (children) {
		return <>{children(value)}</>;
	}

	if (value.length === 0) {
		return (
			<span className={cn("text-muted-foreground", className)}>
				{placeholder}
			</span>
		);
	}

	// Default badge renderer
	if (value.length > maxDisplay) {
		return (
			<div
				className={cn("flex flex-row flex-wrap items-center gap-1", className)}
			>
				<Badge className="rounded-none border-black bg-black text-white hover:bg-black">
					{value.length} selected
				</Badge>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"inline-flex flex-row! flex-nowrap items-center gap-1 overflow-hidden",
				className,
			)}
		>
			{value.map((val) => {
				const label = options.find((o) => o.value === val)?.label || val;
				return (
					<Badge
						key={val}
						className="shrink-0 rounded-none border-black bg-black text-white hover:bg-black"
					>
						{label}
					</Badge>
				);
			})}
		</div>
	);
};

// Content
const MultiSelectContent = React.forwardRef<
	React.ElementRef<typeof PopoverContent>,
	React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ className, children, ...props }, ref) => {
	return (
		<PopoverContent
			ref={ref}
			className={cn("w-[200px] p-0", className)}
			align="start"
			{...props}
		>
			<ScrollArea className="max-h-60">
				<div className="space-y-1 p-2">{children}</div>
			</ScrollArea>
		</PopoverContent>
	);
});
MultiSelectContent.displayName = "MultiSelectContent";

// Item
interface MultiSelectItemProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
	value: string;
	onSelect?: (value: string) => void;
}

const MultiSelectItem = React.forwardRef<
	HTMLButtonElement,
	MultiSelectItemProps
>(({ className, children, value: itemValue, onSelect, ...props }, ref) => {
	const { value: selectedValues, onValueChange } = useMultiSelect();
	const isSelected = selectedValues.includes(itemValue);

	const handleSelect = () => {
		if (isSelected) {
			onValueChange(selectedValues.filter((v) => v !== itemValue));
		} else {
			onValueChange([...selectedValues, itemValue]);
		}
		onSelect?.(itemValue);
	};

	return (
		<button
			ref={ref}
			type="button"
			data-state={isSelected ? "checked" : "unchecked"}
			className={cn(
				"flex w-full cursor-pointer items-center space-x-2 rounded-sm p-2 text-left hover:bg-accent",
				className,
			)}
			onClick={(e) => {
				e.preventDefault();
				handleSelect();
			}}
			{...props}
		>
			<Checkbox
				checked={isSelected}
				onCheckedChange={handleSelect}
				id={`ms-item-${itemValue}`}
			/>
			<label
				htmlFor={`ms-item-${itemValue}`}
				className="flex-1 cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				{children}
			</label>
		</button>
	);
});
MultiSelectItem.displayName = "MultiSelectItem";

// --- Exports ---

export {
	MultiSelect,
	MultiSelectTrigger,
	MultiSelectValue,
	MultiSelectContent,
	MultiSelectItem,
	useMultiSelect,
};

// --- Compatibility / Convenience Component ---
// (Optional: Keeps the old API working if you want, but user asked to change to composition.
//  I will leave a helper `MultiSelectPrimitive` as the legacy name if needed,
//  but typically in these refactors we replace the export.)

export interface Option {
	label: string;
	value: string;
}

interface MultiSelectLegacyProps {
	options: Option[];
	selected: string[];
	onChange: (selected: string[]) => void;
	placeholder?: string;
	className?: string;
}

/**
 * Legacy component wrapper for backward compatibility or simple usage.
 */
export function MultiSelectLegacy({
	options,
	selected,
	onChange,
	placeholder,
	className,
}: MultiSelectLegacyProps) {
	return (
		<MultiSelect value={selected} onValueChange={onChange}>
			<MultiSelectTrigger className={className}>
				<MultiSelectValue placeholder={placeholder} options={options} />
			</MultiSelectTrigger>
			<MultiSelectContent>
				{options.map((option) => (
					<MultiSelectItem key={option.value} value={option.value}>
						{option.label}
					</MultiSelectItem>
				))}
			</MultiSelectContent>
		</MultiSelect>
	);
}
