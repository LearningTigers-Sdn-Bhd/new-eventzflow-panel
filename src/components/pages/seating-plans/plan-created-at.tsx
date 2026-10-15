import { Calendar } from "lucide-react";

interface PlanCreatedAtProps {
	createdAt: string;
	variant?: "stacked" | "inline";
}

export function PlanCreatedAt({
	createdAt,
	variant = "stacked",
}: PlanCreatedAtProps) {
	const date = new Date(createdAt);

	if (variant === "inline") {
		return (
			<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
				<Calendar className="h-3.5 w-3.5 shrink-0" />
				<span>
					Created{" "}
					{date.toLocaleDateString(undefined, {
						day: "numeric",
						month: "short",
						year: "numeric",
					})}{" "}
					at{" "}
					{date.toLocaleTimeString(undefined, {
						hour: "numeric",
						minute: "2-digit",
					})}
				</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col whitespace-nowrap">
			<span className="font-medium text-sm">
				{date.toLocaleTimeString(undefined, {
					hour: "numeric",
					minute: "2-digit",
					second: "2-digit",
				})}
			</span>
			<span className="text-muted-foreground text-xs">
				{date.toLocaleDateString(undefined, {
					day: "numeric",
					month: "short",
					year: "numeric",
				})}
			</span>
		</div>
	);
}
