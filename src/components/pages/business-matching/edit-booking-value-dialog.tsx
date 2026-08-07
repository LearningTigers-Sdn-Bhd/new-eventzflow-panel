"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialog } from "@/hooks/use-dialog";

interface EditBookingValueDialogProps {
	initialValue: string;
	onSave: (value: string) => Promise<void>;
}

export default function EditBookingValueDialog({
	initialValue,
	onSave,
}: EditBookingValueDialogProps) {
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
			<div className="space-y-1.5">
				<Label htmlFor="deal-value">Potential Deal Value</Label>
				<Input
					id="deal-value"
					type="number"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Value..."
					autoFocus
					disabled={isSaving}
				/>
			</div>
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
