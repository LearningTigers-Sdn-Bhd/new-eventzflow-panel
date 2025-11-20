"use client";

import { ScanQrCode } from "lucide-react";

export default function VoucherRedemptionPage() {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8">
			<ScanQrCode className="h-16 w-16 text-muted-foreground" />
			<h2 className="text-2xl font-semibold">Scan Voucher / Redeem Voucher</h2>
			<p className="text-center text-muted-foreground">
				This page will allow vendors to scan and redeem vouchers.
				<br />
				Coming soon...
			</p>
		</div>
	);
}
