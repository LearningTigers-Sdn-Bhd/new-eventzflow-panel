"use client";

import QRCode from "react-qr-code";
import { TicketDownloadButton } from "./TicketDownloadButton";

interface RegistrationTicketSummaryProps {
	eventSlug: string;
	email: string;
	publicIds: string[];
	ticketPublicId: string | null;
	isPendingApproval: boolean;
}

export function RegistrationTicketSummary({
	eventSlug,
	email,
	publicIds,
	ticketPublicId,
	isPendingApproval,
}: RegistrationTicketSummaryProps) {
	return (
		<div className="rounded-2xl border border-brand-green/20 bg-brand-green/[0.02] p-4 text-center sm:p-6">
			{!isPendingApproval && ticketPublicId && (
				<>
					<p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">
						Your Ticket QR
					</p>
					<div className="mx-auto mt-3 w-fit rounded-xl bg-white p-3 shadow-sm">
						<QRCode
							value={ticketPublicId}
							role="img"
							aria-label={`Ticket QR code for ${ticketPublicId}`}
							size={180}
							level="H"
							className="h-auto w-full max-w-[180px]"
						/>
					</div>
					<p className="mx-auto mt-4 max-w-xl text-slate-500 text-sm">
						Your ticket is ready! Download your Ticket PDF below to keep it
						handy. For group registrations, all attendee QR codes are included
						in the PDF.
					</p>
				</>
			)}

			<p
				className={`${isPendingApproval ? "mt-0" : "mt-6"} text-slate-500 text-sm`}
			>
				A confirmation email has been sent to <br />
				<span className="font-semibold text-slate-900">{email}</span>
			</p>

			{!isPendingApproval && (
				<div className="mt-8 border-slate-100 border-t pt-6">
					<TicketDownloadButton eventSlug={eventSlug} publicIds={publicIds} />
				</div>
			)}
		</div>
	);
}
