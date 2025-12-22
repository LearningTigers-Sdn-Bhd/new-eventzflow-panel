import {
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface FieldSectionLabelProps {
	label: string;
	description?: string;
	className?: string;
}

export function FieldSectionLabel({
	label,
	description,
	className,
}: FieldSectionLabelProps) {
	return (
		<FieldContent className={cn("flex flex-none flex-col gap-1", className)}>
			<FieldLabel>{label}</FieldLabel>
			{description && (
				<FieldDescription className="text-balance">
					{description}
				</FieldDescription>
			)}
		</FieldContent>
	);
}
