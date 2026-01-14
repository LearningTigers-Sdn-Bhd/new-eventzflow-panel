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
import { ICON_OPTIONS, IconViewer } from "./icon-viewer";

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

interface IconSelectorProps {
	// Label props
	label: string;
	htmlFor?: string;
	description?: string;

	// Variant
	variant?: VariantProps<typeof selectTriggerVariants>["variant"];

	// Values & handlers
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;

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
}

export function IconSelector({
	label,
	htmlFor,
	description,
	variant = "no-rounded",
	value,
	onChange,
	onBlur,
	errors,
	isInvalid = false,
	placeholder,
	disabled,
	required,
	className,
	fieldClassName,
}: IconSelectorProps) {
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
					<SelectValue placeholder={placeholder}>
						{value && (
							<div className="flex items-center gap-2">
								<IconViewer name={value} className="size-4" />
								<span>
									{ICON_OPTIONS.find((o) => o.value === value)?.label || value}
								</span>
							</div>
						)}
					</SelectValue>
				</SelectTrigger>
				<SelectContent
					className={cn(
						"max-h-[300px] w-full",
						variant === "no-rounded" ? "rounded-none" : undefined,
					)}
				>
					{ICON_OPTIONS.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}
							className={cn(
								"py-3 md:py-2",
								variant === "no-rounded" ? "rounded-none" : undefined,
							)}
						>
							<div className="flex items-center gap-2">
								<option.icon className="size-4" />
								<span>{option.label}</span>
							</div>
						</SelectItem>
					))}
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
