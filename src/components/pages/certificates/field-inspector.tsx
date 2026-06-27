"use client";

import { MousePointerClick } from "lucide-react";
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
				<div className="space-y-1">
					<Label className="text-xs">X</Label>
					<Input
						className="rounded-none"
						type="number"
						value={field.x}
						onChange={(e) => onChange(field.id, { x: Number(e.target.value) })}
					/>
				</div>
				<div className="space-y-1">
					<Label className="text-xs">Y</Label>
					<Input
						className="rounded-none"
						type="number"
						value={field.y}
						onChange={(e) => onChange(field.id, { y: Number(e.target.value) })}
					/>
				</div>
				<div className="space-y-1">
					<Label className="text-xs">Width</Label>
					<Input
						className="rounded-none"
						type="number"
						value={field.width}
						onChange={(e) =>
							onChange(field.id, { width: Number(e.target.value) })
						}
					/>
				</div>
				<div className="space-y-1">
					<Label className="text-xs">Height</Label>
					<Input
						className="rounded-none"
						type="number"
						value={field.height}
						onChange={(e) =>
							onChange(field.id, { height: Number(e.target.value) })
						}
					/>
				</div>
				<div className="space-y-1">
					<Label className="text-xs">Font size</Label>
					<Input
						className="rounded-none"
						type="number"
						value={field.font_size}
						onChange={(e) =>
							onChange(field.id, { font_size: Number(e.target.value) })
						}
					/>
				</div>
				<div className="space-y-1">
					<Label className="text-xs">Color</Label>
					<Input
						className="rounded-none"
						type="color"
						value={field.color}
						onChange={(e) => onChange(field.id, { color: e.target.value })}
					/>
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
						<SelectTrigger className="rounded-none">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
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
						<SelectTrigger className="rounded-none">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
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
