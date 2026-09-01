"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createTypedObjectUrl } from "@/lib/utils/file-type";

/**
 * Source of the file to preview. Provide exactly one:
 * - `fetcher`: authenticated download returning a Blob (e.g. restClient.getBlob).
 * - `url`: a directly fetchable URL (same-origin or CORS-enabled).
 */
export type FilePreviewSource =
	| { fetcher: () => Promise<Blob> }
	| { url: string };

type Preview = { url: string; type: string };

async function resolveBlob(source: FilePreviewSource): Promise<Blob> {
	if ("fetcher" in source) {
		return source.fetcher();
	}
	const response = await fetch(source.url);
	if (!response.ok) {
		throw new Error(`Failed to fetch file (${response.status})`);
	}
	return response.blob();
}

/** Fetch + sniff the source into a typed object URL, revoking it on cleanup. */
function useTypedPreview(source: FilePreviewSource | null, enabled: boolean) {
	const [preview, setPreview] = useState<Preview | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!enabled || !source) {
			return;
		}
		let cancelled = false;
		let objectUrl: string | null = null;
		setLoading(true);
		setError(null);
		setPreview(null);
		resolveBlob(source)
			.then((blob) => createTypedObjectUrl(blob))
			.then((typed) => {
				if (cancelled) {
					URL.revokeObjectURL(typed.url);
					return;
				}
				objectUrl = typed.url;
				setPreview(typed);
			})
			.catch(() => {
				if (!cancelled) {
					setError("Unable to load the file. Please try again.");
				}
			})
			.finally(() => {
				if (!cancelled) {
					setLoading(false);
				}
			});
		return () => {
			cancelled = true;
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [enabled, source]);

	return { preview, loading, error };
}

/**
 * CSP-safe renderer for a resolved preview: PDF in an `<iframe>`, image in an
 * `<img>` — both allowed by the app CSP (`frame-src blob:`, `img-src blob:`),
 * unlike `<object>`/`<embed>` which are blocked by `object-src 'none'`.
 */
function PreviewContent({
	preview,
	loading,
	error,
	title,
	className,
}: {
	preview: Preview | null;
	loading: boolean;
	error: string | null;
	title: string;
	className?: string;
}) {
	if (loading) {
		return <p className="text-muted-foreground text-sm">Loading preview…</p>;
	}
	if (error) {
		return <p className="text-destructive text-sm">{error}</p>;
	}
	if (preview?.type === "application/pdf") {
		return (
			<iframe
				src={preview.url}
				title={title}
				className={cn("h-full min-h-96 w-full border-0", className)}
			/>
		);
	}
	if (preview?.type.startsWith("image/")) {
		// <img> is allowed by img-src 'blob:' and not subject to object-src 'none'.
		// A blob URL can't be optimized by next/image, so a plain img is correct.
		return (
			// biome-ignore lint/performance/noImgElement: blob preview URL, not optimizable by next/image
			<img
				src={preview.url}
				alt={title}
				className={cn("h-auto max-h-full max-w-full object-contain", className)}
			/>
		);
	}
	if (preview) {
		return (
			<p className="max-w-sm text-center text-sm">
				This file type can't be previewed here. Use Download to view it.
			</p>
		);
	}
	return null;
}

interface InlineFilePreviewProps {
	source: FilePreviewSource | null;
	/** Accessible label / iframe title. */
	title: string;
	className?: string;
}

/**
 * Inline (non-dialog) CSP-safe file preview that loads and renders immediately.
 * The blob type is sniffed from the file bytes (not the served Content-Type) so
 * previews work even when the server returns a generic attachment type.
 */
export function InlineFilePreview({
	source,
	title,
	className,
}: InlineFilePreviewProps) {
	const { preview, loading, error } = useTypedPreview(source, !!source);
	return (
		<div
			className={cn(
				"flex items-center justify-center overflow-auto",
				className,
			)}
		>
			<PreviewContent
				preview={preview}
				loading={loading}
				error={error}
				title={title}
			/>
		</div>
	);
}

interface FilePreviewDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Dialog heading, e.g. "IC Copy Preview". */
	title: string;
	source: FilePreviewSource | null;
	/** Filename used for the Download button (no extension handling). */
	downloadName?: string;
}

/**
 * Canonical, CSP-safe file preview dialog. Shares the same fetch/sniff/render
 * path as InlineFilePreview. Object URLs are revoked on close.
 */
export function FilePreviewDialog({
	open,
	onOpenChange,
	title,
	source,
	downloadName = "download",
}: FilePreviewDialogProps) {
	const { preview, loading, error } = useTypedPreview(source, open && !!source);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl rounded-none p-0">
				<DialogHeader className="border-b p-4 text-left">
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="flex max-h-[68vh] min-h-64 items-center justify-center overflow-auto bg-muted/30 p-4">
					<PreviewContent
						preview={preview}
						loading={loading}
						error={error}
						title={title}
						className="h-[62vh]"
					/>
				</div>
				<DialogFooter className="border-t p-4 sm:justify-end">
					<Button
						variant="outline"
						className="rounded-none"
						onClick={() => onOpenChange(false)}
					>
						Close
					</Button>
					{preview && (
						<a
							href={preview.url}
							download={downloadName}
							className="inline-flex h-9 items-center justify-center gap-2 rounded-none bg-primary px-4 font-medium text-primary-foreground text-sm"
						>
							<Download className="size-4" />
							Download
						</a>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
