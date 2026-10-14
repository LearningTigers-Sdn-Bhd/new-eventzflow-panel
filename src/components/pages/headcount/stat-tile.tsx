import { cn } from "@/lib/utils";
import { formatCount } from "./format";

/** Flat figure tile with a coloured left edge, same look as the RFID dashboard tiles. */
export function StatTile({
	label,
	value,
	hint,
	accent,
}: {
	label: string;
	value: number | null;
	hint: string;
	/** A `border-l-*` colour class. */
	accent: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col justify-center border border-l-4 p-3 text-left",
				accent,
			)}
		>
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="mt-1 font-bold text-2xl tabular-nums leading-none">
				{formatCount(value)}
			</p>
			<p className="mt-1.5 text-muted-foreground text-xs">{hint}</p>
		</div>
	);
}
