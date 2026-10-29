"use client";

import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmailBlastAttachment } from "@/lib/api/email-blast";

export const MAX_FILES = 5;
export const MAX_TOTAL_BYTES = 5 * 1024 * 1024;
const ACCEPT =
	".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.png,.jpg,.jpeg,.gif";

const size = (bytes: number) =>
	bytes >= 1024 * 1024
		? `${(bytes / 1024 / 1024).toFixed(1)} MB`
		: `${Math.max(1, Math.round(bytes / 1024))} KB`;

type Props = {
	saved: EmailBlastAttachment[];
	pending: File[];
	onAdd: (files: File[]) => void;
	onRemoveSaved: (id: number) => void;
	onRemovePending: (index: number) => void;
	/** Reports a problem (too many / too big) without adding the files. */
	onError: (message: string) => void;
};

export function AttachmentsField({
	saved,
	pending,
	onAdd,
	onRemoveSaved,
	onRemovePending,
	onError,
}: Props) {
	const total =
		saved.reduce((sum, a) => sum + a.byte_size, 0) +
		pending.reduce((sum, f) => sum + f.size, 0);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		e.target.value = "";
		if (files.length === 0) return;
		if (saved.length + pending.length + files.length > MAX_FILES) {
			return onError(`You can attach up to ${MAX_FILES} files.`);
		}
		if (total + files.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL_BYTES) {
			return onError("Attachments must total under 5 MB.");
		}
		onAdd(files);
	};

	const rows = [
		...saved.map((a) => ({
			key: `s${a.id}`,
			name: a.filename,
			bytes: a.byte_size,
			remove: () => onRemoveSaved(a.id),
		})),
		...pending.map((f, i) => ({
			key: `p${i}${f.name}`,
			name: f.name,
			bytes: f.size,
			remove: () => onRemovePending(i),
		})),
	];

	return (
		<div className="space-y-2">
			<Label htmlFor="blast-attachments">Attachments (optional)</Label>
			<Input
				id="blast-attachments"
				type="file"
				multiple
				accept={ACCEPT}
				className="rounded-none"
				onChange={handleChange}
			/>
			<p className="text-muted-foreground text-xs">
				PDF, Word, Excel, PowerPoint, CSV or images. Up to {MAX_FILES} files, 5
				MB in total.
			</p>
			{rows.length > 0 && (
				<div className="divide-y border">
					{rows.map((row) => (
						<div key={row.key} className="flex items-center gap-2 p-2 text-sm">
							<Paperclip className="size-4 shrink-0 text-muted-foreground" />
							<span className="min-w-0 flex-1 truncate">{row.name}</span>
							<span className="shrink-0 text-muted-foreground text-xs">
								{size(row.bytes)}
							</span>
							<Button
								type="button"
								size="icon-sm"
								variant="ghost"
								className="rounded-none"
								aria-label={`Remove ${row.name}`}
								onClick={row.remove}
							>
								<X className="size-4" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
