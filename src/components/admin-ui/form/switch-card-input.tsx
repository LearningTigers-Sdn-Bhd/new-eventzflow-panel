import { cva, type VariantProps } from "class-variance-authority";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const switchCardVariants = cva("", {
	variants: {
		variant: {
			rounded: "rounded-lg",
			"no-rounded": "rounded-none",
		},
		border: {
			true: "border p-4",
			false: "",
		},
	},
	defaultVariants: {
		variant: "rounded",
		border: true,
	},
});

interface SwitchCardInputProps extends VariantProps<typeof switchCardVariants> {
	// Label and description
	label: string;
	description?: string;
	htmlFor?: string;

	// Orientation
	orientation?: "horizontal" | "vertical";

	// Values & handlers (TanStack Form compatible)
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	onBlur?: () => void;

	// Validation
	errors?: Array<{ message?: string } | undefined>;
	isInvalid?: boolean;

	// Additional props
	disabled?: boolean;
	required?: boolean;

	// Styling
	className?: string;
	fieldClassName?: string;
}

export function SwitchCardInput({
	label,
	description,
	htmlFor,
	orientation = "horizontal",
	variant = "rounded",
	border = true,
	checked,
	onCheckedChange,
	onBlur,
	errors,
	isInvalid = false,
	disabled,
	required,
	className,
	fieldClassName,
}: SwitchCardInputProps) {
	// Remove any existing asterisk from the label if present
	const cleanLabel = label.replace(/\s*\*\s*$/, "").trim();
	const showRequiredIndicator = required;

	// Generate a unique ID if not provided
	const switchId =
		htmlFor || `switch-${Math.random().toString(36).substr(2, 9)}`;

	return (
		<label
			htmlFor={switchId}
			className={cn(
				switchCardVariants({ variant, border }),
				"block",
				!disabled && "cursor-pointer",
				disabled && "cursor-not-allowed opacity-50",
			)}
		>
			<Field
				data-invalid={isInvalid}
				orientation={orientation}
				className={cn(className || fieldClassName)}
			>
				<FieldContent>
					<FieldLabel asChild>
						<span>
							{cleanLabel}
							{showRequiredIndicator && (
								<span className="ml-0.5 text-destructive">*</span>
							)}
						</span>
					</FieldLabel>
					{description && <FieldDescription>{description}</FieldDescription>}
				</FieldContent>
				<Switch
					id={switchId}
					checked={checked}
					onCheckedChange={onCheckedChange}
					onBlur={onBlur}
					disabled={disabled}
					className={cn(
						"data-[state=checked]:bg-green-400 data-[state=unchecked]:bg-red-400",
						variant === "no-rounded"
							? 'rounded-none! **:data-[slot="switch-thumb"]:rounded-none!'
							: undefined,
					)}
				/>
				{isInvalid && <FieldError errors={errors} />}
			</Field>
		</label>
	);
}
