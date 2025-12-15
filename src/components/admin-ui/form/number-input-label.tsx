import { cva, type VariantProps } from "class-variance-authority";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";
import { cn } from "@/lib/utils";

const numberInputLabelVariants = cva("", {
	variants: {
		variant: {
			rounded: "[&_button]:rounded-md",
			"no-rounded": "[&_button]:rounded-none",
		},
	},
	defaultVariants: {
		variant: "no-rounded",
	},
});

interface NumberInputLabelProps {
	// Label props
	label: string;
	htmlFor?: string;
	description?: string;

	// Values & handlers
	value: number;
	onChange: (value: number) => void;

	// Validation
	errors?: Array<{ message?: string } | undefined>;
	isInvalid?: boolean;

	// NumberInput props
	min?: number;
	max?: number;
	step?: number;

	// Additional props
	disabled?: boolean;
	required?: boolean;
	placeholder?: string;

	// Styling
	variant?: VariantProps<typeof numberInputLabelVariants>["variant"];
	className?: string;
	fieldClassName?: string;
}

export function NumberInputLabel({
	label,
	htmlFor,
	description,
	value,
	onChange,
	errors,
	isInvalid = false,
	min = 0,
	max = 999,
	step = 1,
	disabled,
	required,
	placeholder,
	variant = "no-rounded",
	className,
	fieldClassName,
}: NumberInputLabelProps) {
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
			<NumberInput
				value={value}
				onChange={onChange}
				min={min}
				max={max}
				step={step}
				disabled={disabled}
				placeholder={placeholder}
				className={cn(numberInputLabelVariants({ variant }), className)}
			/>
			{isInvalid ? (
				<FieldError errors={errors} />
			) : (
				description && <FieldDescription>{description}</FieldDescription>
			)}
		</Field>
	);
}
