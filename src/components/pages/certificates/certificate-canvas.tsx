"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import {
	Circle,
	Group,
	Image as KonvaImage,
	Layer,
	Rect,
	Stage,
	Text,
} from "react-konva";
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
	/** Shows a small "x" on the selected field's top-right corner to remove it. */
	onRemoveField?: (id: string) => void;
};

// Tracks the available width of a container element so the canvas can scale to
// fit it responsively (instead of assuming a fixed width that may overflow on
// smaller screens like a MacBook Air).
function useContainerWidth() {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const update = () => setWidth(el.clientWidth);
		update();
		const observer = new ResizeObserver(update);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return { ref, width };
}

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
		case "company_name":
			return sampleName || "Company Name";
		case "booth_count":
			return "3";
		case "booth_numbers":
			return "A01, A02, A03";
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
	onRemoveField,
}: CertificateCanvasProps) {
	// Live position of the field being dragged, so the selection box and the
	// remove button follow it before the drop commits the new position.
	const [dragPos, setDragPos] = useState<{
		id: string;
		x: number;
		y: number;
	} | null>(null);
	const bgImage = useHtmlImage(backgroundUrl);
	const stageRef = useRef<Konva.Stage>(null);
	const { ref: containerRef, width: containerWidth } = useContainerWidth();

	// Scale the design canvas to fit the measured container width; never upscale
	// beyond 1:1. Before the first measurement, render nothing (the container
	// still mounts so it can be measured) to avoid a huge first paint that blows
	// out the layout on smaller screens.
	const measured = containerWidth > 0;
	const scale = measured ? Math.min(1, containerWidth / canvasWidth) : 0;
	const stageWidth = canvasWidth * scale;
	const stageHeight = canvasHeight * scale;
	// Keep the remove button the same size on screen whatever the canvas scale.
	const removeRadius = scale > 0 ? 11 / scale : 11;
	const selectedField = fields.find((f) => f.id === selectedFieldId);
	const selectedPos =
		selectedField && dragPos?.id === selectedField.id
			? dragPos
			: selectedField && { x: selectedField.x, y: selectedField.y };

	return (
		<div ref={containerRef} className="w-full">
			{measured && (
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
										onDragMove={(e) =>
											setDragPos({
												id: field.id,
												x: e.target.x(),
												y: e.target.y(),
											})
										}
										onDragEnd={(e) => {
											setDragPos(null);
											onChangeField(field.id, {
												x: Math.round(e.target.x()),
												y: Math.round(e.target.y()),
											});
										}}
									/>
								);
							})}
							{!readOnly && onRemoveField && selectedField && selectedPos && (
								<>
									<Rect
										x={selectedPos.x}
										y={selectedPos.y}
										width={selectedField.width}
										height={selectedField.height}
										stroke="#2563eb"
										strokeWidth={1.5 / scale}
										dash={[6 / scale, 4 / scale]}
										listening={false}
									/>
									<Group
										x={selectedPos.x + selectedField.width}
										y={selectedPos.y}
										onClick={(e) => {
											e.cancelBubble = true;
											onRemoveField(selectedField.id);
										}}
										onTap={(e) => {
											e.cancelBubble = true;
											onRemoveField(selectedField.id);
										}}
										onMouseEnter={(e) => {
											const c = e.target.getStage()?.container();
											if (c) c.style.cursor = "pointer";
										}}
										onMouseLeave={(e) => {
											const c = e.target.getStage()?.container();
											if (c) c.style.cursor = "default";
										}}
									>
										<Circle
											radius={removeRadius}
											fill="#dc2626"
											stroke="#ffffff"
											strokeWidth={removeRadius / 8}
										/>
										<Text
											text="×"
											fontSize={removeRadius * 1.8}
											fontStyle="bold"
											fill="#ffffff"
											width={removeRadius * 2}
											height={removeRadius * 2}
											offsetX={removeRadius}
											offsetY={removeRadius}
											align="center"
											verticalAlign="middle"
											listening={false}
										/>
									</Group>
								</>
							)}
						</Layer>
					</Stage>
				</div>
			)}
		</div>
	);
}

export default CertificateCanvas;
