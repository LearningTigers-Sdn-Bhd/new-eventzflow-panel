"use client";

import { pdf } from "@react-pdf/renderer";
import { useCallback, useState } from "react";
import { TicketAnalyticsReport } from "./ticket-report";
import { VisitorAnalyticsReport } from "./visitor-report";
import { VoucherAnalyticsReport } from "./voucher-report";
import type {
	AnalyticsReportData,
	TicketReportData,
	VisitorReportData,
	VoucherReportData,
} from "./types";

export type ExportStatus = "idle" | "generating" | "success" | "error";

interface UseExportPdfReturn {
	exportPdf: () => Promise<void>;
	status: ExportStatus;
	error: string | null;
}

/**
 * Hook to export analytics data to PDF
 */
export function useExportPdf(
	data: AnalyticsReportData | null,
	filename?: string,
): UseExportPdfReturn {
	const [status, setStatus] = useState<ExportStatus>("idle");
	const [error, setError] = useState<string | null>(null);

	const exportPdf = useCallback(async () => {
		if (!data) {
			setError("No data available for export");
			setStatus("error");
			return;
		}

		setStatus("generating");
		setError(null);

		try {
			let document: JSX.Element;

			switch (data.type) {
				case "ticket":
					document = <TicketAnalyticsReport data={data as TicketReportData} />;
					break;
				case "visitor":
					document = <VisitorAnalyticsReport data={data as VisitorReportData} />;
					break;
				case "voucher":
					document = <VoucherAnalyticsReport data={data as VoucherReportData} />;
					break;
				default:
					throw new Error("Unknown report type");
			}

			const blob = await pdf(document).toBlob();

			// Open PDF in new tab for preview
			const url = URL.createObjectURL(blob);
			window.open(url, "_blank");

			// Clean up the URL after a delay to allow the new tab to load
			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 1000);

			setStatus("success");
		} catch (err) {
			console.error("Failed to generate PDF:", err);
			setError(err instanceof Error ? err.message : "Failed to generate PDF");
			setStatus("error");
		}
	}, [data, filename]);

	return { exportPdf, status, error };
}

/**
 * Helper function to prepare ticket analytics data for export
 * Always generates a complete report regardless of current filter
 */
export function prepareTicketReportData(
	event: { id: string; name: string; start_date: string; end_date: string },
	stats: {
		totalTickets: number;
		scannedTickets: number;
		unscannedTickets: number;
		totalRevenue: number;
	},
	timeSeries: {
		registrations?: { date: string; value: number }[];
		scans?: { date: string; value: number }[];
		revenue?: { date: string; value: number }[];
	},
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
		},
		stats: {
			...stats,
			scanRate:
				stats.totalTickets > 0
					? (stats.scannedTickets / stats.totalTickets) * 100
					: 0,
		},
		timeSeries: {
			registrations: timeSeries.registrations ?? [],
			scans: timeSeries.scans ?? [],
			revenue: timeSeries.revenue ?? [],
		},
	};
}

/**
 * Helper function to prepare visitor analytics data for export
 * Always generates a complete report regardless of current filter
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
	};
}

/**
 * Helper function to prepare voucher analytics data for export
 * Always generates a complete report regardless of current filter
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
