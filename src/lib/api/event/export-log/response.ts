// Frontend export logs type
export type ExportLogs = {
	id: string;
	type: "ticket-list" | "scan_history";
	downloadUrl: string;
	createdAt: string;
};

// Backend export log response type
export type BackendExportLog = {
	id: number;
	type: string;
	sheet_path: string;
	created_at: string;
	updated_at: string;
	event_id: number;
};
