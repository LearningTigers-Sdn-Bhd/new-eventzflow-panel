import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { FieldSectionLabel } from "./field-section-label";

interface FormGroupContainerProps {
	children: React.ReactNode;
	title: {
		icon: LucideIcon | IconType;
		label: string;
		description: string;
	};
	actions?: React.ReactNode;
	orientation?: "horizontal" | "vertical";
}

export function FormGroupContainer({
	children,
	title: { icon: Icon, label, description },
	actions,
	orientation = "vertical",
}: FormGroupContainerProps) {
	return (
		<div className="flex h-full w-full flex-col divide-y border">
			<div className="flex min-h-18 w-full items-center gap-2 p-3">
				<div className="hidden items-center gap-2 p-2 md:flex">
					<Icon className="size-5 md:size-6" />
				</div>
				<FieldSectionLabel label={label} description={description} />
				{actions && <div className="ml-auto shrink-0">{actions}</div>}
			</div>
			<div className="flex h-full w-full flex-1 flex-col justify-start gap-2 p-3">
				<FieldGroup
					className={cn(
						"flex h-full pb-4",
						orientation === "horizontal" ? "flex-row" : "flex-col",
					)}
				>
					{children}
				</FieldGroup>
			</div>
		</div>
	);
}
