"use client";

import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { GiftPick } from "@/lib/api/lucky-draw/response";
import { cn } from "@/lib/utils";
import { describeDraw } from "../../draw-summary";

interface ChoiceProps {
	id: string;
	value: string;
	title: string;
	description: string;
	example?: string;
}

// One selectable card: the whole card is the click target
function Choice({ id, value, title, description, example }: ChoiceProps) {
	return (
		<Label
			htmlFor={id}
			className={cn(
				"flex cursor-pointer items-start gap-3 border bg-background p-3 font-normal transition-colors hover:bg-muted/50",
				"has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5",
				"has-disabled:cursor-not-allowed has-disabled:opacity-60",
			)}
		>
			<RadioGroupItem id={id} value={value} className="mt-0.5" />
			<span className="flex flex-col gap-1">
				<span className="font-semibold text-sm">{title}</span>
				<span className="text-balance text-muted-foreground text-sm">
					{description}
				</span>
				{example && (
					<span className="text-muted-foreground text-xs italic">
						{example}
					</span>
				)}
			</span>
		</Label>
	);
}

interface GiftDrawingSettingsProps {
	roundSweep: boolean;
	onRoundSweepChange: (value: boolean) => void;
	giftPick: GiftPick;
	onGiftPickChange: (value: GiftPick) => void;
	winnersPerDraw: number;
	disabled?: boolean;
}

/**
 * The two gift choices side by side in plain words, plus a live sentence that
 * says exactly what the next click of Draw will do.
 */
export function GiftDrawingSettings({
	roundSweep,
	onRoundSweepChange,
	giftPick,
	onGiftPickChange,
	winnersPerDraw,
	disabled,
}: GiftDrawingSettingsProps) {
	return (
		<div className="flex flex-col gap-5">
			<fieldset className="flex flex-col gap-2">
				<legend className="mb-1 font-semibold">Each click draws</legend>
				<RadioGroup
					value={roundSweep ? "round" : "gift"}
					onValueChange={(value) => onRoundSweepChange(value === "round")}
					disabled={disabled}
				>
					<Choice
						id="gift-draw-by-gift"
						value="gift"
						title="One gift at a time"
						description="Winners go to one gift until it is full, then the next click moves to the next gift. Uses Winners per draw."
						example="e.g. Phone × 3, then Voucher × 3"
					/>
					<Choice
						id="gift-draw-by-round"
						value="round"
						title="A round: one winner for every gift"
						description="Each click gives every gift that still has a slot one winner. The next click is the next round. Winners per draw is not used."
						example="e.g. Round 1: Phone, Voucher, Grand Prize"
					/>
				</RadioGroup>
			</fieldset>

			<fieldset className="flex flex-col gap-2">
				<legend className="mb-1 font-semibold">Gift order</legend>
				<RadioGroup
					value={giftPick}
					onValueChange={(value) => onGiftPickChange(value as GiftPick)}
					disabled={disabled}
				>
					<Choice
						id="gift-pick-in-order"
						value="in_order"
						title="In order"
						description="Follows your gift list, top gift first. Drag gifts in Manage Gifts to change the order."
					/>
					<Choice
						id="gift-pick-random"
						value="random"
						title="Random"
						description="Picks a random gift that still has a slot. Tick Draw last on a gift (like the grand prize) to hold it until the rest are done."
					/>
				</RadioGroup>
			</fieldset>

			<div className="flex gap-2 border border-primary/20 bg-primary/5 p-3">
				<Info className="mt-0.5 size-4 shrink-0 text-primary" />
				<div className="flex flex-col gap-0.5">
					<p className="font-semibold text-xs uppercase tracking-wide">
						What happens on each click
					</p>
					<p
						className="text-balance text-sm leading-relaxed"
						aria-live="polite"
					>
						{describeDraw({ winnersPerDraw, giftPick, roundSweep })}
					</p>
				</div>
			</div>
		</div>
	);
}
