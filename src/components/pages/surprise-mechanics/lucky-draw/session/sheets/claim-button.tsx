import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Marks a winner as having collected their prize; the row's name is crossed out. */
export function ClaimButton({
	claimed,
	onToggle,
	disabled,
}: {
	claimed: boolean;
	onToggle: () => void;
	disabled?: boolean;
}) {
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={onToggle}
			disabled={disabled}
			aria-pressed={claimed}
			title={claimed ? "Claimed: click to undo" : "Mark prize as claimed"}
			className={cn(
				"gap-2 rounded-none",
				claimed && "border-green-500/50 bg-green-500/10 text-green-500",
			)}
		>
			<Check className="size-4" />
			<span className="hidden text-sm md:block">
				{claimed ? "Claimed" : "Claim"}
			</span>
		</Button>
	);
}
