"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { InputActionLabel } from "@/components/admin-ui/form/input-action-label";
import { cn } from "@/lib/utils";

interface SortableCustomLabelItemProps {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	onRemove: () => void;
	placeholder?: string;
	disabled?: boolean;
	htmlFor?: string;
}

export function SortableCustomLabelItem({
	id,
	label,
	value,
	onChange,
	onRemove,
	placeholder = "e.g., Company Name",
	disabled = false,
	htmlFor,
}: SortableCustomLabelItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} className="flex items-end gap-1">
			<button
				type="button"
				className={cn(
					"flex shrink-0 cursor-grab items-center justify-center rounded-none border bg-background px-1 py-6 text-muted-foreground hover:text-foreground md:py-2",
					isDragging && "cursor-grabbing",
				)}
				{...attributes}
				{...listeners}
			>
				<GripVertical className="size-4" />
			</button>
			<div className="min-w-0 flex-1">
				<InputActionLabel
					label={label}
					htmlFor={htmlFor ?? id}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					disabled={disabled}
					variant="no-rounded"
					onAction={onRemove}
					actionIcon={<Trash2 className="size-4" />}
					actionLabel="Remove field"
					actionVariant="destructive"
				/>
			</div>
		</div>
	);
}
