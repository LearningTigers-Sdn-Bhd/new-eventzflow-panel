"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import type { PassBundle } from "@/lib/api/pass-bundle";

interface PassBundleQRModalProps {
	bundle: PassBundle;
}

export default function PassBundleQRModal({ bundle }: PassBundleQRModalProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(bundle.bundleLink);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleDownload = () => {
		const svgElement = document.getElementById("pass-bundle-qr-code");
		if (!svgElement) return;

		const svgData = new XMLSerializer().serializeToString(svgElement);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();

		img.onload = () => {
			const qrSize = 420;
			const padding = 46;
			const labelHeight = 60;
			const canvasWidth = qrSize + padding * 2;
			const canvasHeight = qrSize + padding * 2 + labelHeight;

			canvas.width = canvasWidth;
			canvas.height = canvasHeight;

			if (ctx) {
				ctx.fillStyle = "white";
				ctx.fillRect(0, 0, canvasWidth, canvasHeight);

				// Draw bundle owner name above the QR code
				ctx.fillStyle = "#000000";
				ctx.font = "bold 28px sans-serif";
				ctx.textAlign = "center";
				ctx.fillText(bundle.name, canvasWidth / 2, padding + labelHeight / 2);

				ctx.drawImage(img, padding, padding + labelHeight, qrSize, qrSize);
			}

			const pngFile = canvas.toDataURL("image/png");
			const downloadLink = document.createElement("a");
			downloadLink.download = `pass-bundle-${bundle.token}.png`;
			downloadLink.href = pngFile;
			downloadLink.click();
		};

		const svgBlob = new Blob([svgData], {
			type: "image/svg+xml;charset=utf-8",
		});
		const url = URL.createObjectURL(svgBlob);
		img.src = url;
	};

	return (
		<div className="space-y-4 py-2">
			<div className="flex flex-col items-center gap-3">
				<p className="font-semibold text-base">{bundle.name}</p>
				<div className="rounded-none border border-dashed bg-white p-4">
					<QRCode
						id="pass-bundle-qr-code"
						value={bundle.bundleLink}
						size={260}
						level="H"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<p className="font-medium text-sm">Bundle Link</p>
				<p className="break-all rounded-none border bg-muted/40 px-3 py-2 font-mono text-xs">
					{bundle.bundleLink}
				</p>
			</div>

			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				<Button
					type="button"
					variant="outline"
					className="rounded-none"
					onClick={handleCopy}
				>
					{copied ? (
						<>
							<Check className="mr-2 h-4 w-4" />
							Copied
						</>
					) : (
						<>
							<Copy className="mr-2 h-4 w-4" />
							Copy Link
						</>
					)}
				</Button>
				<Button type="button" className="rounded-none" onClick={handleDownload}>
					<Download className="mr-2 h-4 w-4" />
					Download QR
				</Button>
			</div>
		</div>
	);
}
