"use client";

import { Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useVisitors } from "@/hooks/use-visitors";
import { getEventById } from "@/lib/api/event";
import CreateEventVisitorForm from "./create-event-visitor-form";

interface CreateEventVisitorButtonProps {
	eventId: number;
}

export function CreateEventVisitorButton({
	eventId,
}: CreateEventVisitorButtonProps) {
	const { openDialog } = useDialog();
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

	const openCreateVisitorDialog = () => {
		openDialog({
			component: CreateEventVisitorForm,
			config: {
				size: "full",
				showCloseButton: true,
				title: "Create New Visitor",
				description: "Add a new visitor for this event",
			},
		});
	};

	const handleExport = async () => {
		if (!visitors?.length) return;

		setIsExporting(true);
		try {
			const xlsx = await import("xlsx-js-style");

			// Get custom label keys from the first visitor (if any)
			const customLabelKeys: string[] = [];
			const firstVisitorWithCustomFields = visitors.find(
				(v) =>
					v.custom_fields_data && Object.keys(v.custom_fields_data).length > 0,
			);
			if (firstVisitorWithCustomFields?.custom_fields_data) {
				customLabelKeys.push(
					...Object.keys(firstVisitorWithCustomFields.custom_fields_data),
				);
			}

			// Export data matching import format: Name, Email, Phone, Gender, Age, Event Title, [Custom Labels...]
			const exportData = visitors.map((visitor) => {
				const baseData: Record<string, string | number> = {
					"Full Name": visitor.full_name,
					Email: visitor.email || "",
					Phone: visitor.phone || "",
					Gender: visitor.gender || "",
					Age: visitor.age || "",
					"Event Title": eventName || "",
				};

				// Add custom label columns
				for (const key of customLabelKeys) {
					baseData[key] = visitor.custom_fields_data?.[key] || "";
				}

				return baseData;
			});

			const worksheet = xlsx.utils.json_to_sheet(exportData);

			// Style header row with background color
			const headerStyle = {
				fill: { fgColor: { rgb: "4F46E5" } }, // Indigo color
				font: { bold: true, color: { rgb: "FFFFFF" } },
				alignment: { horizontal: "center", vertical: "center" },
			};

			// Calculate total columns (6 fixed + custom labels)
			const totalColumns = 6 + customLabelKeys.length;
			const headerCells = Array.from(
				{ length: totalColumns },
				(_, i) => String.fromCharCode(65 + i) + "1",
			);
			for (const cell of headerCells) {
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
				}, // Full Name
				{
					wch: Math.max(25, ...visitors.map((v) => (v.email?.length || 0) + 2)),
				}, // Email
				{
					wch: Math.max(15, ...visitors.map((v) => (v.phone?.length || 0) + 2)),
				}, // Phone
				{ wch: 12 }, // Gender
				{ wch: 8 }, // Age
				{ wch: Math.max(20, (eventName?.length || 0) + 2) }, // Event Title
				// Custom label columns
				...customLabelKeys.map((key) => ({
					wch: Math.max(
						15,
						key.length + 2,
						...visitors.map(
							(v) => (v.custom_fields_data?.[key]?.length || 0) + 2,
						),
					),
				})),
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
		<div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
			<Button
				variant="outline"
				onClick={handleExport}
				disabled={isExporting || !visitors?.length}
				className="w-full rounded-none py-6 md:w-auto md:py-4"
			>
				<Download className="mr-2 h-4 w-4" />
				{isExporting ? "Exporting..." : "Export Visitors"}
			</Button>
			<Button
				onClick={openCreateVisitorDialog}
				className="w-full rounded-none py-6 md:w-auto md:py-4"
			>
				<Plus className="mr-2 h-4 w-4" />
				Add Visitor
			</Button>
		</div>
	);
}
