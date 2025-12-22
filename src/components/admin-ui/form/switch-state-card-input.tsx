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

// Switch State Card Input Concept, if switch is for boolean or checked state or maybe 2 states involvement, for visual, we can add item state in array config, then change when clicked on the switch it will changing the design and label of card based on the state item

const cardVariants = cva("block h-full transition-colors", {
	variants: {
		variant: {
			rounded: "rounded-lg",
			"no-rounded": "rounded-none",
		},
		border: {
			true: "border p-4",
			false: "",
		},
		color: {
			green: "border-green-500/50 bg-green-500/10",
			yellow: "border-yellow-500/50 bg-yellow-500/10",
			amber: "border-amber-500/50 bg-amber-500/10",
			red: "border-red-500/50 bg-red-500/10",
			cyan: "border-cyan-500/50 bg-cyan-500/10",
			rose: "border-rose-500/50 bg-rose-500/10",
		},
	},
	defaultVariants: {
		variant: "rounded",
		border: true,
	},
});

const labelVariants = cva("", {
	variants: {
		color: {
			green: "text-green-500",
			yellow: "text-yellow-500",
			amber: "text-amber-500",
			red: "text-red-500",
			cyan: "text-cyan-500",
			rose: "text-rose-500",
		},
	},
});

const descriptionVariants = cva("text-balance", {
	variants: {
		color: {
			green: "text-green-800",
			yellow: "text-yellow-800",
			amber: "text-amber-800",
			red: "text-red-800",
			cyan: "text-cyan-800",
			rose: "text-rose-800",
		},
	},
});

const switchVariants = cva("", {
	variants: {
		color: {
			green:
				"data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-green-500 hover:data-[state=checked]:bg-green-600 hover:data-[state=unchecked]:bg-green-600",
			yellow:
				"data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-yellow-500 hover:data-[state=checked]:bg-yellow-600 hover:data-[state=unchecked]:bg-yellow-600",
			amber:
				"data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-amber-500 hover:data-[state=checked]:bg-amber-600 hover:data-[state=unchecked]:bg-amber-600",
			red: "data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-red-500 hover:data-[state=checked]:bg-red-600 hover:data-[state=unchecked]:bg-red-600",
			cyan: "data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-cyan-500 hover:data-[state=checked]:bg-cyan-600 hover:data-[state=unchecked]:bg-cyan-600",
			rose: "data-[state=checked]:bg-rose-500 data-[state=unchecked]:bg-rose-500 hover:data-[state=checked]:bg-rose-600 hover:data-[state=unchecked]:bg-rose-600",
		},
	},
});

type StateItem = {
	label: string;
	description?: string;
	icon?: React.ReactNode;
	color?: "green" | "yellow" | "amber" | "red" | "cyan" | "rose";
};

interface SwitchStateCardInputProps extends VariantProps<typeof cardVariants> {
	// State configuration
	states: {
		checked: StateItem;
		unchecked: StateItem;
	};
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

export function SwitchStateCardInput({
	states,
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
}: SwitchStateCardInputProps) {
	const currentState = checked ? states.checked : states.unchecked;
	const color = currentState.color;

	// Remove any existing asterisk from the label if present
	const cleanLabel = currentState.label.replace(/\s*\*\s*$/, "").trim();
	const showRequiredIndicator = required;

	// Generate a unique ID if not provided
	const switchId =
		htmlFor || `switch-${Math.random().toString(36).substr(2, 9)}`;

	return (
		<label
			htmlFor={switchId}
			className={cn(
				cardVariants({ variant, border, color }),
				!disabled && "cursor-pointer",
				disabled && "cursor-not-allowed opacity-50",
			)}
		>
			<Field
				data-invalid={isInvalid}
				orientation={orientation}
				className={cn("h-full", className || fieldClassName)}
			>
				<FieldContent className="h-full">
					<FieldLabel asChild>
						<span className={cn(labelVariants({ color }))}>
							{cleanLabel}
							{showRequiredIndicator && (
								<span className="ml-0.5 text-destructive">*</span>
							)}
						</span>
					</FieldLabel>
					{currentState.description && (
						<FieldDescription className={cn(descriptionVariants({ color }))}>
							{currentState.description}
						</FieldDescription>
					)}
				</FieldContent>
				<Switch
					id={switchId}
					checked={checked}
					onCheckedChange={onCheckedChange}
					onBlur={onBlur}
					disabled={disabled}
					className={cn(
						switchVariants({ color }),
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
