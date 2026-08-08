"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDialog } from "@/hooks/use-dialog";

interface EditBookingCommentDialogProps {
	initialValue: string;
	onSave: (value: string) => Promise<void>;
}

export default function EditBookingCommentDialog({
	initialValue,
	onSave,
}: EditBookingCommentDialogProps) {
	const { goBack } = useDialog();
	const [value, setValue] = useState(initialValue);
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await onSave(value);
			goBack();
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-3">
			<Textarea
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Add a comment..."
				className="min-h-[140px]"
				autoFocus
				disabled={isSaving}
			/>
			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={goBack} disabled={isSaving}>
					Cancel
				</Button>
				<Button onClick={handleSave} disabled={isSaving}>
					{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Save
				</Button>
			</div>
		</div>
	);
}
