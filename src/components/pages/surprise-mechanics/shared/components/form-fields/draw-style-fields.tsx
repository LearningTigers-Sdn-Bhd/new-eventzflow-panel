"use client";

import type { FieldApi } from "@tanstack/react-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import DrawStylePreview from "../../draw-style-preview";
import type { DrawStyle, DrawTheme } from "../../types";

interface DrawStyleFieldProps {
	// biome-ignore lint/suspicious/noExplicitAny: FieldApi requires generic types for form fields
	field: FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>;
	isPending?: boolean;
}

/**
 * Draw style selector field component (wheel/slot/box)
 */
export function DrawStyleField({
	field,
	isPending = false,
}: DrawStyleFieldProps) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field data-invalid={isInvalid} className="flex flex-col border p-4">
			<div className="mb-2 space-y-0.5">
				<FieldLabel htmlFor={field.name}>Draw Style</FieldLabel>
				<FieldDescription>Choose how winners are visualized</FieldDescription>
			</div>
			<div className="flex items-center">
				<Select
					value={field.state.value}
					onValueChange={(value) => {
						field.handleChange(value as DrawStyle);
					}}
					disabled={isPending}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select style" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="wheel">🎡 Wheel</SelectItem>
						<SelectItem value="slot">🎰 Slot Machine</SelectItem>
						<SelectItem value="box">📦 Box</SelectItem>
					</SelectContent>
				</Select>
			</div>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}

interface DrawThemeFieldProps {
	// biome-ignore lint/suspicious/noExplicitAny: FieldApi requires generic types for form fields
	field: FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>;
	isPending?: boolean;
}

/**
 * Draw theme selector field component (wireframe/colorful/cartoon)
 */
export function DrawThemeField({
	field,
	isPending = false,
}: DrawThemeFieldProps) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field data-invalid={isInvalid} className="flex flex-col border p-4">
			<div className="mb-2 space-y-0.5">
				<FieldLabel htmlFor={field.name}>Draw Theme</FieldLabel>
				<FieldDescription>Visual style for the draw interface</FieldDescription>
			</div>
			<div className="flex items-center">
				<Select
					value={field.state.value}
					onValueChange={(value) => {
						field.handleChange(value as DrawTheme);
					}}
					disabled={isPending}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select theme" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="wireframe">Wireframe</SelectItem>
						<SelectItem value="colorful">Colorful</SelectItem>
						<SelectItem value="cartoon">Cartoon</SelectItem>
					</SelectContent>
				</Select>
			</div>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}

interface DrawStylePreviewProps {
	drawStyle: DrawStyle;
	drawTheme: DrawTheme;
	drawType?: "prizes" | "participants";
}

/**
 * Draw style preview component wrapper
 */
export function DrawStylePreviewWrapper({
	drawStyle,
	drawTheme,
	drawType,
}: DrawStylePreviewProps) {
	return (
		<div className="w-full rounded-lg border bg-muted/10 p-4">
			<DrawStylePreview
				style={drawStyle}
				theme={drawTheme}
				drawType={drawType}
			/>
		</div>
	);
}
