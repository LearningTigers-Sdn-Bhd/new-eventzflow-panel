"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateStamp } from "@/hooks/use-visitor-stamps";
import { toast } from "sonner";
import { QrCode, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VisitorStampScannerProps {
	eventId: number;
}

// Track recent scans to prevent duplicates within 5 minutes
const DUPLICATE_SCAN_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export function VisitorStampScanner({ eventId }: VisitorStampScannerProps) {
	const [publicId, setPublicId] = useState("");
	const [eventVendorId, setEventVendorId] = useState("");
	const [recentScans, setRecentScans] = useState<Map<string, number>>(new Map());
	const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
	const createStamp = useCreateStamp();

	// Clean up old scans from tracking map periodically
	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now();
			const updatedScans = new Map(recentScans);
			
			for (const [key, timestamp] of updatedScans.entries()) {
				if (now - timestamp > DUPLICATE_SCAN_COOLDOWN) {
					updatedScans.delete(key);
				}
			}
			
			setRecentScans(updatedScans);
		}, 30000); // Check every 30 seconds

		return () => clearInterval(interval);
	}, [recentScans]);

	const handleScan = async (e: React.FormEvent) => {
		e.preventDefault();
		setDuplicateWarning(null);

		// Check for duplicate scan
		const scanKey = `${publicId}-${eventVendorId}`;
		const lastScanTime = recentScans.get(scanKey);
		const now = Date.now();

		if (lastScanTime && (now - lastScanTime) < DUPLICATE_SCAN_COOLDOWN) {
			const minutesRemaining = Math.ceil((DUPLICATE_SCAN_COOLDOWN - (now - lastScanTime)) / 60000);
			const warningMsg = `This visitor was scanned recently. Please wait ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} before scanning again.`;
			setDuplicateWarning(warningMsg);
			toast.warning(warningMsg);
			return;
		}

		try {
			await createStamp.mutateAsync({
				publicId,
				data: { event_vendor_id: Number(eventVendorId) },
			});
			toast.success("Stamp created successfully!");
			
			// Update recent scans tracking
			setRecentScans(prev => new Map(prev).set(scanKey, now));
			setPublicId("");
		} catch (error: any) {
			const errorMsg = error?.message || "Failed to create stamp";
			
			// Handle backend duplicate error
			if (errorMsg.includes("duplicate") || errorMsg.includes("already")) {
				toast.error("This visitor has already been stamped by this vendor.");
				// Update recent scans to prevent immediate retry
				setRecentScans(prev => new Map(prev).set(scanKey, now));
			} else {
				toast.error(errorMsg);
			}
		}
	};

	return (
		<div className="space-y-4">
			<div className="page-header border-y border-dashed">
				<div className="px-2 md:px-4">
					<div>
						<h3 className="font-semibold text-lg">Scan Visitor QR Code</h3>
						<p className="text-muted-foreground text-sm">
							Enter visitor ID to create a stamp
						</p>
					</div>
				</div>
			</div>

			<div className="px-2 md:px-4">
				<form onSubmit={handleScan} className="space-y-4">
					{duplicateWarning && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{duplicateWarning}</AlertDescription>
						</Alert>
					)}

					<div className="space-y-2">
						<Label htmlFor="publicId">Visitor ID</Label>
						<Input
							id="publicId"
							value={publicId}
							onChange={(e) => setPublicId(e.target.value)}
							placeholder="Enter visitor ID"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="eventVendorId">Event Vendor ID</Label>
						<Input
							id="eventVendorId"
							type="number"
							value={eventVendorId}
							onChange={(e) => setEventVendorId(e.target.value)}
							placeholder="Enter vendor ID"
							required
						/>
					</div>
					<Button type="submit" className="w-full rounded-none" disabled={createStamp.isPending}>
						<QrCode className="mr-2 h-4 w-4" />
						{createStamp.isPending ? "Creating Stamp..." : "Create Stamp"}
					</Button>

					{recentScans.size > 0 && (
						<div className="border-t pt-4">
							<p className="mb-2 font-medium text-sm">
								Recent scans ({recentScans.size})
							</p>
							<div className="max-h-[150px] space-y-1 overflow-y-auto">
								{Array.from(recentScans.entries()).map(([key, timestamp]) => (
									<p key={key} className="text-muted-foreground text-sm">
										• {key} - {new Date(timestamp).toLocaleTimeString()}
									</p>
								))}
							</div>
						</div>
					)}
				</form>
			</div>
		</div>
	);
}
