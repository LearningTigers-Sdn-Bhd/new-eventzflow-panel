"use client";

import React, { useMemo } from "react";
import { type DrawStyle, type DrawTheme } from "@/stores/lucky-draw-store";
import type { Participant } from "@/stores/lucky-draw-store";

// Wheel Imports (Default Export)
import WheelWireframe from "@/components/pages/lucky-draw/session/draw-styles/wheel-draw/wireframe";
import WheelColorful from "@/components/pages/lucky-draw/session/draw-styles/wheel-draw/colorful";
import WheelCartoon from "@/components/pages/lucky-draw/session/draw-styles/wheel-draw/cartoon";

// Box Imports (Named Export)
import { BoxDraw as BoxWireframe } from "@/components/pages/lucky-draw/session/draw-styles/box-draw/wireframe";
import { BoxDraw as BoxColorful } from "@/components/pages/lucky-draw/session/draw-styles/box-draw/colorful";
import { BoxDraw as BoxCartoon } from "@/components/pages/lucky-draw/session/draw-styles/box-draw/cartoon";

// Slot Imports (Named Export)
import { SlotDraw as SlotWireframe } from "@/components/pages/lucky-draw/session/draw-styles/slot-draw/wireframe";
import { SlotDraw as SlotColorful } from "@/components/pages/lucky-draw/session/draw-styles/slot-draw/colorful";
import { SlotDraw as SlotCartoon } from "@/components/pages/lucky-draw/session/draw-styles/slot-draw/cartoon";

interface DrawStylePreviewProps {
	style: DrawStyle;
	theme: DrawTheme;
}

const DUMMY_PARTICIPANTS: Participant[] = [
	{ name: "John Doe", type: "ticket", publicId: "1" },
	{ name: "Jane Smith", type: "ticket", publicId: "2" },
	{ name: "Alice Johnson", type: "ticket", publicId: "3" },
	{ name: "Bob Brown", type: "ticket", publicId: "4" },
	{ name: "Charlie Davis", type: "ticket", publicId: "5" },
	{ name: "Eve Wilson", type: "ticket", publicId: "6" },
];

export default function DrawStylePreview({ style, theme }: DrawStylePreviewProps) {
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

	return (
		<div className="flex w-full flex-col items-center justify-center rounded-lg border bg-muted/30 p-6">
			<div className="mb-6 text-center">
				<h4 className="text-sm font-medium text-foreground/80">Style Preview</h4>
				<p className="text-xs capitalize text-muted-foreground">
					{style} - {theme}
				</p>
			</div>

			<div className="relative flex aspect-square w-full items-center justify-center overflow-hidden">
				<div
					className="flex w-full origin-center justify-center transition-all duration-300"
					style={{ transform: `scale(${scale})` }}
				>
					<Component
						participants={DUMMY_PARTICIPANTS}
						onDrawComplete={() => {}}
						isDrawing={false}
					/>
				</div>
			</div>
		</div>
	);
}
