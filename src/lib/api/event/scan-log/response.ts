export type ScanSource = "staff_scan" | "self_check_in" | "kiosk";

export type ScannedLog = {
	id: number;
	name: string;
	email: string | null;
	phone: string | null;
	locationName: string;
	scannedBy: string;
	source: ScanSource;
	scannedAt: string;
	scannableType: "Ticket" | "Visitor";
	scannableId: number;
	publicId: string | null;
};

export type Pagination = {
	current_page: number;
	total_pages: number;
	total_count: number;
	per_page: number;
	prev_page: number | null;
	next_page: number | null;
};

export type ScanLogsResponse = {
	success: boolean;
	message: string;
	data: ScannedLog[];
	pagination: Pagination;
};
