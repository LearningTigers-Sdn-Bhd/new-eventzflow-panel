export type ReportLanguage = "en" | "bm";

/**
 * Static UI chrome for the Custom Reports dashboard (and later its PDF),
 * in English and Bahasa Melayu. Only the labels are translated — actual
 * data values (ministry names, category values, etc.) come verbatim from
 * whatever language the organizer's registration form already uses.
 */
export const reportLabels: Record<
	ReportLanguage,
	{
		customFieldBreakdown: string;
		ticketTypeBreakdown: string;
		customRegistrationField: string;
		groupByOptional: string;
		noGrouping: string;
		selectCustomField: string;
		loadingFields: string;
		noCustomFieldsFound: string;
		failedToLoadBreakdown: string;
		billNo: string;
		count: string;
		total: string;
		totalTickets: string;
		distinct: string;
		topValue: string;
		noDataAvailable: string;
		loading: string;
		ticketType: string;
		searchPlaceholder: string;
		noMatchesForSearch: string;
		show: string;
		allSelected: string;
		eventName: string;
		eventDuration: string;
		generatedOn: string;
		breakdown: string;
		by: string;
		report: string;
		customDashboard: string;
		tableView: string;
		dashboardView: string;
		overview: string;
		registrationsOverTime: string;
		daily: string;
		weekly: string;
		monthly: string;
		donutChart: string;
		barChart: string;
		trend: string;
		exportCsv: string;
		exporting: string;
		exportCsvFailed: string;
	}
> = {
	en: {
		customFieldBreakdown: "Custom Field Breakdown",
		ticketTypeBreakdown: "Ticket Type Breakdown",
		customRegistrationField: "Show count for",
		groupByOptional: "Split into separate lists by (optional)",
		noGrouping: "No grouping",
		selectCustomField: "Select a custom field",
		loadingFields: "Loading fields…",
		noCustomFieldsFound: "No custom fields found for this event",
		failedToLoadBreakdown: "Failed to load breakdown for this field.",
		billNo: "No.",
		count: "Count",
		total: "Total",
		totalTickets: "Total Tickets",
		distinct: "Distinct",
		topValue: "Top Value",
		noDataAvailable: "No data available.",
		loading: "Loading…",
		ticketType: "Ticket Type",
		searchPlaceholder: "Search…",
		noMatchesForSearch: "No matches found.",
		show: "Show",
		allSelected: "All",
		eventName: "Event Name",
		eventDuration: "Event Duration",
		generatedOn: "Generated on",
		breakdown: "Breakdown",
		by: "by",
		report: "Report",
		customDashboard: "Custom Dashboard",
		tableView: "Table view",
		dashboardView: "Dashboard view",
		overview: "Overview",
		registrationsOverTime: "Registrations Over Time",
		daily: "Daily",
		weekly: "Weekly",
		monthly: "Monthly",
		donutChart: "Donut",
		barChart: "Bars",
		trend: "Trend",
		exportCsv: "Export CSV",
		exporting: "Exporting…",
		exportCsvFailed: "Failed to export CSV. Please try again.",
	},
	bm: {
		customFieldBreakdown: "Pecahan Medan Tersuai",
		ticketTypeBreakdown: "Pecahan Jenis Tiket",
		customRegistrationField: "Tunjuk kiraan bagi",
		groupByOptional: "Pisahkan kepada senarai berasingan mengikut (pilihan)",
		noGrouping: "Tiada pengumpulan",
		selectCustomField: "Pilih medan tersuai",
		loadingFields: "Memuatkan medan…",
		noCustomFieldsFound: "Tiada medan tersuai ditemui untuk acara ini",
		failedToLoadBreakdown: "Gagal memuatkan pecahan untuk medan ini.",
		billNo: "Bil.",
		count: "Kiraan",
		total: "Jumlah",
		totalTickets: "Jumlah Tiket",
		distinct: "Bilangan",
		topValue: "Nilai Tertinggi",
		noDataAvailable: "Tiada data tersedia.",
		loading: "Memuatkan…",
		ticketType: "Jenis Tiket",
		searchPlaceholder: "Cari…",
		noMatchesForSearch: "Tiada padanan ditemui.",
		show: "Tunjuk",
		allSelected: "Semua",
		eventName: "Nama Acara",
		eventDuration: "Tempoh Acara",
		generatedOn: "Dijana pada",
		breakdown: "Pecahan",
		by: "mengikut",
		report: "Laporan",
		customDashboard: "Papan Pemuka Tersuai",
		tableView: "Paparan jadual",
		dashboardView: "Paparan papan pemuka",
		overview: "Ringkasan",
		registrationsOverTime: "Pendaftaran Mengikut Masa",
		daily: "Harian",
		weekly: "Mingguan",
		monthly: "Bulanan",
		donutChart: "Donat",
		barChart: "Bar",
		trend: "Aliran",
		exportCsv: "Eksport CSV",
		exporting: "Mengeksport…",
		exportCsvFailed: "Gagal mengeksport CSV. Sila cuba lagi.",
	},
};
