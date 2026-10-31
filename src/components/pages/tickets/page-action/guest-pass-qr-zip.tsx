"use client";

import { zipSync } from "fflate";
import { renderToStaticMarkup } from "react-dom/server";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { getEventTickets } from "@/lib/api/ticket";

// Guest passes are named "<label> Pax i/N" by the backend (create_guest_passes).
const GUEST_PASS_NAME = /^(.+) Pax (\d+)\/(\d+)$/;

const QR_SIZE = 600;
const CAPTION_HEIGHT = 110;

async function qrPng(value: string, caption: string): Promise<string> {
	const svg = renderToStaticMarkup(
		<QRCode value={value} size={QR_SIZE} level="M" />,
	);
	const img = new Image();
	img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
	await img.decode();

	const canvas = document.createElement("canvas");
	canvas.width = QR_SIZE;
	canvas.height = QR_SIZE + CAPTION_HEIGHT;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas not supported");
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(img, 0, 0, QR_SIZE, QR_SIZE);
	ctx.fillStyle = "#000";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	// Shrink long company names so the caption always fits.
	let fontSize = 44;
	do {
		ctx.font = `600 ${fontSize}px sans-serif`;
		fontSize -= 2;
	} while (ctx.measureText(caption).width > QR_SIZE - 40 && fontSize > 16);
	ctx.fillText(caption, QR_SIZE / 2, QR_SIZE + CAPTION_HEIGHT / 2 - 10);

	return canvas.toDataURL("image/png");
}

const safeName = (s: string) => s.replace(/[\\/:*?"<>|]+/g, "-").trim();

/** Downloads a ZIP with one PDF per company; each page is one pass QR captioned "Company 1/6". */
export async function downloadGuestPassQrZip(eventId: string) {
	const run = async () => {
		const tickets = await getEventTickets(eventId);
		// One PDF per company, one page per pass (QR + "Company 1/6" caption).
		const byCompany = new Map<
			string,
			{ n: number; i: number; png: string }[]
		>();
		for (const t of tickets) {
			const m = GUEST_PASS_NAME.exec(t.name);
			if (!m) continue;
			const [, company, i, n] = m;
			const png = await qrPng(t.publicId, `${company} ${i}/${n}`);
			const pages = byCompany.get(company) ?? [];
			pages.push({ n: Number(n), i: Number(i), png });
			byCompany.set(company, pages);
		}
		if (!byCompany.size) {
			throw new Error("No guest passes found for this event");
		}
		const { pdf, Document, Page, Image, StyleSheet } = await import(
			"@react-pdf/renderer"
		);
		const styles = StyleSheet.create({
			page: { alignItems: "center", justifyContent: "center" },
			img: { width: 400 },
		});
		const files: Record<string, Uint8Array> = {};
		for (const [company, pages] of byCompany) {
			pages.sort((a, b) => a.i - b.i);
			const blob = await pdf(
				<Document title={company}>
					{pages.map((p) => (
						<Page key={p.i} size="A4" style={styles.page}>
							<Image src={p.png} style={styles.img} />
						</Page>
					))}
				</Document>,
			).toBlob();
			files[`${safeName(company)}.pdf`] = new Uint8Array(
				await blob.arrayBuffer(),
			);
		}
		const count = byCompany.size;
		const blob = new Blob([zipSync(files, { level: 0 }).slice()], {
			type: "application/zip",
		});
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `guest-pass-qr-event-${eventId}.zip`;
		a.click();
		URL.revokeObjectURL(a.href);
		return count;
	};
	toast.promise(run(), {
		loading: "Building guest pass QR PDFs…",
		success: (count) => `Downloaded ${count} company PDFs`,
		error: (e) => (e instanceof Error ? e.message : "Download failed"),
	});
}
