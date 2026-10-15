"use client";

import { Pencil, X } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface TagChipInputProps {
	label: string;
	value: string[];
	onChange: (tags: string[]) => void;
	onRename?: (oldTag: string, newTag: string) => void;
	errors?: Array<{ message?: string } | undefined>;
	isInvalid?: boolean;
	placeholder?: string;
	description?: string;
	disabled?: boolean;
	required?: boolean;
}

export function TagChipInput({
	label,
	value,
	onChange,
	onRename,
	errors,
	isInvalid = false,
	placeholder = "Type a tag and press Enter",
	description,
	disabled,
	required,
}: TagChipInputProps) {
	const [draft, setDraft] = React.useState("");
	const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
	const [editingDraft, setEditingDraft] = React.useState("");

	const addTag = React.useCallback(
		(raw: string) => {
			const tag = raw.trim();
			if (!tag) return;
			const exists = value.some((t) => t.toLowerCase() === tag.toLowerCase());
			if (exists) {
				setDraft("");
				return;
			}
			onChange([...value, tag]);
			setDraft("");
		},
		[value, onChange],
	);

	const removeTag = React.useCallback(
		(index: number) => {
			onChange(value.filter((_, i) => i !== index));
		},
		[value, onChange],
	);

	const startEditing = (index: number) => {
		if (disabled) return;
		setEditingIndex(index);
		setEditingDraft(value[index]);
	};

	const commitEdit = (index: number) => {
		const oldTag = value[index];
		const newTag = editingDraft.trim();

		if (!newTag || newTag === oldTag) {
			setEditingIndex(null);
			return;
		}

		const dupeElsewhere = value.some(
			(t, i) => i !== index && t.toLowerCase() === newTag.toLowerCase(),
		);
		if (dupeElsewhere) {
			setEditingIndex(null);
			return;
		}

		const next = [...value];
		next[index] = newTag;
		onChange(next);
		onRename?.(oldTag, newTag);
		setEditingIndex(null);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addTag(draft);
			return;
		}
		if (e.key === "Backspace" && draft === "" && value.length > 0) {
			removeTag(value.length - 1);
		}
	};

	return (
		<Field data-invalid={isInvalid} orientation="vertical" className="w-full">
			<FieldLabel>
				{label}
				{required && <span className="ml-0.5 text-destructive">*</span>}
			</FieldLabel>

			<div className="flex min-h-10 flex-wrap gap-2 rounded-none border border-input bg-background p-2">
				{value.map((tag, index) =>
					editingIndex === index ? (
						<Input
							key={tag}
							autoFocus
							value={editingDraft}
							onChange={(e) => setEditingDraft(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									commitEdit(index);
								}
								if (e.key === "Escape") {
									e.preventDefault();
									setEditingIndex(null);
								}
							}}
							onBlur={() => commitEdit(index)}
							className="h-6 w-auto min-w-[100px] rounded-none px-1 py-0"
						/>
					) : (
						<Badge key={tag} variant="secondary" className="gap-1 rounded-none">
							{tag}
							{!disabled && onRename && (
								<button
									type="button"
									onClick={() => startEditing(index)}
									className="ml-0.5 rounded-full hover:bg-black/10"
									aria-label={`Rename ${tag}`}
								>
									<Pencil className="h-3 w-3" />
								</button>
							)}
							{!disabled && (
								<button
									type="button"
									onClick={() => removeTag(index)}
									className="ml-0.5 rounded-full hover:bg-black/10"
									aria-label={`Remove ${tag}`}
								>
									<X className="h-3 w-3" />
								</button>
							)}
						</Badge>
					),
				)}
				<Input
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={() => addTag(draft)}
					disabled={disabled}
					placeholder={value.length === 0 ? placeholder : ""}
					className="h-6 w-auto min-w-[120px] flex-1 border-none p-0 shadow-none focus-visible:ring-0"
				/>
			</div>

			{isInvalid ? (
				<FieldError errors={errors} />
			) : (
				description && <FieldDescription>{description}</FieldDescription>
			)}
		</Field>
	);
}
