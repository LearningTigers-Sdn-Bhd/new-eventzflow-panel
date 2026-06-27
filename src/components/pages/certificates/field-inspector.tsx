"use client";

import { MousePointerClick } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { CertificateField } from "@/lib/api/certificate";

type FieldInspectorProps = {
	field: CertificateField | null;
	hasFields: boolean;
	onChange: (id: string, patch: Partial<CertificateField>) => void;
	onRemove: (id: string) => void;
};

// Common font sizes offered as quick picks; the field still accepts any typed value.
const FONT_SIZE_PRESETS = [
	12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 90, 100, 110, 120,
	130,
];

// Solid colors for the swatch dropdown.
const COLOR_OPTIONS = [
	{ label: "Black", value: "#000000" },
	{ label: "Charcoal", value: "#374151" },
	{ label: "Gray", value: "#6B7280" },
	{ label: "White", value: "#FFFFFF" },
	{ label: "Navy", value: "#1E3A8A" },
	{ label: "Blue", value: "#2563EB" },
	{ label: "Teal", value: "#0F766E" },
	{ label: "Green", value: "#047857" },
	{ label: "Gold", value: "#B45309" },
	{ label: "Maroon", value: "#7F1D1D" },
	{ label: "Red", value: "#DC2626" },
];

// Text input for whole-number values that can be cleared while typing (no
// number-spinner, no stuck "0", no leading-zero "08"). Commits a number to the
// parent only when the buffer is a valid number; reverts an empty buffer on blur.
function NumberField({
	label,
	value,
	onCommit,
	listId,
}: {
	label: string;
	value: number;
	onCommit: (n: number) => void;
	listId?: string;
}) {
	const [text, setText] = useState(String(value));

	// Keep the buffer in sync when the value changes externally (e.g. dragging
	// the field on the canvas).
	useEffect(() => {
		setText(String(value));
	}, [value]);

	return (
		<div className="space-y-1">
			<Label className="text-xs">{label}</Label>
			<Input
				className="h-9 w-full rounded-none"
				type="text"
				inputMode="numeric"
				list={listId}
				value={text}
				onChange={(e) => {
					let raw = e.target.value;
					if (raw !== "") {
						if (!/^\d+$/.test(raw)) return; // digits only
						raw = raw.replace(/^0+(?=\d)/, ""); // strip leading zeros
					}
					setText(raw);
					if (raw !== "") onCommit(Number(raw));
				}}
				onBlur={() => {
					if (text === "") setText(String(value));
				}}
			/>
		</div>
	);
}

export function FieldInspector({
	field,
	hasFields,
	onChange,
	onRemove,
}: FieldInspectorProps) {
	if (!field) {
		return (
			<div className="space-y-2 border border-dashed p-6 text-center">
				<MousePointerClick className="mx-auto size-6 text-muted-foreground" />
				<p className="font-medium text-sm">Field editor</p>
				<p className="text-muted-foreground text-xs">
					{hasFields
						? "Click a field on the certificate to change its text, font, size, and color."
						: "Use \u201cAdd field\u201d to place text on the certificate, then click it here to edit."}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4 border p-4">
			<div className="flex items-center justify-between">
				<h4 className="font-medium text-sm">Editing: {field.label}</h4>
				<Button
					variant="ghost"
					size="sm"
					className="rounded-none text-destructive"
					onClick={() => onRemove(field.id)}
				>
					Remove
				</Button>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<NumberField
					label="X"
					value={field.x}
					onCommit={(n) => onChange(field.id, { x: n })}
				/>
				<NumberField
					label="Y"
					value={field.y}
					onCommit={(n) => onChange(field.id, { y: n })}
				/>
				<NumberField
					label="Width"
					value={field.width}
					onCommit={(n) => onChange(field.id, { width: n })}
				/>
				<NumberField
					label="Height"
					value={field.height}
					onCommit={(n) => onChange(field.id, { height: n })}
				/>
				<NumberField
					label="Font size"
					value={field.font_size}
					onCommit={(n) => onChange(field.id, { font_size: n })}
					listId="certificate-font-sizes"
				/>
				<datalist id="certificate-font-sizes">
					{FONT_SIZE_PRESETS.map((size) => (
						<option key={size} value={size} />
					))}
				</datalist>
				<div className="space-y-1">
					<Label className="text-xs">Color</Label>
					<Select
						value={field.color}
						onValueChange={(v) => onChange(field.id, { color: v })}
					>
						<SelectTrigger className="h-9 w-full rounded-none">
							<span className="flex items-center gap-2">
								<span
									className="size-4 border"
									style={{ backgroundColor: field.color }}
								/>
								<SelectValue placeholder="Select color" />
							</span>
						</SelectTrigger>
						<SelectContent className="rounded-none">
							{COLOR_OPTIONS.map((c) => (
								<SelectItem key={c.value} value={c.value}>
									<span className="flex items-center gap-2">
										<span
											className="size-4 border"
											style={{ backgroundColor: c.value }}
										/>
										{c.label}
									</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1">
					<Label className="text-xs">Style</Label>
					<Select
						value={field.font_style}
						onValueChange={(v) =>
							onChange(field.id, {
								font_style: v as CertificateField["font_style"],
							})
						}
					>
						<SelectTrigger className="h-9 w-full rounded-none">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							<SelectItem value="normal">Normal</SelectItem>
							<SelectItem value="bold">Bold</SelectItem>
							<SelectItem value="italic">Italic</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1">
					<Label className="text-xs">Align</Label>
					<Select
						value={field.align}
						onValueChange={(v) =>
							onChange(field.id, {
								align: v as CertificateField["align"],
							})
						}
					>
						<SelectTrigger className="h-9 w-full rounded-none">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							<SelectItem value="left">Left</SelectItem>
							<SelectItem value="center">Center</SelectItem>
							<SelectItem value="right">Right</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{field.type === "static_text" && (
				<div className="space-y-1">
					<Label className="text-xs">Static text</Label>
					<Input
						className="h-9 w-full rounded-none"
						value={field.static_value ?? ""}
						onChange={(e) =>
							onChange(field.id, { static_value: e.target.value })
						}
					/>
				</div>
			)}
		</div>
	);
}

export default FieldInspector;
