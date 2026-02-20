"use client";

import { useEffect, useState } from "react";
import { InputLabel } from "./input-label";

interface ArrayInputLabelProps {
	label: string;
	value: number[];
	onChange: (value: number[]) => void;
	placeholder?: string;
	description?: string;
	variant?: "rounded" | "no-rounded";
	disabled?: boolean;
}

export function ArrayInputLabel({
	label,
	value,
	onChange,
	placeholder,
	description,
	variant = "no-rounded",
	disabled,
}: ArrayInputLabelProps) {
	// Local string state to allow typing commas/spaces
	const [inputValue, setInputValue] = useState(value?.join(",") || "");

	// Sync local state when external value changes (e.g. from Save or Reset)
	useEffect(() => {
		const stringValue = value?.join(",") || "";
		// Only update if the parsed value is actually different from our typed text
		// to avoid jumping cursor while typing
		const currentlyParsed = inputValue
			.split(",")
			.map((s) => s.trim())
			.filter((s) => s !== "")
			.map((s) => Number.parseInt(s, 10));

		if (JSON.stringify(currentlyParsed) !== JSON.stringify(value)) {
			setInputValue(stringValue);
		}
	}, [value, inputValue]);

	const handleChange = (text: string) => {
		setInputValue(text);

		// Parse the string into an array of numbers
		const parts = text.split(",");
		const numbers = parts
			.map((p) => p.trim())
			.filter((p) => p !== "")
			.map((p) => Number.parseInt(p, 10));

		// Check if all parts are valid numbers (ignoring empty trailing parts while typing)
		const isValid = numbers.every((n) => !Number.isNaN(n));

		if (isValid) {
			onChange(numbers);
		}
	};

	return (
		<InputLabel
			label={label}
			value={inputValue}
			onChange={handleChange}
			placeholder={placeholder}
			description={description}
			variant={variant}
			disabled={disabled}
		/>
	);
}
