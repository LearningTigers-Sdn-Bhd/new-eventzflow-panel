"use client";

import type { FieldApi } from "@tanstack/react-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// biome-ignore lint/suspicious/noExplicitAny: FieldApi requires generic types for form fields
type AnyField = FieldApi<
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any
>;

interface OptionProps {
	field: AnyField;
	label: string;
	description: string;
	isPending?: boolean;
}

/** Full-width on/off setting row */
export function ToggleOption({
	field,
	label,
	description,
	isPending = false,
	onChange,
}: OptionProps & { onChange?: (checked: boolean) => void }) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field
			data-invalid={isInvalid}
			orientation="horizontal"
			className="justify-between gap-4 rounded-none border bg-background p-4"
		>
			<div className="min-w-0 flex-1 space-y-0.5">
				<FieldLabel htmlFor={field.name} className="text-sm">
					{label}
				</FieldLabel>
				<FieldDescription>{description}</FieldDescription>
			</div>
			<div className="flex shrink-0 items-center">
				<Switch
					id={field.name}
					checked={field.state.value as boolean}
					onCheckedChange={(checked) => {
						field.handleChange(checked);
						onChange?.(checked);
					}}
					disabled={isPending}
				/>
			</div>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}

/** Whole-number setting */
export function NumberOption({
	field,
	label,
	description,
	isPending = false,
}: OptionProps) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field data-invalid={isInvalid} orientation="vertical">
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				id={field.name}
				type="number"
				className="rounded-none"
				min={1}
				value={field.state.value as number}
				onBlur={field.handleBlur}
				onChange={(e) =>
					field.handleChange(Number.parseInt(e.target.value, 10) || 1)
				}
				disabled={isPending}
			/>
			<FieldDescription>{description}</FieldDescription>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}

/** Pick one of a fixed list of values */
export function SelectOption({
	field,
	label,
	description,
	options,
	isPending = false,
}: OptionProps & { options: { value: string; label: string }[] }) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field data-invalid={isInvalid} orientation="vertical">
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Select
				value={field.state.value as string}
				onValueChange={(value) => field.handleChange(value)}
				disabled={isPending}
			>
				<SelectTrigger className="w-full rounded-none">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<FieldDescription>{description}</FieldDescription>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}
