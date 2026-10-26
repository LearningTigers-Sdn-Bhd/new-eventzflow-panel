"use client";

import type { FieldApi } from "@tanstack/react-form";
import { useState } from "react";
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
import { cn } from "@/lib/utils";

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

/**
 * Same look as ui/Switch, without Radix's hidden form input. Inside a <form>
 * that input dispatches a click from an effect on every toggle, which makes
 * React 19 log "flushSync was called from inside a lifecycle method". These
 * forms are controlled by TanStack Form, so the hidden input is not needed.
 */
function FormSwitch({
	id,
	checked,
	onCheckedChange,
	disabled,
}: {
	id: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
}) {
	const state = checked ? "checked" : "unchecked";
	return (
		<button
			type="button"
			role="switch"
			id={id}
			aria-checked={checked}
			data-state={state}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				"peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
			)}
		>
			<span
				data-state={state}
				className="pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
			/>
		</button>
	);
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
				<FormSwitch
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
	max,
	isPending = false,
}: OptionProps & { max?: number }) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	// Keep what is typed so the box can be emptied; an empty/zero value goes to
	// the form as 0 so the min(1) rule blocks saving instead of snapping back.
	const [text, setText] = useState(String(field.state.value ?? ""));
	return (
		<Field data-invalid={isInvalid} orientation="vertical">
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				id={field.name}
				type="number"
				className="rounded-none"
				min={1}
				max={max}
				value={text}
				onBlur={field.handleBlur}
				onChange={(e) => {
					const parsed = Number.parseInt(e.target.value, 10);
					const next = Number.isNaN(parsed)
						? 0
						: Math.min(parsed, max ?? Number.POSITIVE_INFINITY);
					setText(
						Number.isNaN(parsed) || next === parsed
							? e.target.value
							: String(next),
					);
					field.handleChange(next);
				}}
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
