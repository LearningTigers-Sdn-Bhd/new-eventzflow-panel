"use client";

import { Minus, Plus } from "lucide-react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NumberInputProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	className?: string;
	placeholder?: string;
}

export function NumberInput({
	value,
	onChange,
	min = 0,
	max = 999,
	step = 1,
	disabled = false,
	className,
	placeholder = "0",
}: NumberInputProps) {
	const handleIncrement = () => {
		const newValue = value + step;
		if (newValue <= max) {
			onChange(newValue);
		}
	};

	const handleDecrement = () => {
		const newValue = value - step;
		if (newValue >= min) {
			onChange(newValue);
		}
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const inputValue = Number.parseInt(e.target.value, 10);
		if (!Number.isNaN(inputValue)) {
			const clampedValue = Math.min(Math.max(inputValue, min), max);
			onChange(clampedValue);
		} else if (e.target.value === "") {
			onChange(min);
		}
	};

	const isIncrementDisabled = disabled || value >= max;
	const isDecrementDisabled = disabled || value <= min;

	return (
		<ButtonGroup className={cn("w-full", className)}>
			<Button
				type="button"
				variant="outline"
				size="icon"
				onClick={handleDecrement}
				disabled={isDecrementDisabled}
				className="shrink-0"
			>
				<Minus className="size-4" />
			</Button>
			<Input
				type="number"
				value={value}
				onChange={handleInputChange}
				min={min}
				max={max}
				step={step}
				disabled={disabled}
				placeholder={placeholder}
				className="rounded-none border-x-0 text-center [-moz-appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
			/>
			<Button
				type="button"
				variant="outline"
				size="icon"
				onClick={handleIncrement}
				disabled={isIncrementDisabled}
				className="shrink-0"
			>
				<Plus className="size-4" />
			</Button>
		</ButtonGroup>
	);
}
