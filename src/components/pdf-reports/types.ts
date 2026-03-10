import type {
	ChartDataPoint,
	EventAnalytics,
} from "@/lib/api/dashboard/response";
import type {
	DailyRedemptionTrend,
	LatestRedemptionTransaction,
	TopScannedVoucher,
	VoucherAnalyticsResponse,
} from "@/lib/api/voucher-analytics/response";

/**
 * Event information for report header
 */
export type ReportEventInfo = {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	location?: string;
};

/**
 * Report metadata
 */
export type ReportMetadata = {
	generatedAt: Date;
	generatedBy?: string;
	eventStartDate: string;
	eventEndDate: string;
	dateFilterLabel?: string; // e.g., "All_Time", "Pre_Event", "Day_1", etc.
};

/**
 * Hourly breakdown data for a single day
 */
export type DailyHourlyBreakdown = {
	date: string; // "2026-02-04"
	hourlyData: { hour: string; value: number }[]; // e.g., [{ hour: "08:00", value: 5 }, ...]
};

/**
 * Ticket Analytics Report Data
 */
export type TicketReportData = {
	type: "ticket";
	event: ReportEventInfo;
	metadata: ReportMetadata;
	stats: {
		totalTickets: number;
		scannedTickets: number;
		unscannedTickets: number;
		totalRevenue: number;
		scanRate: number;
	};
	timeSeries: {
		registrations: ChartDataPoint[];
		scans: ChartDataPoint[];
		revenue: ChartDataPoint[];
	};
	// Optional hourly breakdown per day for multi-day events
	hourlyBreakdown?: {
		registrations?: DailyHourlyBreakdown[];
		scans?: DailyHourlyBreakdown[];
	};
};

/**
 * Visitor Analytics Report Data
 */
export type VisitorReportData = {
	type: "visitor";
	event: ReportEventInfo;
	metadata: ReportMetadata;
	stats: {
		totalVisitors: number;
		scannedVisitors: number;
		unscannedVisitors: number;
		scanRate: number;
	};
	timeSeries: {
		registrations: ChartDataPoint[];
		scans: ChartDataPoint[];
	};
	// Optional hourly breakdown per day for multi-day events
	hourlyBreakdown?: {
		registrations?: DailyHourlyBreakdown[];
		scans?: DailyHourlyBreakdown[];
	};
};

/**
 * Voucher Analytics Report Data
 */
export type VoucherReportData = {
	type: "voucher";
	event: ReportEventInfo;
	metadata: ReportMetadata;
	stats: {
		totalVouchersIssued: number;
		totalRedemptions: number;
		redemptionRate: number;
		totalDiscountValue: number;
		totalSales: number;
	};
	timeSeries: {
		redemptions: DailyRedemptionTrend[];
	};
	topVouchers: TopScannedVoucher[];
	latestTransactions: LatestRedemptionTransaction[];
};

/**
 * Union type for all report types
 */
export type AnalyticsReportData =
	| TicketReportData
	| VisitorReportData
	| VoucherReportData;

/**
 * Helper to format currency for reports
 */
export function formatReportCurrency(amount: number, currency = "MYR"): string {
	if (currency === "MYR") {
		return `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(amount);
}

/**
 * Helper to format date for reports
 */
export function formatReportDate(date: string | Date): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * Helper to format date and time for reports
 */
export function formatReportDateTime(date: string | Date): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

/**
 * Helper to calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((value / total) * 100 * 10) / 10;
}

/**
 * Get report type label
 */
export function getReportTypeLabel(type: AnalyticsReportData["type"]): string {
	switch (type) {
		case "ticket":
			return "Ticket Analytics Report";
		case "visitor":
			return "Visitor Analytics Report";
		case "voucher":
			return "Voucher Analytics Report";
	}
}

/**
 * Get event date range label for report
 */
export function getEventDateRangeLabel(
	startDate: string,
	endDate: string,
): string {
	const start = formatReportDate(startDate);
	const end = formatReportDate(endDate);
	if (start === end) {
		return start;
	}
	return `${start} - ${end}`;
}
