"use client";

import { pdf } from "@react-pdf/renderer";
import { useCallback, useRef, useState } from "react";
import { ExhibitorAnalyticsReport } from "./exhibitor-report";
import { TicketAnalyticsReport } from "./ticket-report";
import type {
	AnalyticsReportData,
	DailyHourlyBreakdown,
	ExhibitorReportData,
	TicketReportData,
	VisitorReportData,
	VoucherReportData,
} from "./types";
import { VisitorAnalyticsReport } from "./visitor-report";
import { VoucherAnalyticsReport } from "./voucher-report";

export type ExportStatus = "idle" | "generating" | "success" | "error";

interface UseExportPdfReturn {
	exportPdf: () => Promise<void>;
	status: ExportStatus;
	error: string | null;
}

function createPdfDocument(data: AnalyticsReportData) {
	switch (data.type) {
		case "ticket":
			return <TicketAnalyticsReport data={data as TicketReportData} />;
		case "visitor":
			return <VisitorAnalyticsReport data={data as VisitorReportData} />;
		case "voucher":
			return <VoucherAnalyticsReport data={data as VoucherReportData} />;
		case "exhibitor":
			return <ExhibitorAnalyticsReport data={data as ExhibitorReportData} />;
		default:
			throw new Error("Unknown report type");
	}
}

function isMobileDevice(): boolean {
	if (typeof navigator === "undefined") return false;
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent,
	);
}

function isIOSDevice(): boolean {
	if (typeof navigator === "undefined") return false;
	return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function canUseWebShare(): boolean {
	return (
		typeof navigator !== "undefined" &&
		!!navigator.share &&
		!!navigator.canShare
	);
}

function generateFilename(data: AnalyticsReportData): string {
	const reportTypeLabel =
		data.type.charAt(0).toUpperCase() + data.type.slice(1);
	const eventName = data.event.name
		.replace(/[^a-zA-Z0-9\s]/g, "")
		.trim()
		.replace(/\s+/g, "_");
	const date = new Date().toISOString().split("T")[0];
	const dateFilter = data.metadata.dateFilterLabel || "All_Time";
	return `${eventName}_${reportTypeLabel}_Report_${dateFilter}_${date}.pdf`;
}

/**
 * Hook to export analytics data to PDF
 */
export function useExportPdf(
	data: AnalyticsReportData | null,
	_filename?: string,
): UseExportPdfReturn {
	const [status, setStatus] = useState<ExportStatus>("idle");
	const [error, setError] = useState<string | null>(null);

	// Use ref to always get the latest data, avoiding stale closure issues
	const dataRef = useRef(data);
	dataRef.current = data;

	const exportPdf = useCallback(async () => {
		const currentData = dataRef.current;

		if (!currentData) {
			setError("No data available for export");
			setStatus("error");
			return;
		}

		setStatus("generating");
		setError(null);

		try {
			const pdfDocument = createPdfDocument(currentData);
			const blob = await pdf(pdfDocument).toBlob();
			const pdfFilename = generateFilename(currentData);

			// iOS Safari: Use Web Share API for proper file download
			if (isIOSDevice() && canUseWebShare()) {
				const file = new File([blob], pdfFilename, { type: "application/pdf" });
				const shareData = { files: [file] };

				if (navigator.canShare(shareData)) {
					await navigator.share(shareData);
					setStatus("success");
					return;
				}
			}

			const url = URL.createObjectURL(blob);

			// Use download link for all devices to ensure correct filename
			const link = window.document.createElement("a");
			link.href = url;
			link.download = pdfFilename;
			window.document.body.appendChild(link);
			link.click();
			window.document.body.removeChild(link);

			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 5000);

			setStatus("success");
		} catch (err) {
			console.error("Failed to generate PDF:", err);
			setError(err instanceof Error ? err.message : "Failed to generate PDF");
			setStatus("error");
		}
	}, []);

	return { exportPdf, status, error };
}

/**
 * Helper function to prepare ticket analytics data for export
 */
export function prepareTicketReportData(
	event: { id: string; name: string; start_date: string; end_date: string },
	stats: {
		totalTickets: number;
		paidTickets: number;
		pendingTickets: number;
		totalVisitors: number;
		scannedTickets: number;
		unscannedTickets: number;
		totalRevenue: number;
		pendingRevenue: number;
	},
	timeSeries: {
		registrations?: { date: string; value: number }[];
		scans?: { date: string; value: number }[];
		revenue?: { date: string; value: number }[];
	},
	hourlyBreakdown?: {
		registrations?: DailyHourlyBreakdown[];
		scans?: DailyHourlyBreakdown[];
	},
	dateFilterLabel?: string,
): TicketReportData {
	return {
		type: "ticket",
		event: {
			id: event.id,
			name: event.name,
			startDate: event.start_date,
			endDate: event.end_date,
		},
		metadata: {
			generatedAt: new Date(),
			eventStartDate: event.start_date,
			eventEndDate: event.end_date,
			dateFilterLabel,
		},
		stats: {
			...stats,
			scanRate:
				stats.paidTickets > 0
					? (stats.scannedTickets / stats.paidTickets) * 100
					: 0,
		},
		timeSeries: {
			registrations: timeSeries.registrations ?? [],
			scans: timeSeries.scans ?? [],
			revenue: timeSeries.revenue ?? [],
		},
		hourlyBreakdown,
	};
}

/**
 * Helper function to prepare visitor analytics data for export
 */
export function prepareVisitorReportData(
	event: { id: string; name: string; start_date: string; end_date: string },
	stats: {
		totalVisitors: number;
		scannedVisitors: number;
		unscannedVisitors: number;
	},
	timeSeries: {
		registrations?: { date: string; value: number }[];
		scans?: { date: string; value: number }[];
	},
	hourlyBreakdown?: {
		registrations?: DailyHourlyBreakdown[];
		scans?: DailyHourlyBreakdown[];
	},
	dateFilterLabel?: string,
): VisitorReportData {
	return {
		type: "visitor",
		event: {
			id: event.id,
			name: event.name,
			startDate: event.start_date,
			endDate: event.end_date,
		},
		metadata: {
			generatedAt: new Date(),
			eventStartDate: event.start_date,
			eventEndDate: event.end_date,
			dateFilterLabel,
		},
		stats: {
			...stats,
			scanRate:
				stats.totalVisitors > 0
					? (stats.scannedVisitors / stats.totalVisitors) * 100
					: 0,
		},
		timeSeries: {
			registrations: timeSeries.registrations ?? [],
			scans: timeSeries.scans ?? [],
		},
		hourlyBreakdown,
	};
}

/**
 * Helper function to prepare voucher analytics data for export
 */
export function prepareVoucherReportData(
	event: { id: string; name: string; start_date: string; end_date: string },
	data: {
		totalVouchersIssued: number;
		totalRedemptions: number;
		eventRedemptionRate: number;
		totalDiscountValue: number;
		totalSales: number;
		dailyRedemptionTrend: { date: string; count: number }[];
		topScannedVouchers: {
			voucher_id: number;
			voucher_title: string;
			voucher_code: string;
			vendor_name?: string;
			redemption_count: number;
		}[];
		latestRedemptionTransactions: {
			id: number;
			voucher_title: string;
			voucher_code: string;
			vendor_name: string;
			redeemer_name: string;
			redeemer_type: string;
			redemption_timestamp: string;
			transaction_gross_amount: string;
			discount_applied_value: string;
			transaction_net_amount: string;
			redemption_status: string;
		}[];
	},
): VoucherReportData {
	return {
		type: "voucher",
		event: {
			id: event.id,
			name: event.name,
			startDate: event.start_date,
			endDate: event.end_date,
		},
		metadata: {
			generatedAt: new Date(),
			eventStartDate: event.start_date,
			eventEndDate: event.end_date,
		},
		stats: {
			totalVouchersIssued: data.totalVouchersIssued,
			totalRedemptions: data.totalRedemptions,
			redemptionRate: data.eventRedemptionRate,
			totalDiscountValue: data.totalDiscountValue,
			totalSales: data.totalSales,
		},
		timeSeries: {
			redemptions: data.dailyRedemptionTrend,
		},
		topVouchers: data.topScannedVouchers,
		latestTransactions: data.latestRedemptionTransactions,
	};
}

/**
 * Helper function to prepare exhibitor analytics data for export
 */
export function prepareExhibitorReportData(
	event: { id: string; name: string; start_date: string; end_date: string },
	analytics: {
		totalPartners: number;
		paidPartners: number;
		depositPartners: number;
		unpaidPartners: number;
		collectedRevenue: number;
		pendingRevenue: number;
		breakdown: {
			label: string;
			zone: string | null;
			boothType: string | null;
			bookedQuantity: number;
			paidQuantity: number;
			depositQuantity: number;
			unpaidQuantity: number;
			collectedRevenue: number;
			pendingRevenue: number;
		}[];
	},
	timeSeries: {
		bookings?: { date: string; value: number }[];
		revenue?: { date: string; value: number }[];
	} = {},
): ExhibitorReportData {
	return {
		type: "exhibitor",
		event: {
			id: event.id,
			name: event.name,
			startDate: event.start_date,
			endDate: event.end_date,
		},
		metadata: {
			generatedAt: new Date(),
			eventStartDate: event.start_date,
			eventEndDate: event.end_date,
		},
		stats: {
			totalPartners: analytics.totalPartners,
			paidPartners: analytics.paidPartners,
			depositPartners: analytics.depositPartners,
			unpaidPartners: analytics.unpaidPartners,
			collectedRevenue: analytics.collectedRevenue,
			pendingRevenue: analytics.pendingRevenue,
		},
		breakdown: analytics.breakdown,
		timeSeries: {
			bookings: timeSeries.bookings ?? [],
			revenue: timeSeries.revenue ?? [],
		},
	};
}
