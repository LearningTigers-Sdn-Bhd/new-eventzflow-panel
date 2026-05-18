"use client";

import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface MultiURLInputProps {
	label: string;
	value: string; // Comma-separated string
	onChange: (value: string) => void;
	onBlur?: () => void;
	errors?: Array<{ message?: string } | undefined>;
	isInvalid?: boolean;
	placeholder?: string;
	description?: string;
	disabled?: boolean;
	required?: boolean;
}

export function MultiURLInput({
	label,
	value,
	onChange,
	onBlur,
	errors,
	isInvalid = false,
	placeholder = "https://example.com/webhook",
	description,
	disabled,
	required,
}: MultiURLInputProps) {
	// Parse the comma-separated string into an array
	const urls = React.useMemo(() => {
		if (!value) return [""];
		const splitUrls = value.split(",").map((s) => s.trim());
		return splitUrls.length > 0 ? splitUrls : [""];
	}, [value]);

	const handleUrlChange = React.useCallback(
		(index: number, newUrl: string) => {
			const newUrls = [...urls];
			newUrls[index] = newUrl;
			onChange(newUrls.join(", "));
		},
		[urls, onChange],
	);

	const addUrlField = () => {
		const newUrls = [...urls, ""];
		onChange(newUrls.join(", "));
	};

	const removeUrlField = (index: number) => {
		if (urls.length <= 1) {
			onChange("");
			return;
		}
		const newUrls = urls.filter((_, i) => i !== index);
		onChange(newUrls.join(", "));
	};

	return (
		<Field data-invalid={isInvalid} orientation="vertical" className="w-full">
			<FieldLabel>
				{label}
				{required && <span className="ml-0.5 text-destructive">*</span>}
			</FieldLabel>

			<div className="flex flex-col gap-2">
				{urls.map((url, index) => (
					<div key={`url-field-${index}`} className="flex gap-2">
						<Input
							type="url"
							placeholder={placeholder}
							value={url}
							onChange={(e) => handleUrlChange(index, e.target.value)}
							onBlur={onBlur}
							disabled={disabled}
							className="h-10 rounded-none border-input bg-background md:text-sm"
						/>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={() => removeUrlField(index)}
							disabled={disabled}
							className="h-10 w-10 shrink-0 rounded-none border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				))}

				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addUrlField}
					disabled={disabled}
					className="mt-1 w-fit rounded-none border-dashed py-5"
				>
					<Plus className="mr-2 h-4 w-4" />
					Add Webhook URL
				</Button>
			</div>

			{isInvalid ? (
				<FieldError errors={errors} />
			) : (
				description && <FieldDescription>{description}</FieldDescription>
			)}
		</Field>
	);
}
