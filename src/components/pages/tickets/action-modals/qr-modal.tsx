import { Check, Copy, Download, Mail, Phone, Ticket, User } from "lucide-react";
import { useState } from "react";
import QRCodeSVG from "react-qr-code";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { BaseTicket } from "../columns";

interface TicketQRModalProps {
	ticket: BaseTicket;
	onClose?: () => void;
}

// QR Code component using react-qr-code library with enhanced design
function QRCode({ value }: { value: string }) {
	return (
		<div className="inline-block rounded-xl border-4 border-primary bg-white p-3 shadow-lg md:p-4">
			<QRCodeSVG
				value={value}
				size={200}
				level="H"
				style={{ height: "auto", maxWidth: "100%", width: "100%" }}
				fgColor="#000000"
				bgColor="#ffffff"
			/>
		</div>
	);
}

export default function TicketQRModal({ ticket }: TicketQRModalProps) {
	const qrValue = ticket.publicId; // Use the actual ticket public_id from backend
	const [copied, setCopied] = useState(false);

	const handleCopyQRValue = () => {
		navigator.clipboard.writeText(qrValue);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleDownloadQR = () => {
		const svgElement = document
			.getElementById("qr-code-svg")
			?.querySelector("svg");
		if (!svgElement) return;

		// Clone the SVG to avoid modifying the original
		const svgClone = svgElement.cloneNode(true) as SVGElement;

		// Add white background
		const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		rect.setAttribute("width", "100%");
		rect.setAttribute("height", "100%");
		rect.setAttribute("fill", "white");
		svgClone.insertBefore(rect, svgClone.firstChild);

		const svgData = new XMLSerializer().serializeToString(svgClone);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();

		img.onload = () => {
			// QR code size and padding
			const qrSize = 400;
			const padding = 60; // White space around QR code
			const totalSize = qrSize + padding * 2;

			// Set canvas size with padding
			canvas.width = totalSize;
			canvas.height = totalSize;

			if (ctx) {
				// Draw white background for entire canvas
				ctx.fillStyle = "white";
				ctx.fillRect(0, 0, totalSize, totalSize);

				// Draw QR code centered with padding
				ctx.drawImage(img, padding, padding, qrSize, qrSize);
			}

			const pngFile = canvas.toDataURL("image/png");

			const downloadLink = document.createElement("a");
			downloadLink.download = `ticket-qr-${ticket.publicId}.png`;
			downloadLink.href = pngFile;
			downloadLink.click();
		};

		img.onerror = () => {
			console.error("Failed to load QR code image");
		};

		const svgBlob = new Blob([svgData], {
			type: "image/svg+xml;charset=utf-8",
		});
		const url = URL.createObjectURL(svgBlob);
		img.src = url;
	};

	return (
		<div className="w-full space-y-3 md:space-y-4">
			{/* Header - Hidden on mobile to save space */}
			<div className="hidden text-center md:block">
				<div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
					<Ticket className="size-6 text-primary" />
				</div>
				<h2 className="font-bold text-2xl">Ticket QR Code</h2>
				<p className="mt-1 text-muted-foreground text-sm">
					Scan this code at the event entrance for quick check-in
				</p>
			</div>

			<Separator className="hidden md:block" />

			{/* Main Content - Two Columns on desktop, stacked on mobile */}
			<div className="grid gap-3 md:grid-cols-[auto_1fr] md:gap-6">
				{/* Left Column - QR Code */}
				<div className="flex flex-col items-center gap-2 md:gap-3">
					<div id="qr-code-svg">
						<QRCode value={qrValue} />
					</div>

					{/* QR Value Display */}
					<div className="w-full max-w-[240px] space-y-1.5 md:max-w-[280px] md:space-y-2">
						<div className="text-center">
							<p className="mb-1 font-medium text-muted-foreground text-xs">
								Ticket ID
							</p>
							<Badge
								variant="secondary"
								className="max-w-full truncate font-mono text-xs"
							>
								{qrValue}
							</Badge>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleCopyQRValue}
							className="w-full"
						>
							{copied ? (
								<>
									<Check className="mr-2 size-3.5" />
									<span className="text-xs">Copied!</span>
								</>
							) : (
								<>
									<Copy className="mr-2 size-3.5" />
									<span className="text-xs">Copy ID</span>
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Right Column - Ticket Information */}
				<div className="flex flex-col gap-2 md:gap-3">
					<h3 className="font-semibold text-sm md:text-base">
						Ticket Holder Information
					</h3>

					<div className="space-y-1.5 md:space-y-2">
						<div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2 md:gap-3 md:p-2.5">
							<div className="rounded-full bg-primary/10 p-1.5">
								<User className="size-3.5 text-primary md:size-4" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-muted-foreground text-xs">
									Name
								</p>
								<p className="truncate font-semibold text-xs md:text-sm">
									{ticket.name}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2 md:gap-3 md:p-2.5">
							<div className="rounded-full bg-primary/10 p-1.5">
								<Mail className="size-3.5 text-primary md:size-4" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-muted-foreground text-xs">
									Email
								</p>
								<p className="truncate font-semibold text-xs md:text-sm">
									{ticket.email}
								</p>
							</div>
						</div>

						{ticket.phone && (
							<div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2 md:gap-3 md:p-2.5">
								<div className="rounded-full bg-primary/10 p-1.5">
									<Phone className="size-3.5 text-primary md:size-4" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-muted-foreground text-xs">
										Phone
									</p>
									<p className="truncate font-semibold text-xs md:text-sm">
										{ticket.phone}
									</p>
								</div>
							</div>
						)}

						{ticket.ticketTypeName && (
							<div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2 md:gap-3 md:p-2.5">
								<div className="rounded-full bg-primary/10 p-1.5">
									<Ticket className="size-3.5 text-primary md:size-4" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-muted-foreground text-xs">
										Ticket Type
									</p>
									<p className="truncate font-semibold text-xs md:text-sm">
										{ticket.ticketTypeName}
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Status Badge */}
					<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-2 md:p-3">
						<span className="font-medium text-xs md:text-sm">Status:</span>
						<Badge
							variant={ticket.status === "scanned" ? "default" : "secondary"}
							className={cn(
								"px-2 py-0.5 text-xs md:px-3 md:py-1",
								ticket.status === "scanned"
									? "bg-green-500 text-white hover:bg-green-500"
									: "bg-blue-500 text-white hover:bg-blue-500",
							)}
						>
							{ticket.status === "scanned"
								? "✓ Checked In"
								: "⏳ Not Checked In"}
						</Badge>
					</div>

					{/* Action Button */}
					<Button
						type="button"
						variant="outline"
						onClick={handleDownloadQR}
						className="w-full"
						size="sm"
					>
						<Download className="mr-2 size-3.5 md:size-4" />
						<span className="text-xs md:text-sm">Download QR</span>
					</Button>

					{/* Footer Note - Hidden on mobile */}
					<div className="hidden rounded-lg bg-muted/50 p-2.5 text-center md:block">
						<p className="text-muted-foreground text-xs">
							💡 Save this QR code or show it at the event entrance
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
