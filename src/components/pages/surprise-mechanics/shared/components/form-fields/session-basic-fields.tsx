"use client";

import type { FieldApi } from "@tanstack/react-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import LogoUpload from "@/components/file-upload/logo-upload";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface LogoFieldProps {
	// biome-ignore lint/suspicious/noExplicitAny: FieldApi requires generic types for form fields
	field: FieldApi<
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
	isPending?: boolean;
}

/**
 * Logo upload field component
 */
export function LogoField({ field, isPending = false }: LogoFieldProps) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field
			data-invalid={isInvalid}
			orientation="vertical"
			className="flex flex-col items-center justify-start gap-2"
		>
			<div className="relative aspect-square w-full max-w-[200px]">
				<LogoUpload
					value={
						field.state.value === null || field.state.value === undefined
							? undefined
							: (field.state.value as string | File)
					}
					onChange={(file) => {
						field.handleChange(file ?? null);
					}}
					disabled={isPending}
				/>
			</div>
			<div className="flex flex-col items-center gap-1 text-center">
				<FieldLabel htmlFor={field.name}>Session Logo</FieldLabel>
				<FieldDescription>Upload a logo for this session</FieldDescription>
			</div>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}

interface TitleFieldProps {
	// biome-ignore lint/suspicious/noExplicitAny: FieldApi requires generic types for form fields
	field: FieldApi<
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
	isPending?: boolean;
	placeholder?: string;
}

/**
 * Title input field component
 */
export function TitleField({
	field,
	isPending = false,
	placeholder = "e.g., Grand Prize Draw 2024",
}: TitleFieldProps) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field data-invalid={isInvalid} orientation="vertical">
			<FieldLabel htmlFor={field.name}>Session Title</FieldLabel>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
			<Input
				placeholder={placeholder}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				disabled={isPending}
				required
			/>
			<FieldDescription>Give your session a memorable name</FieldDescription>
		</Field>
	);
}

interface DrawDateFieldProps {
	// biome-ignore lint/suspicious/noExplicitAny: FieldApi requires generic types for form fields
	field: FieldApi<
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
	isPending?: boolean;
}

/**
 * Draw date picker field component
 */
export function DrawDateField({
	field,
	isPending = false,
}: DrawDateFieldProps) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field data-invalid={isInvalid} orientation="vertical">
			<FieldLabel htmlFor={field.name}>Draw Date</FieldLabel>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-full justify-start text-left font-normal",
							!field.state.value && "text-muted-foreground",
						)}
						disabled={isPending}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{field.state.value ? (
							format(field.state.value, "PPP")
						) : (
							<span>Pick a date</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={field.state.value || undefined}
						onSelect={(date) => field.handleChange(date || null)}
						initialFocus
						disabled={isPending}
					/>
				</PopoverContent>
			</Popover>
			<FieldDescription>When will this draw take place?</FieldDescription>
		</Field>
	);
}
