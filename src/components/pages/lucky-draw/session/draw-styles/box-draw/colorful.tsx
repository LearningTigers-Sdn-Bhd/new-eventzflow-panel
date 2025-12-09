"use client";

import { use3DBox } from "@/hooks/draw-styles/use-3d-box";
import type { DrawProps } from "../type";
import { ThreeDGiftBox } from "./assets/3d-gift-box";

export function BoxDraw({
	participants,
	onDrawComplete,
	isDrawing,
	isCelebrating,
}: DrawProps) {
	const { containerRef, isEmpty, lidRef, mainBoxRef } = use3DBox({
		participants,
		onDrawComplete,
		isDrawing,
		isCelebrating,
	});

	if (isEmpty) {
		return (
			<div className="flex h-96 items-center justify-center text-muted-foreground">
				No participants available
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="flex h-96 w-full flex-col items-center justify-center"
		>
			<ThreeDGiftBox lidRef={lidRef} mainBoxRef={mainBoxRef} />
		</div>
	);
}
