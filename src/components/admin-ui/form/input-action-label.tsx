import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

const inputVariants = cva(
	"w-full min-w-0 border border-input bg-transparent shadow-xs outline-none transition-[color,box-shadow] dark:bg-input/30",
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

interface InputActionLabelProps
	extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
	// Label props
	label: string;
	htmlFor?: string;

	// Styling variant
	variant?: VariantProps<typeof inputVariants>["variant"];

	// Values & handlers (supports both TanStack Form and generic usage)
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;

	// Validation
	errors?: Array<{ message?: string } | undefined>;
	isInvalid?: boolean;

	// Input props
	placeholder?: string;
	disabled?: boolean;
	autoFocus?: boolean;
	required?: boolean;

	// Action button props
	onAction?: () => void;
	actionIcon?: React.ReactNode;
	actionLabel?: string;
	actionVariant?: "default" | "secondary" | "ghost" | "destructive";
	actionSize?: "xs" | "sm" | "icon-xs" | "icon-sm";
	actionDisabled?: boolean;

	// Styling
	className?: string;
	fieldClassName?: string;
	inputGroupClassName?: string;
}

export function InputActionLabel({
	label,
	htmlFor,
	variant = "no-rounded",
	value,
	onChange,
	onBlur,
	errors,
	isInvalid = false,
	placeholder,
	disabled,
	autoFocus,
	required,
	onAction,
	actionIcon,
	actionLabel,
	actionVariant = "ghost",
	actionSize = "icon-xs",
	actionDisabled,
	className,
	fieldClassName,
	inputGroupClassName,
	...props
}: InputActionLabelProps) {
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
			<InputGroup
				className={cn(
					"py-6 md:py-2",
					inputVariants({ variant }),
					inputGroupClassName,
				)}
			>
				<InputGroupInput
					id={htmlFor}
					placeholder={placeholder}
					value={value}
					onBlur={onBlur}
					onChange={(e) => onChange(e.target.value)}
					aria-invalid={isInvalid}
					disabled={disabled}
					autoFocus={autoFocus}
					className={className}
					{...props}
				/>
				{onAction && (
					<InputGroupAddon align="inline-end">
						<InputGroupButton
							onClick={onAction}
							variant={actionVariant}
							size={actionSize}
							disabled={actionDisabled || disabled}
							aria-label={actionLabel}
							title={actionLabel}
							className={cn(
								"me-1.5 py-6 md:py-2",
								variant === "no-rounded" && "rounded-none",
							)}
						>
							{actionIcon}
						</InputGroupButton>
					</InputGroupAddon>
				)}
			</InputGroup>
			{isInvalid && <FieldError errors={errors} />}
		</Field>
	);
}
