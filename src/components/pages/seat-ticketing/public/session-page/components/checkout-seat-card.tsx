import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutSeatCardProps {
	sectionName?: string;
	sectionNameColor?: string;
	seatName: string;
	price: string;
	onRemove?: () => void;
	showRemoveButton?: boolean;
	disabled?: boolean;
	selected?: boolean;
}

export function CheckoutSeatCard({
	sectionName,
	sectionNameColor,
	seatName,
	price,
	onRemove,
	showRemoveButton = true,
	disabled = false,
	selected = false,
}: CheckoutSeatCardProps) {
	return (
		<div
			className={cn(
				"relative border bg-slate-50 p-3",
				showRemoveButton && "pr-12",
				selected && "border-brand-green/40 bg-brand-green/5",
				disabled && "opacity-60",
			)}
			aria-disabled={disabled || undefined}
		>
			{showRemoveButton && (
				<button
					type="button"
					onClick={(event) => {
						event.stopPropagation();
						onRemove?.();
					}}
					className="absolute top-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center border bg-white text-slate-500 transition hover:bg-slate-100"
					aria-label={`Remove ${seatName}`}
				>
					<XIcon className="h-4 w-4" />
				</button>
			)}

			<p className="font-bold text-[9px] text-brand-green uppercase tracking-wider md:text-[10px]">
				<span
					style={sectionNameColor ? { color: sectionNameColor } : undefined}
				>
					{sectionName}
				</span>
			</p>
			<p className="font-bold text-slate-900 text-sm md:text-base">
				{seatName}
			</p>
			<div className="flex justify-end">
				<p className="font-bold font-mono text-xs md:text-sm">{price}</p>
			</div>
		</div>
	);
}
