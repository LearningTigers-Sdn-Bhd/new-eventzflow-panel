import { z } from "zod";
import { publicProcedure, router } from "../../index";
import type { ExportLogs } from "./type";

// Mock data for export logs
const mockExportLogs: Record<string, ExportLogs[]> = {
	"1": [
		{
			id: "1",
			fileName: "scan_history_2025_10_01.csv",
			category: "scan_history",
			recordCount: 245,
			fileUrl:
				"https://storage.example.com/exports/scan_history_2025_10_01.csv",
			createdAt: "2025-10-01T14:30:00Z",
		},
		{
			id: "2",
			fileName: "tickets_export_2025_10_02.xlsx",
			category: "tickets",
			recordCount: 1890,
			fileUrl:
				"https://storage.example.com/exports/tickets_export_2025_10_02.xlsx",
			createdAt: "2025-10-02T09:15:00Z",
		},
	],
	"2": [
		{
			id: "3",
			fileName: "scan_logs_october_2025.csv",
			category: "scan_history",
			recordCount: 567,
			fileUrl: "https://storage.example.com/exports/scan_logs_october_2025.csv",
			createdAt: "2025-10-15T16:45:00Z",
		},
		{
			id: "4",
			fileName: "all_tickets_backup_2025_10_20.xlsx",
			category: "tickets",
			recordCount: 3200,
			fileUrl:
				"https://storage.example.com/exports/all_tickets_backup_2025_10_20.xlsx",
			createdAt: "2025-10-20T11:20:00Z",
		},
	],
	"3": [
		{
			id: "5",
			fileName: "event_scan_summary_2025_10_25.csv",
			category: "scan_history",
			recordCount: 892,
			fileUrl:
				"https://storage.example.com/exports/event_scan_summary_2025_10_25.csv",
			createdAt: "2025-10-25T13:10:00Z",
		},
	],
	"4": [],
	"5": [],
};

export const exportLogRouter = router({
	getExportLogs: publicProcedure
		.input(z.object({ eventId: z.string() }))
		.query(({ input }) => {
			const exportLogs = mockExportLogs[input.eventId] || [];
			return exportLogs;
		}),
});
