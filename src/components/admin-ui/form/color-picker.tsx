"use client";

import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export const COLOR_OPTIONS = [
	{ name: "red", hex: "#dc2626" }, // red-600
	{ name: "orange", hex: "#ea580c" }, // orange-600
	{ name: "amber", hex: "#d97706" }, // amber-600
	{ name: "yellow", hex: "#ca8a04" }, // yellow-600
	{ name: "lime", hex: "#65a30d" }, // lime-600
	{ name: "green", hex: "#16a34a" }, // green-600
	{ name: "emerald", hex: "#059669" }, // emerald-600
	{ name: "teal", hex: "#0d9488" }, // teal-600
	{ name: "cyan", hex: "#0891b2" }, // cyan-600
	{ name: "sky", hex: "#0284c7" }, // sky-600
	{ name: "blue", hex: "#2563eb" }, // blue-600
	{ name: "indigo", hex: "#4f46e5" }, // indigo-600
	{ name: "violet", hex: "#7c3aed" }, // violet-600
	{ name: "purple", hex: "#9333ea" }, // purple-600
	{ name: "fuchsia", hex: "#c026d3" }, // fuchsia-600
	{ name: "pink", hex: "#db2777" }, // pink-600
	{ name: "rose", hex: "#e11d48" }, // rose-600
	{ name: "gray", hex: "#d1d5db" }, // gray-300
	{ name: "slate", hex: "#cbd5e1" }, // slate-300
	{ name: "stone", hex: "#d6d3d1" }, // stone-300
	{ name: "neutral", hex: "#d4d4d4" }, // neutral-300
	{ name: "zinc", hex: "#d4d4d8" }, // zinc-300
];

interface ColorPickerProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	description?: string;
	errors?: Array<{ message?: string } | undefined>;
	isInvalid?: boolean;
	required?: boolean;
	fieldClassName?: string;
}

export function ColorPicker({
	label,
	value,
	onChange,
	description,
	errors,
	isInvalid = false,
	required,
	fieldClassName,
}: ColorPickerProps) {
	return (
		<Field
			data-invalid={isInvalid}
			orientation="vertical"
			className={fieldClassName}
		>
			<FieldLabel>
				{label}
				{required && <span className="ml-0.5 text-destructive">*</span>}
			</FieldLabel>
			<div className="flex flex-wrap gap-2 pt-1">
				{COLOR_OPTIONS.map((color) => (
					<button
						key={color.name}
						type="button"
						onClick={() => onChange(color.name)}
						className={cn(
							"h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
							value === color.name
								? "border-primary ring-2 ring-primary ring-offset-1"
								: "border-transparent",
						)}
						style={{ backgroundColor: color.hex }}
						title={color.name}
					/>
				))}
			</div>
			{isInvalid ? (
				<FieldError errors={errors} />
			) : (
				description && <FieldDescription>{description}</FieldDescription>
			)}
		</Field>
	);
}
