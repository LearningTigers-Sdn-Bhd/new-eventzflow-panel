"use client";

import { Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useVisitors } from "@/hooks/use-visitors";
import { getEventById } from "@/lib/api/event";
import { AddVisitorDialog } from "../add-visitor-dialog";

interface VisitorsPageButtonProps {
	eventId: number;
}

export function VisitorsPageButton({ eventId }: VisitorsPageButtonProps) {
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [eventName, setEventName] = useState<string>("");
	const { data: visitors } = useVisitors(eventId);

	useEffect(() => {
		const fetchEventName = async () => {
			try {
				const event = await getEventById(String(eventId));
				setEventName(event.title);
			} catch (error) {
				console.error("Failed to fetch event name:", error);
			}
		};
		fetchEventName();
	}, [eventId]);

	const handleExport = async () => {
		if (!visitors?.length) return;

		setIsExporting(true);
		try {
			const xlsx = await import("xlsx-js-style");

			const exportData = visitors.map((visitor) => ({
				Name: visitor.full_name,
				Email: visitor.email || "",
				Phone: visitor.phone || "",
				Gender: visitor.gender || "",
				Age: visitor.age || "",
				"Created At": new Date(visitor.created_at).toLocaleString("en-US", {
					dateStyle: "medium",
					timeStyle: "short",
				}),
			}));

			const worksheet = xlsx.utils.json_to_sheet(exportData);

			// Style header row with background color
			const headerStyle = {
				fill: { fgColor: { rgb: "4F46E5" } }, // Indigo color
				font: { bold: true, color: { rgb: "FFFFFF" } },
				alignment: { horizontal: "center", vertical: "center" },
			};

			const headers = ["A1", "B1", "C1", "D1", "E1", "F1"];
			for (const cell of headers) {
				if (worksheet[cell]) {
					worksheet[cell].s = headerStyle;
				}
			}

			// Calculate column widths based on data
			const colWidths = [
				{
					wch: Math.max(
						20,
						...visitors.map((v) => (v.full_name?.length || 0) + 2),
					),
				}, // Name
				{
					wch: Math.max(25, ...visitors.map((v) => (v.email?.length || 0) + 2)),
				}, // Email
				{
					wch: Math.max(15, ...visitors.map((v) => (v.phone?.length || 0) + 2)),
				}, // Phone
				{ wch: 12 }, // Gender
				{ wch: 8 }, // Age
				{ wch: 22 }, // Created At
			];
			worksheet["!cols"] = colWidths;

			const workbook = xlsx.utils.book_new();
			xlsx.utils.book_append_sheet(workbook, worksheet, "Visitors");

			// Generate filename: event_name_visitor_export_date
			const sanitizedEventName = (eventName || "event")
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "_")
				.replace(/^_|_$/g, "");
			const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
			const filename = `${sanitizedEventName}_visitor_export_${dateStr}.xlsx`;

			xlsx.writeFile(workbook, filename);
		} catch (error) {
			console.error("Export failed:", error);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<>
			<div className="flex w-full items-center gap-2 lg:w-auto">
				<Button
					variant="outline"
					onClick={handleExport}
					disabled={isExporting || !visitors?.length}
					className="w-full rounded-none lg:w-auto"
				>
					<Download className="mr-2 h-4 w-4" />
					{isExporting ? "Exporting..." : "Export Visitors"}
				</Button>
				<Button
					onClick={() => setIsAddDialogOpen(true)}
					className="w-full rounded-none lg:w-auto"
				>
					<Plus className="mr-2 h-4 w-4" />
					Add Visitor
				</Button>
			</div>

			<AddVisitorDialog
				eventId={eventId}
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
			/>
		</>
	);
}
