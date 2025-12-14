"use client";

import { Download } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import type { Visitor } from "@/lib/api/visitor";

interface VisitorQRModalProps {
	visitor: Visitor;
}

export default function VisitorQRModal({ visitor }: VisitorQRModalProps) {
	const handleDownload = () => {
		// Create a canvas to render the QR code
		const svg = document.getElementById("visitor-qr-code");
		if (!svg) return;

		const svgData = new XMLSerializer().serializeToString(svg);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();

		canvas.width = 512;
		canvas.height = 512;

		img.onload = () => {
			ctx?.drawImage(img, 0, 0);
			const url = canvas.toDataURL("image/png");
			const link = document.createElement("a");
			link.download = `visitor-${visitor.public_id}.png`;
			link.href = url;
			link.click();
		};

		img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
	};

	return (
		<div className="flex flex-col items-center space-y-6 py-4">
			<div className="rounded-lg border bg-white p-6">
				<QRCode id="visitor-qr-code" value={visitor.public_id} size={256} />
			</div>
			<div className="text-center">
				<p className="font-semibold text-lg">{visitor.full_name}</p>
				<p className="text-muted-foreground text-sm">{visitor.public_id}</p>
				{visitor.phone && (
					<p className="text-muted-foreground text-sm">{visitor.phone}</p>
				)}
			</div>
			<Button onClick={handleDownload} variant="outline" className="w-full">
				<Download className="mr-2 h-4 w-4" />
				Download QR Code
			</Button>
		</div>
	);
}
