import { cva, type VariantProps } from "class-variance-authority";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
	FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const radioGroupCardVariants = cva("", {
	variants: {
		variant: {
			rounded:
				"[&_[data-slot=field-label]]:!rounded-md [&_[data-slot=radio-group-item]]:!rounded-full [&_[data-slot=radio-group-item]]:!border [&_[data-slot=radio-group-item]]:!border-foreground/90",
			"no-rounded":
				"[&_[data-slot=field-label]]:!rounded-none [&_[data-slot=radio-group-item]]:!rounded-none [&_[data-slot=radio-group-item]]:!border [&_[data-slot=radio-group-item]]:!border-foreground/90 [&_[data-slot=radio-group-indicator]]:!inset-0 [&_[data-slot=radio-group-indicator]]:!m-auto [&_[data-slot=radio-group-indicator]]:!size-2 [&_[data-slot=radio-group-indicator]]:!rounded-none [&_[data-slot=radio-group-indicator]]:!bg-primary [&_[data-slot=radio-group-indicator]_svg]:!hidden",
		},
	},
	defaultVariants: {
		variant: "no-rounded",
	},
});

export interface RadioGroupCardOption<T extends string> {
	value: T;
	label: string;
	description?: string;
	disabled?: boolean;
}

interface RadioGroupCardProps<T extends string> {
	// Label props
	label?: string;
	description?: string;

	// Options
	options: RadioGroupCardOption<T>[];

	// Values & handlers (supports both TanStack Form and generic usage)
	value: T;
	onChange: (value: T) => void;
	onBlur?: () => void;

	// Validation
	errors?: Array<{ message?: string } | undefined>;
	isInvalid?: boolean;

	// Additional props
	disabled?: boolean;
	required?: boolean;
	variant?: VariantProps<typeof radioGroupCardVariants>["variant"];

	// Styling
	className?: string;
	fieldClassName?: string;
	fieldGroupClassName?: string;
}

export function RadioGroupCard<T extends string>({
	label,
	description,
	options,
	value,
	onChange,
	onBlur,
	errors,
	isInvalid = false,
	disabled,
	required,
	variant = "no-rounded",
	className,
	fieldClassName,
	fieldGroupClassName,
}: RadioGroupCardProps<T>) {
	// Remove any existing asterisk from the label if present
	const cleanLabel = label?.replace(/\s*\*\s*$/, "").trim();
	const showRequiredIndicator = required && cleanLabel;

	// Generate unique IDs for each option
	const generateId = (optionValue: string) => {
		return `${optionValue}-${Math.random().toString(36).substring(2, 9)}`;
	};

	return (
		<FieldGroup className={fieldGroupClassName}>
			<FieldSet className={fieldClassName}>
				{cleanLabel && (
					<FieldLegend variant="label">
						{cleanLabel}
						{showRequiredIndicator && (
							<span className="ml-0.5 text-destructive">*</span>
						)}
					</FieldLegend>
				)}
				{description && <FieldDescription>{description}</FieldDescription>}
				<RadioGroup
					value={value}
					onValueChange={onChange}
					onBlur={onBlur}
					disabled={disabled}
					aria-invalid={isInvalid}
					className={cn(radioGroupCardVariants({ variant }), className)}
				>
					{options.map((option) => {
						const optionId = generateId(option.value);
						return (
							<FieldLabel key={option.value} htmlFor={optionId}>
								<Field orientation="horizontal">
									<FieldContent>
										<FieldTitle>{option.label}</FieldTitle>
										{option.description && (
											<FieldDescription>{option.description}</FieldDescription>
										)}
									</FieldContent>
									<RadioGroupItem
										value={option.value}
										id={optionId}
										disabled={disabled || option.disabled}
									/>
								</Field>
							</FieldLabel>
						);
					})}
				</RadioGroup>
				{isInvalid && <FieldError errors={errors} />}
			</FieldSet>
		</FieldGroup>
	);
}
