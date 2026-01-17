"use client";

import { useMemo } from "react";
import { BoxDraw as BoxCartoon } from "@/components/pages/surprise-mechanics/shared/draw-styles/box-draw/cartoon";
import { BoxDraw as BoxColorful } from "@/components/pages/surprise-mechanics/shared/draw-styles/box-draw/colorful";
// Box Imports (Named Export)
import { BoxDraw as BoxWireframe } from "@/components/pages/surprise-mechanics/shared/draw-styles/box-draw/wireframe";
import { SlotDraw as SlotCartoon } from "@/components/pages/surprise-mechanics/shared/draw-styles/slot-draw/cartoon";
import { SlotDraw as SlotColorful } from "@/components/pages/surprise-mechanics/shared/draw-styles/slot-draw/colorful";
// Slot Imports (Named Export)
import { SlotDraw as SlotWireframe } from "@/components/pages/surprise-mechanics/shared/draw-styles/slot-draw/wireframe";
import WheelCartoon from "@/components/pages/surprise-mechanics/shared/draw-styles/wheel-draw/cartoon";
import WheelColorful from "@/components/pages/surprise-mechanics/shared/draw-styles/wheel-draw/colorful";
// Wheel Imports (Default Export)
import WheelWireframe from "@/components/pages/surprise-mechanics/shared/draw-styles/wheel-draw/wireframe";
import type {
	DrawStyle,
	DrawTheme,
	Participant,
} from "@/stores/lucky-draw-store";

interface DrawStylePreviewProps {
	style: DrawStyle;
	theme: DrawTheme;
	drawType?: "participants" | "prizes";
}

const DUMMY_PARTICIPANTS: Participant[] = [
	{ name: "John Doe", type: "ticket", publicId: "1" },
	{ name: "Jane Smith", type: "ticket", publicId: "2" },
	{ name: "Alice Johnson", type: "ticket", publicId: "3" },
	{ name: "Bob Brown", type: "ticket", publicId: "4" },
	{ name: "Charlie Davis", type: "ticket", publicId: "5" },
	{ name: "Eve Wilson", type: "ticket", publicId: "6" },
];

const DUMMY_PRIZES = [
	{ id: 1, name: "Notebook", quantity: 1 },
	{ id: 2, name: "Glass Mug", quantity: 2 },
	{ id: 3, name: "Pen", quantity: 3 },
	{ id: 4, name: "Tote Bag", quantity: 5 },
	{ id: 5, name: "USB Drive", quantity: 1 },
	{ id: 6, name: "Keychain", quantity: 2 },
];

function transformPrizesToParticipants(
	prizes: Array<{ id: number; name: string }>,
): Participant[] {
	return prizes.map((prize) => ({
		name: prize.name,
		type: "ticket" as const,
		publicId: String(prize.id),
	}));
}

export default function DrawStylePreview({
	style,
	theme,
	drawType = "participants",
}: DrawStylePreviewProps) {
	const Component = useMemo(() => {
		switch (style) {
			case "wheel":
				if (theme === "wireframe") return WheelWireframe;
				if (theme === "colorful") return WheelColorful;
				if (theme === "cartoon") return WheelCartoon;
				break;
			case "box":
				if (theme === "wireframe") return BoxWireframe;
				if (theme === "colorful") return BoxColorful;
				if (theme === "cartoon") return BoxCartoon;
				break;
			case "slot":
				if (theme === "wireframe") return SlotWireframe;
				if (theme === "colorful") return SlotColorful;
				if (theme === "cartoon") return SlotCartoon;
				break;
		}
		return WheelWireframe;
	}, [style, theme]);

	const scale = useMemo(() => {
		// Adjust scale based on style and theme to render within the preview box
		if (style === "slot") {
			if (theme === "cartoon") return 0.4; // Cartoon slot is very large
			return 0.55; // Other slots
		}
		if (style === "box") {
			return 0.5; // Boxes are tall (approx 600px)
		}
		if (style === "wheel") {
			return 0.65; // Wheels are generally square but need breathing room
		}
		return 0.6;
	}, [style, theme]);

	const participants = useMemo(() => {
		if (drawType === "prizes") {
			return transformPrizesToParticipants(DUMMY_PRIZES);
		}
		return DUMMY_PARTICIPANTS;
	}, [drawType]);

	const previewLabel = useMemo(() => {
		return drawType === "prizes" ? "Prizes" : "Participants";
	}, [drawType]);

	return (
		<div className="flex w-full flex-col items-center justify-center rounded-lg border bg-muted/30 p-6">
			<div className="mb-6 text-center">
				<h4 className="font-medium text-foreground/80 text-sm">
					Style Preview
				</h4>
				<p className="text-muted-foreground text-xs capitalize">
					{style} - {theme} ({previewLabel.toLowerCase()})
				</p>
			</div>

			<div className="relative flex aspect-square w-full items-center justify-center overflow-hidden">
				<div
					className="flex w-full origin-center justify-center transition-all duration-300"
					style={{ transform: `scale(${scale})` }}
				>
					<Component
						participants={participants}
						onDrawComplete={() => {}}
						isDrawing={false}
					/>
				</div>
			</div>
		</div>
	);
}
