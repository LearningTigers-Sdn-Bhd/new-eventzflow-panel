"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TableUpload from "@/components/file-upload/table-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useImportForm } from "@/hooks/use-import-form";
import { getEvents } from "@/lib/api/event";
import type { ImportTicketsResponse } from "@/lib/api/imports";
import type { ImportType } from "@/lib/api/imports/types";

type ImportFullFormProps = {
	importType?: ImportType;
	dryRun?: boolean;
	onResult?: (data: ImportTicketsResponse) => void;
};

// Fixed columns the backend import parser reads by position. Order must match
// TicketExcelService::FLAT_HEADERS / VisitorExcelService exactly — custom
// label columns are appended after these.
const TICKET_TEMPLATE_HEADERS = [
	"Attendee Name",
	"Attendee Email",
	"Attendee Phone",
	"Event Title",
	"Ticket Type",
	"Role",
	"Public ID",
	"QR Code",
	"Payment Status",
	"Checked In",
	"Created At",
	"Review Status",
];
const VISITOR_TEMPLATE_HEADERS = [
	"Full Name",
	"Email",
	"Phone",
	"Gender",
	"Age",
	"Role",
	"Event Title",
];

export function ImportFullForm({
	importType = "tickets",
	dryRun = false,
	onResult,
}: ImportFullFormProps) {
	const [useLabelMapping, setUseLabelMapping] = useState(false);
	const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
	const [selectedEventId, setSelectedEventId] = useState<string>("");

	// Events for the optional "generate template from this event's custom fields".
	// When one is picked, its labels_data display names become the template's
	// custom columns; with no selection the template falls back to generic columns.
	const { data: events } = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
	});
	const selectedEvent = events?.find((e) => String(e.id) === selectedEventId);

	const {
		selectedFiles,
		resetKey,
		importMutation,
		handleFilesChange,
		handleSubmit,
		getImportButtonLabel,
	} = useImportForm({
		importType,
		dryRun,
		full: true, // Always use full mode for full form
		noLabel: useLabelMapping,
		onResult,
	});

	const handleDownloadTemplate = async () => {
		setIsDownloadingTemplate(true);
		try {
			// Dynamic import: keeps the heavy xlsx writer out of the initial bundle and
			// matches the existing template-download pattern used across the app.
			const xlsx = await import("xlsx-js-style");

			const baseHeaders =
				importType === "visitors"
					? VISITOR_TEMPLATE_HEADERS
					: TICKET_TEMPLATE_HEADERS;
			// Custom columns come from the selected event's labels_data (its real
			// custom fields). With no event selected, fall back to a couple of
			// generic example columns users can rename/add/remove.
			const eventCustomHeaders = selectedEvent?.labels_data
				? (Object.values(selectedEvent.labels_data) as string[])
				: [];
			const customHeaders =
				eventCustomHeaders.length > 0
					? eventCustomHeaders
					: ["Company", "Dietary Restrictions"];
			const headers = [...baseHeaders, ...customHeaders];

			// Pre-fill the Event Title column with the selected event so the file
			// imports straight into it.
			const eventTitle = selectedEvent?.title || "My Event";

			// One sample row + a couple blank rows.
			const sampleRow: Record<string, string> = {};
			for (const h of headers) sampleRow[h] = "";
			if (importType === "visitors") {
				sampleRow["Full Name"] = "Jane Doe";
				sampleRow.Email = "jane@example.com";
				sampleRow.Phone = "+60123456789";
				sampleRow["Event Title"] = eventTitle;
			} else {
				sampleRow["Attendee Name"] = "Jane Doe";
				sampleRow["Attendee Email"] = "jane@example.com";
				sampleRow["Attendee Phone"] = "+60123456789";
				sampleRow["Event Title"] = eventTitle;
				sampleRow["Ticket Type"] = "General Admission";
				sampleRow["Payment Status"] = "paid";
				sampleRow["Checked In"] = "false";
			}
			const blankRow: Record<string, string> = {};
			for (const h of headers) blankRow[h] = "";
			const templateRows = [sampleRow, { ...blankRow }, { ...blankRow }];

			const worksheet = xlsx.utils.json_to_sheet(templateRows);

			// Style the header row.
			const headerStyle = {
				fill: { fgColor: { rgb: "4F46E5" } },
				font: { bold: true, color: { rgb: "FFFFFF" } },
				alignment: { horizontal: "center", vertical: "center" },
			};
			const headerCells = headers.map((_, i) => {
				if (i < 26) return `${String.fromCharCode(65 + i)}1`;
				const firstChar = String.fromCharCode(65 + Math.floor(i / 26) - 1);
				const secondChar = String.fromCharCode(65 + (i % 26));
				return `${firstChar}${secondChar}1`;
			});
			for (const cell of headerCells) {
				if (worksheet[cell]) worksheet[cell].s = headerStyle;
			}

			worksheet["!cols"] = headers.map((h) => ({
				wch: Math.max(14, h.length + 2),
			}));

			const workbook = xlsx.utils.book_new();
			xlsx.utils.book_append_sheet(workbook, worksheet, "Import Template");
			const namePart = selectedEvent
				? `${selectedEvent.title
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, "_")
						.replace(/^_+|_+$/g, "")}_`
				: "";
			xlsx.writeFile(workbook, `${namePart}${importType}_import_template.xlsx`);
			toast.success("Template downloaded successfully");
		} catch (error) {
			console.error("Template download failed:", error);
			toast.error("Failed to download template");
		} finally {
			setIsDownloadingTemplate(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-8 pb-8">
			{/* Template tools: pick an event to bake its custom fields into the
			    template, then download. Optional — no event gives a generic template. */}
			<div className="flex flex-col gap-2 px-2 pt-4 sm:flex-row sm:items-center md:px-4">
				<Select value={selectedEventId} onValueChange={setSelectedEventId}>
					<SelectTrigger className="w-full rounded-none border sm:w-64">
						<SelectValue placeholder="Select event (optional)" />
					</SelectTrigger>
					<SelectContent className="rounded-none">
						{events?.map((event) => (
							<SelectItem
								key={event.id}
								className="rounded-none"
								value={String(event.id)}
							>
								{event.title}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					type="button"
					variant="outline"
					onClick={handleDownloadTemplate}
					disabled={isDownloadingTemplate}
					className="rounded-none"
				>
					<Download className="mr-2 h-4 w-4" />
					{isDownloadingTemplate ? "Downloading..." : "Download Template"}
				</Button>
			</div>

			<TableUpload
				key={`${importType}-${resetKey}`}
				maxFiles={1}
				maxSize={10 * 1024 * 1024} // 10MB
				accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
				multiple={false}
				simulateUpload={false}
				onFilesChange={handleFilesChange}
				className="w-full"
			/>

			<FieldGroup>
				<Field>
					<FieldLabel>Use Label N mapping</FieldLabel>
					<div className="flex h-9 items-center rounded-lg border border-primary/50 p-4">
						<Switch
							id="use-label-mapping"
							checked={useLabelMapping}
							onCheckedChange={setUseLabelMapping}
							disabled={importMutation.isPending}
						/>
						<span className="ml-2 text-muted-foreground text-sm">
							{useLabelMapping ? "Label N" : "Header names"}
						</span>
					</div>
				</Field>
			</FieldGroup>

			{/* Only show import button when file is uploaded */}
			{selectedFiles.length > 0 && (
				<div className="flex justify-end px-2 md:px-4">
					<Button
						type="submit"
						disabled={importMutation.isPending}
						className="rounded-none"
					>
						{importMutation.isPending ? (
							<>
								<Upload className="mr-2 h-4 w-4 animate-spin" />
								Uploading...
							</>
						) : (
							<>
								<Upload className="mr-2 h-4 w-4" />
								Import {getImportButtonLabel()}
							</>
						)}
					</Button>
				</div>
			)}
		</form>
	);
}
