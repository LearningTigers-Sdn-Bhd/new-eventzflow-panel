import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const inputVariants = cva(
	"h-9 w-full min-w-0 border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
	{
		variants: {
			variant: {
				rounded: "rounded-md",
				"no-rounded": "rounded-none",
			},
		},
		defaultVariants: {
			variant: "no-rounded",
		},
	},
);

const textareaVariants = cva(
	"field-sizing-content flex min-h-16 w-full border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
	{
		variants: {
			variant: {
				rounded: "rounded-md",
				"no-rounded": "rounded-none",
			},
		},
		defaultVariants: {
			variant: "no-rounded",
		},
	},
);

interface InputLabelProps
	extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> {
	// Label props
	label: string;
	htmlFor?: string;

	// Input type
	type?: "input" | "textarea";
	variant?: VariantProps<typeof inputVariants>["variant"];

	// Values & handlers (supports both TanStack Form and generic usage)
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;

	// Validation
	errors?: Array<{ message?: string } | undefined>;
	isInvalid?: boolean;

	// Additional props
	placeholder?: string;
	disabled?: boolean;
	autoFocus?: boolean;
	rows?: number; // For textarea
	required?: boolean;

	// Styling
	className?: string;
	fieldClassName?: string;
}

export function InputLabel({
	label,
	htmlFor,
	type = "input",
	variant = "no-rounded",
	value,
	onChange,
	onBlur,
	errors,
	isInvalid = false,
	placeholder,
	disabled,
	autoFocus,
	rows = 3,
	required,
	className,
	fieldClassName,
	...props
}: InputLabelProps) {
	// Remove any existing asterisk from the label if present
	const cleanLabel = label.replace(/\s*\*\s*$/, "").trim();
	const showRequiredIndicator = required;

	return (
		<Field
			data-invalid={isInvalid}
			orientation="vertical"
			className={fieldClassName}
		>
			<FieldLabel htmlFor={htmlFor}>
				{cleanLabel}
				{showRequiredIndicator && (
					<span className="ml-0.5 text-destructive">*</span>
				)}
			</FieldLabel>
			{type === "textarea" ? (
				<Textarea
					id={htmlFor}
					placeholder={placeholder}
					value={value}
					onBlur={onBlur}
					onChange={(e) => onChange(e.target.value)}
					aria-invalid={isInvalid}
					disabled={disabled}
					rows={rows}
					className={cn(textareaVariants({ variant }), className)}
					{...(props as React.ComponentProps<"textarea">)}
				/>
			) : (
				<Input
					id={htmlFor}
					placeholder={placeholder}
					value={value}
					onBlur={onBlur}
					onChange={(e) => onChange(e.target.value)}
					aria-invalid={isInvalid}
					disabled={disabled}
					autoFocus={autoFocus}
					className={cn(
						"py-6! md:py-2!",
						inputVariants({ variant }),
						className,
					)}
					{...props}
				/>
			)}
			{isInvalid && <FieldError errors={errors} />}
		</Field>
	);
}
