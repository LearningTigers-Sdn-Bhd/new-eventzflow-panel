"use client";

import QRCode from "react-qr-code";
import type { Voucher } from "./table/columns";

interface VoucherQRDialogProps {
	voucher: Voucher;
	onClose: () => void;
}

export default function VoucherQRDialog({
	voucher,
}: VoucherQRDialogProps) {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col items-center gap-4 py-6">
				<div className="rounded-lg border-2 border-dashed bg-white p-4">
					<QRCode value={voucher.voucherUuid} size={256} level="H" />
				</div>
				<div className="text-center">
					<h3 className="font-semibold text-lg">{voucher.title}</h3>
					<div className="mt-2 rounded-md border bg-muted px-3 py-2">
						<p className="font-mono text-sm">{voucher.voucherUuid}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
