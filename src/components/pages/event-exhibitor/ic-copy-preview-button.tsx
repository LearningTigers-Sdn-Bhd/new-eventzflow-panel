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
import {
	downloadExhibitorKitCustomsDeclaration,
	downloadExhibitorKitCustomsDutyEstimate,
	downloadExhibitorKitIcCopy,
} from "@/lib/api/exhibitor-kit";

const DOCUMENT_LABELS = {
	"ic-copy": "IC Copy",
	"customs-declaration": "Customs Declaration",
	"customs-duty-estimate": "Customs Duty Estimate",
} as const;

const DOCUMENT_DOWNLOADERS = {
	"ic-copy": downloadExhibitorKitIcCopy,
	"customs-declaration": downloadExhibitorKitCustomsDeclaration,
	"customs-duty-estimate": downloadExhibitorKitCustomsDutyEstimate,
} as const;

export function IcCopyPreviewButton({
	eventId,
	kitId,
	available,
	document = "ic-copy",
	boothNumber,
}: {
	eventId: number;
	kitId: number;
	available?: boolean;
	document?: "ic-copy" | "customs-declaration" | "customs-duty-estimate";
	boothNumber?: string | null;
}) {
	const [preview, setPreview] = useState<{ url: string; type: string } | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const label = DOCUMENT_LABELS[document];
	if (!available)
		return <span className="text-muted-foreground text-xs">Not uploaded</span>;
	const open = async () => {
		setLoading(true);
		try {
			const { blob } = await DOCUMENT_DOWNLOADERS[document](eventId, kitId);
			setPreview({ url: URL.createObjectURL(blob), type: blob.type });
		} finally {
			setLoading(false);
		}
	};
	const close = () => {
		if (preview) URL.revokeObjectURL(preview.url);
		setPreview(null);
	};
	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="h-7 rounded-none px-2 text-xs"
				disabled={loading}
				onClick={open}
			>
				<Download className="size-3.5" />
				{loading ? "Loading..." : "Preview"}
			</Button>
			<Dialog
				open={Boolean(preview)}
				onOpenChange={(value) => !value && close()}
			>
				<DialogContent className="max-w-4xl rounded-none p-0">
					<DialogHeader className="border-b p-4 text-left">
						<DialogTitle>{label} Preview</DialogTitle>
					</DialogHeader>
					<div className="flex max-h-[68vh] min-h-64 items-center justify-center overflow-auto bg-muted/30 p-4">
						{preview?.type === "application/pdf" ? (
							<iframe
								src={preview.url}
								title={label}
								className="h-[62vh] w-full border-0"
							/>
						) : preview?.type.startsWith("image/") ? (
							<object
								data={preview.url}
								type={preview.type}
								aria-label={`Uploaded ${label}`}
								className="h-auto max-h-[62vh] max-w-full object-contain"
							/>
						) : preview ? (
							<div className="max-w-sm text-center">
								<p className="text-sm">
									This file type can't be previewed here.
									{boothNumber
										? ` Download the ${label.toLowerCase()} for booth ${boothNumber} to view it.`
										: ` Download the ${label.toLowerCase()} to view it.`}
								</p>
							</div>
						) : null}
					</div>
					<DialogFooter className="border-t p-4">
						<Button variant="outline" className="rounded-none" onClick={close}>
							Close
						</Button>
						{preview && (
							<a
								href={preview.url}
								download={`${document}${boothNumber ? `-${boothNumber}` : ""}`}
								className="inline-flex h-9 items-center justify-center bg-primary px-4 font-medium text-primary-foreground text-sm"
							>
								Download {label}
							</a>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
