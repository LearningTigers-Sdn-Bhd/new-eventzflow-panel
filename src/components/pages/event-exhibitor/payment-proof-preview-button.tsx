"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export function PaymentProofPreviewButton({
	url,
	className,
}: {
	url?: string | null;
	className?: string;
}) {
	const [preview, setPreview] = useState<{ url: string; type: string } | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const open = async () => {
		if (!url) return;
		setLoading(true);
		setError("");
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error();
			const blob = await response.blob();
			setPreview({ url: URL.createObjectURL(blob), type: blob.type });
		} catch {
			setError("Unable to load payment proof.");
		} finally {
			setLoading(false);
		}
	};

	const close = () => {
		if (preview) URL.revokeObjectURL(preview.url);
		setPreview(null);
	};
	if (!url)
		return <span className="text-muted-foreground text-xs">Not submitted</span>;

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				className={className ?? "rounded-none"}
				disabled={loading}
				onClick={open}
			>
				<Download className="size-4" />
				{loading ? "Loading..." : "Preview"}
			</Button>
			{error && <span className="text-destructive text-xs">{error}</span>}
			<Dialog
				open={Boolean(preview)}
				onOpenChange={(value) => !value && close()}
			>
				<DialogContent className="max-w-4xl rounded-none p-0">
					<DialogHeader className="border-b p-4 text-left">
						<DialogTitle>Payment Proof Preview</DialogTitle>
					</DialogHeader>
					<div className="flex max-h-[68vh] min-h-64 items-center justify-center overflow-auto bg-muted/30 p-4">
						{preview?.type === "application/pdf" ? (
							<iframe
								src={preview.url}
								title="Payment proof"
								className="h-[62vh] w-full border-0"
							/>
						) : preview ? (
							<object
								data={preview.url}
								type={preview.type}
								aria-label="Uploaded payment proof"
								className="max-h-[62vh] max-w-full"
							>
								<span>Preview unavailable. Use Download.</span>
							</object>
						) : null}
					</div>
					<DialogFooter className="border-t p-4 sm:justify-end">
						<Button variant="outline" className="rounded-none" onClick={close}>
							Close
						</Button>
						{preview && (
							<a
								href={preview.url}
								download="payment-proof"
								className="inline-flex h-9 items-center justify-center bg-primary px-4 font-medium text-primary-foreground text-sm"
							>
								Download
							</a>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
