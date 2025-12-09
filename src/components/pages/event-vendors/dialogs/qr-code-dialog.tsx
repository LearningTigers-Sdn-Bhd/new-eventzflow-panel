"use client";

import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Check, Copy, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventVendor } from "@/lib/api/event-vendor";

interface QrCodeDialogProps {
	vendor: EventVendor;
}

export default function QrCodeDialog({ vendor }: QrCodeDialogProps) {
	const qrRef = useRef<HTMLDivElement>(null);
	const [copied, setCopied] = useState(false);

	const handleDownload = () => {
		if (!vendor.qr_url || !qrRef.current) return;

		try {
			const svg = qrRef.current.querySelector("svg");
			if (!svg) return;

			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const size = 512;
			canvas.width = size;
			canvas.height = size;

			const svgData = new XMLSerializer().serializeToString(svg);
			const svgBlob = new Blob([svgData], {
				type: "image/svg+xml;charset=utf-8",
			});
			const url = URL.createObjectURL(svgBlob);

			const img = new Image();
			img.onload = () => {
				ctx.fillStyle = "white";
				ctx.fillRect(0, 0, size, size);
				ctx.drawImage(img, 0, 0, size, size);

				canvas.toBlob((blob) => {
					if (!blob) return;
					const downloadUrl = URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = downloadUrl;
					link.download = `vendor-qr-${vendor.vendor.full_name.replace(/\s+/g, "-").toLowerCase()}.png`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(downloadUrl);
				});

				URL.revokeObjectURL(url);
			};
			img.src = url;
		} catch (error) {
			console.error("Failed to download QR code:", error);
		}
	};

	const handleCopyUrl = () => {
		if (!vendor.qr_url) return;
		navigator.clipboard.writeText(vendor.qr_url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (!vendor.qr_url) {
		return (
			<div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
				<p className="font-medium text-sm">No QR code URL configured</p>
				<p className="text-muted-foreground text-xs">
					Add a QR URL in the vendor form to generate a QR code.
				</p>
			</div>
		);
	}

	return (
		<div className="w-full space-y-4">
			{/* Header / Vendor Info */}
			<div className="space-y-1 text-center">
				<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
					Vendor QR Code
				</p>
				<div className="flex flex-col items-center gap-1">
					<h3 className="font-semibold text-base leading-tight">
						{vendor.vendor.full_name}
					</h3>
					<p className="text-muted-foreground text-xs">{vendor.vendor.email}</p>
					<Badge variant="outline" className="mt-1 px-2 py-0.5 text-[10px] uppercase">
						{vendor.type}
					</Badge>
				</div>
			</div>

			{/* QR Code Section */}
			<div className="flex flex-col items-center gap-3">
				<div
					ref={qrRef}
					className="inline-block rounded-xl border-4 border-primary bg-white p-4 shadow-sm"
				>
					<QRCode
						value={vendor.qr_url}
						size={220}
						level="H"
						style={{ height: "auto", maxWidth: "100%", width: "100%" }}
					/>
				</div>

				{/* URL + Actions */}
				<div className="w-full space-y-2">
					<div className="rounded-md bg-muted px-3 py-2 text-center">
						<p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
							Destination URL
						</p>
						<p className="break-all text-[11px] text-muted-foreground">
							{vendor.qr_url}
						</p>
					</div>

					<div className="flex flex-col gap-2 sm:flex-row">
						<Button
							type="button"
							variant="outline"
							onClick={handleCopyUrl}
							className="flex-1"
							size="sm"
						>
							{copied ? (
								<>
									<Check className="mr-2 size-3.5" />
									<span className="text-xs">Copied</span>
								</>
							) : (
								<>
									<Copy className="mr-2 size-3.5" />
									<span className="p-2 text-xs">Copy URL</span>
								</>
							)}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={handleDownload}
							className="flex-1"
							size="sm"
						>
							<Download className="mr-2 size-3.5" />
							<span className="p-2 text-xs">Download QR</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Footer Note */}
			<p className="text-center text-[11px] text-muted-foreground">
				Share or print this QR so attendees can easily access the vendor link.
			</p>
		</div>
	);
}

