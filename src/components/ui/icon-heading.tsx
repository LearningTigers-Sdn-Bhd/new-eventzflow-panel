import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconHeadingProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	className?: string;
}

export function IconHeading({
	icon: Icon,
	title,
	description,
	className,
}: IconHeadingProps) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			<div className="flex items-center gap-2 rounded-md border bg-muted p-2">
				<Icon className="size-5" />
			</div>
			<div className="flex flex-col">
				<h3 className="font-semibold text-lg">{title}</h3>
				{description && (
					<p className="text-muted-foreground text-sm">{description}</p>
				)}
			</div>
		</div>
	);
}
