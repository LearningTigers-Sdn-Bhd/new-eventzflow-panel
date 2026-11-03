import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GiftTakenInput({
	id,
	value,
	disabled,
	onSave,
}: {
	id: string;
	value: string;
	disabled: boolean;
	onSave: (value: string) => Promise<boolean>;
}) {
	const [draft, setDraft] = useState<string>();
	const [saving, setSaving] = useState(false);
	const [failed, setFailed] = useState(false);
	const save = async () => {
		if (draft === undefined || draft === value || saving) return;
		setSaving(true);
		const saved = await onSave(draft);
		setFailed(!saved);
		if (saved) setDraft(undefined);
		setSaving(false);
	};
	return (
		<div className="flex w-full flex-wrap items-center gap-3 text-xs">
			<Label
				htmlFor={id}
				className="shrink-0 font-normal text-muted-foreground text-xs"
			>
				Gift taken
			</Label>
			<Input
				id={id}
				list="gift-taken-options"
				value={draft ?? value}
				maxLength={500}
				disabled={disabled || saving}
				onChange={(event) => {
					setDraft(event.target.value);
					setFailed(false);
				}}
				onBlur={save}
				onKeyDown={(event) => {
					if (event.key === "Enter") {
						event.preventDefault();
						event.currentTarget.blur();
					}
				}}
				placeholder="Type the gift they collected"
				className="h-8 min-w-0 flex-1 rounded-none text-sm"
			/>
			{failed && (
				<div
					role="alert"
					className="flex w-full items-center gap-2 text-destructive"
				>
					Not saved. Your text is kept here.
					<Button
						variant="outline"
						size="sm"
						disabled={disabled || saving}
						onClick={save}
					>
						Retry
					</Button>
				</div>
			)}
		</div>
	);
}
