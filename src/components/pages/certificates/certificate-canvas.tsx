"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Image as KonvaImage, Layer, Rect, Stage, Text } from "react-konva";
import type { CertificateField } from "@/lib/api/certificate";

type CertificateCanvasProps = {
	backgroundUrl: string | null;
	canvasWidth: number;
	canvasHeight: number;
	fields: CertificateField[];
	selectedFieldId: string | null;
	sampleName: string;
	/** When true, fields are not draggable or selectable (view mode). */
	readOnly?: boolean;
	onSelectField: (id: string | null) => void;
	onChangeField: (id: string, patch: Partial<CertificateField>) => void;
	/** Max pixel width the stage is allowed to occupy in the layout. */
	maxStageWidth?: number;
};

// Loads an HTMLImageElement for Konva without the `use-image` package.
function useHtmlImage(url: string | null) {
	const [image, setImage] = useState<HTMLImageElement | null>(null);

	useEffect(() => {
		if (!url) {
			setImage(null);
			return;
		}
		const img = new window.Image();
		const onLoad = () => setImage(img);
		img.addEventListener("load", onLoad);
		img.src = url;
		// If the image is already cached, the load event may have fired before
		// the listener was attached — set it immediately in that case.
		if (img.complete && img.naturalWidth > 0) {
			setImage(img);
		}
		return () => img.removeEventListener("load", onLoad);
	}, [url]);

	return image;
}

function fieldDisplayValue(
	field: CertificateField,
	sampleName: string,
): string {
	switch (field.type) {
		case "attendee_name":
			return sampleName || "Attendee Name";
		case "event_title":
			return "Event Title";
		case "date":
			return "01 January 2026";
		case "static_text":
			return field.static_value || field.label || "Static text";
		default:
			return field.label;
	}
}

function konvaAlign(
	align: CertificateField["align"],
): "left" | "center" | "right" {
	return align;
}

export function CertificateCanvas({
	backgroundUrl,
	canvasWidth,
	canvasHeight,
	fields,
	selectedFieldId,
	sampleName,
	readOnly = false,
	onSelectField,
	onChangeField,
	maxStageWidth = 900,
}: CertificateCanvasProps) {
	const bgImage = useHtmlImage(backgroundUrl);
	const stageRef = useRef<Konva.Stage>(null);

	// Scale the design canvas down to fit the available layout width.
	const scale = Math.min(1, maxStageWidth / canvasWidth);
	const stageWidth = canvasWidth * scale;
	const stageHeight = canvasHeight * scale;

	return (
		<div
			className="overflow-hidden rounded-none border bg-muted/30"
			style={{ width: stageWidth, height: stageHeight }}
		>
			<Stage
				ref={stageRef}
				width={stageWidth}
				height={stageHeight}
				scaleX={scale}
				scaleY={scale}
				onMouseDown={(e) => {
					if (readOnly) return;
					// Click on empty canvas clears selection.
					if (e.target === e.target.getStage()) {
						onSelectField(null);
					}
				}}
			>
				<Layer>
					{bgImage ? (
						<KonvaImage
							image={bgImage}
							width={canvasWidth}
							height={canvasHeight}
							listening={false}
						/>
					) : (
						<Rect
							width={canvasWidth}
							height={canvasHeight}
							fill="#ffffff"
							stroke="#e5e7eb"
							strokeWidth={2}
							listening={false}
						/>
					)}

					{fields.map((field) => {
						const isSelected = field.id === selectedFieldId;
						return (
							<Text
								key={field.id}
								text={fieldDisplayValue(field, sampleName)}
								x={field.x}
								y={field.y}
								width={field.width}
								height={field.height}
								fontSize={field.font_size}
								fontStyle={field.font_style}
								fontFamily="Helvetica"
								fill={field.color}
								align={konvaAlign(field.align)}
								verticalAlign="middle"
								draggable={!readOnly}
								listening={!readOnly}
								onClick={() => !readOnly && onSelectField(field.id)}
								onTap={() => !readOnly && onSelectField(field.id)}
								onDragEnd={(e) => {
									onChangeField(field.id, {
										x: Math.round(e.target.x()),
										y: Math.round(e.target.y()),
									});
								}}
								stroke={isSelected ? "#2563eb" : undefined}
								strokeWidth={isSelected ? 1 : 0}
							/>
						);
					})}
				</Layer>
			</Stage>
		</div>
	);
}

export default CertificateCanvas;
