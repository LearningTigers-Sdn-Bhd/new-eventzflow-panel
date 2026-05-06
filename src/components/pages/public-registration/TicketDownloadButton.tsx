"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getPublicTicketDetails } from "@/lib/api/public-registration/endpoints";
import type { PublicTicketDetails } from "@/lib/api/public-registration/types";
import { TicketPdf } from "./TicketPdf";

interface TicketDownloadButtonProps {
	eventSlug: string;
	publicIds: string[];
}

function extractTicketDetails(payload: unknown): PublicTicketDetails | null {
	if (!payload || typeof payload !== "object") return null;

	const source = payload as {
		data?: unknown;
		ticket?: unknown;
		public_id?: unknown;
	};

	const candidate =
		source.data && typeof source.data === "object"
			? source.data
			: source.ticket && typeof source.ticket === "object"
				? source.ticket
				: source;

	if (
		typeof candidate === "object" &&
		candidate !== null &&
		"public_id" in candidate &&
		typeof (candidate as { public_id?: unknown }).public_id === "string"
	) {
		return candidate as PublicTicketDetails;
	}

	return null;
}

const PREPARE_TIMEOUT_MS = 12000;

export const TicketDownloadButton = ({
	eventSlug,
	publicIds,
}: TicketDownloadButtonProps) => {
	const [tickets, setTickets] = useState<PublicTicketDetails[]>([]);
	const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
		"idle",
	);
	const [reloadKey, setReloadKey] = useState(0);

	const normalizedPublicIds = useMemo(
		() => publicIds.filter((id) => Boolean(id?.trim())),
		[publicIds],
	);

	useEffect(() => {
		let isCancelled = false;

		if (normalizedPublicIds.length === 0) {
			setTickets([]);
			setStatus("error");
			return;
		}

		const loadTicketDetails = async () => {
			const currentReloadKey = reloadKey;
			void currentReloadKey;
			setStatus("loading");

			try {
				const timedResult = await Promise.race([
					Promise.all(
						normalizedPublicIds.map((id) =>
							getPublicTicketDetails(eventSlug, id),
						),
					),
					new Promise<never>((_, reject) =>
						setTimeout(
							() => reject(new Error("Ticket data preparation timeout.")),
							PREPARE_TIMEOUT_MS,
						),
					),
				]);

				if (isCancelled) return;

				const validTickets = timedResult
					.map((payload) => extractTicketDetails(payload))
					.filter((ticket): ticket is PublicTicketDetails =>
						Boolean(ticket?.public_id),
					);

				if (validTickets.length === 0) {
					setTickets([]);
					setStatus("error");
					toast.error("Ticket data is empty. Please try again.");
					return;
				}

				setTickets(validTickets);
				setStatus("ready");
			} catch (error) {
				if (isCancelled) return;
				setTickets([]);
				setStatus("error");
				const message =
					error instanceof Error
						? error.message
						: "Failed to prepare ticket for download.";
				toast.error(message);
				console.error(error);
			}
		};

		void loadTicketDetails();

		return () => {
			isCancelled = true;
		};
	}, [eventSlug, normalizedPublicIds, reloadKey]);

	const isLoading = status === "loading";
	const isReady = status === "ready";
	const hasError = status === "error";
	const retryPrepareTickets = () => setReloadKey((current) => current + 1);

	if (!isReady) {
		return (
			<Button
				onClick={hasError ? retryPrepareTickets : undefined}
				disabled={isLoading || normalizedPublicIds.length === 0}
				variant="outline"
				className="h-12 w-full rounded-xl border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50"
			>
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Preparing Ticket...
					</>
				) : hasError ? (
					<>
						<Download className="mr-2 h-4 w-4" />
						Retry Ticket Download
					</>
				) : (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Preparing Ticket...
					</>
				)}
			</Button>
		);
	}

	return (
		<PDFDownloadLink
			document={<TicketPdf tickets={tickets} />}
			fileName={`Ticket_${eventSlug}_${normalizedPublicIds[0]}.pdf`}
		>
			{({ loading }) => (
				<Button
					disabled={loading}
					className="h-12 w-full rounded-xl bg-brand-green font-bold text-white shadow-brand-green/20 shadow-lg hover:bg-brand-green/90"
				>
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Generating PDF...
						</>
					) : (
						<>
							<Download className="mr-2 h-4 w-4" />
							Save Ticket PDF
						</>
					)}
				</Button>
			)}
		</PDFDownloadLink>
	);
};
