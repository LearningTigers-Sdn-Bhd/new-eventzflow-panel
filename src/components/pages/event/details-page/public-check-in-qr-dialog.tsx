"use client";

import { Check, Copy, Download } from "lucide-react";
import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";

interface PublicCheckInQrDialogProps {
	eventTitle: string;
	slug: string;
}

export default function PublicCheckInQrDialog({
	eventTitle,
	slug,
}: PublicCheckInQrDialogProps) {
	const qrRef = useRef<HTMLDivElement>(null);
	const [copied, setCopied] = useState(false);

	const checkInUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/events/${slug}/check-in`
			: `/events/${slug}/check-in`;

	const handleDownload = () => {
		if (!qrRef.current) return;

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
					link.download = `check-in-qr-${slug}.png`;
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
		navigator.clipboard.writeText(checkInUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="w-full space-y-4">
			{/* Event Title */}
			<div className="mt-6 text-center">
				<h3 className="font-semibold text-base leading-tight">{eventTitle}</h3>
			</div>

			{/* QR Code Section */}
			<div className="flex flex-col items-center gap-3">
				<div
					ref={qrRef}
					className="inline-block rounded-xl border-4 border-primary bg-white p-4 shadow-sm"
				>
					<QRCode
						value={checkInUrl}
						size={220}
						level="H"
						style={{ height: "auto", maxWidth: "100%", width: "100%" }}
					/>
				</div>

				{/* URL + Actions */}
				<div className="w-full space-y-2">
					<div className="rounded-md bg-muted px-3 py-2 text-center">
						<p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
							Check-In URL
						</p>
						<p className="break-all text-[11px] text-muted-foreground">
							{checkInUrl}
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
									<span className="text-xs">Copy URL</span>
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
							<span className="text-xs">Download QR</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Footer Note */}
			<p className="text-center text-[11px] text-muted-foreground">
				Share or print this QR code so attendees can self check-in to the event.
			</p>
		</div>
	);
}
