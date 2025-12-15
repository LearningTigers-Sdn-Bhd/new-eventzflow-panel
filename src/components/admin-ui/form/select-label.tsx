import { cva, type VariantProps } from "class-variance-authority";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const selectTriggerVariants = cva(
	"flex w-fit items-center justify-between gap-2 whitespace-nowrap border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[size=default]:h-9 data-[size=sm]:h-8 data-[placeholder]:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
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

interface SelectLabelProps {
	// Label props
	label: string;
	htmlFor?: string;
	description?: string; // Optional description - renders as FieldDescription when valid

	// Variant
	variant?: VariantProps<typeof selectTriggerVariants>["variant"];

	// Values & handlers
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;

	// Options
	options: Array<{ value: string; label: string }>;

	// Validation
	errors?: Array<{ message?: string } | undefined>;
	isInvalid?: boolean;

	// Additional props
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;

	// Styling
	className?: string;
	fieldClassName?: string;

	// Empty state
	emptyMessage?: string; // Message to show when options array is empty
}

export function SelectLabel({
	label,
	htmlFor,
	description,
	variant = "no-rounded",
	value,
	onChange,
	onBlur,
	options,
	errors,
	isInvalid = false,
	placeholder,
	disabled,
	required,
	className,
	fieldClassName,
	emptyMessage,
}: SelectLabelProps) {
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
			<Select value={value} onValueChange={onChange} disabled={disabled}>
				<SelectTrigger
					id={htmlFor}
					className={cn(
						selectTriggerVariants({ variant }),
						"w-full py-6 md:py-2",
						className,
					)}
					onBlur={onBlur}
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent
					className={cn(
						"w-full",
						variant === "no-rounded" ? "rounded-none" : undefined,
					)}
				>
					{options.length === 0 ? (
						<div className="px-2 py-1.5 text-muted-foreground text-sm">
							{emptyMessage || "No options available"}
						</div>
					) : (
						options.map((option) => (
							<SelectItem
								key={option.value}
								value={option.value}
								className={cn(
									"py-3 md:py-2",
									variant === "no-rounded" ? "rounded-none" : undefined,
								)}
							>
								{option.label}
							</SelectItem>
						))
					)}
				</SelectContent>
			</Select>
			{isInvalid ? (
				<FieldError errors={errors} />
			) : (
				description && <FieldDescription>{description}</FieldDescription>
			)}
		</Field>
	);
}
