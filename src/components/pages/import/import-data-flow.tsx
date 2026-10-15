"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Download,
	FileSpreadsheet,
	Loader2,
	RefreshCw,
	Upload,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Banner from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getFileIcon } from "@/hooks/use-file-type";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { getEvents } from "@/lib/api/event";
import type { ImportEventSummary, ImportResponse } from "@/lib/api/imports";
import { importTickets, importVisitors } from "@/lib/api/imports";
import type { ImportType } from "@/lib/api/imports/types";
import { cn } from "@/lib/utils";

const XLSX_MIME =
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

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

const IMPORT_TYPE_LABELS: Record<ImportType, string> = {
	tickets: "Tickets",
	visitors: "Visitors",
	events: "Events",
	users: "Users",
};

type RowStatus = "ready" | "created" | "updated" | "skipped" | "error";

interface PreviewRow {
	key: string;
	status: RowStatus;
	cells: Record<string, unknown>;
	error?: string;
}

// Same normalization as the backend's normalize_event_title: collapse
// whitespace and compare case-insensitively, so "Sabah  Expo" / "sabah expo"
// still count as the same event.
function normalizeEventTitle(title: string): string {
	return title.trim().replace(/\s+/g, " ").toLowerCase();
}

// "attendee_name" -> "Attendee Name" for table headers.
function humanizeColumn(column: string): string {
	return column
		.split("_")
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function cellValue(value: unknown): string {
	if (value == null) return "-";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

// Flatten an ImportResponse into one status-tagged row list. Row data is the
// generic Record<string, unknown> shape the tickets/visitors import endpoints
// return, so columns are derived dynamically from whatever keys come back.
function mergeRows(
	data: ImportResponse,
	createdStatus: "ready" | "created",
): PreviewRow[] {
	const rows: PreviewRow[] = [];
	data.created.data.forEach((r, i) => {
		rows.push({
			key: `created-${r.id ?? i}`,
			status: createdStatus,
			cells: r,
		});
	});
	data.updated?.data.forEach((r, i) => {
		rows.push({
			key: `updated-${r.id ?? i}`,
			status: "updated",
			cells: r,
			error: Array.isArray(r.changed_fields)
				? `Changed: ${r.changed_fields.join(", ")}`
				: undefined,
		});
	});
	data.skipped.data.forEach((r, i) => {
		rows.push({ key: `skipped-${r.id ?? i}`, status: "skipped", cells: r });
	});
	data.duplicates_in_file?.data.forEach((r, i) => {
		rows.push({
			key: `duplicate-${r.id ?? i}`,
			status: "skipped",
			cells: r,
			error: "Duplicate within this file",
		});
	});
	data.errors.data.forEach((message, i) => {
		rows.push({
			key: `error-${i}`,
			status: "error",
			cells: {},
			error: message,
		});
	});
	return rows;
}

// Display columns: union of keys across all result rows, minus the internal
// bookkeeping keys every row carries.
function deriveColumns(rows: PreviewRow[]): string[] {
	const keys = new Set<string>();
	for (const row of rows) {
		for (const key of Object.keys(row.cells)) {
			if (key === "model" || key === "id" || key === "changed_fields") continue;
			keys.add(key);
		}
	}
	return Array.from(keys);
}

export interface ImportDataFlowProps {
	importType: ImportType;
	onImported?: (data: ImportResponse) => void;
	/**
	 * When set, the flow is scoped to this event: the "select event" template
	 * picker is replaced with a fixed label instead, since the surrounding page
	 * (e.g. an event's ticket page) already establishes which event this is.
	 */
	lockedEventId?: number | string;
}

/**
 * Summary of which events the uploaded file targets, shown above the preview
 * table. Each Event Title either reuses an existing event or creates a new
 * draft event on import — a new event is created for *any* title that doesn't
 * exactly match an existing one, so a file mixing "Sabah 2026"/"Sabah 2027"
 * would silently spin up extra events. Warn prominently when more than one new
 * event would be created, since that's almost always a typo in the Event Title
 * column, not intent.
 */
function EventSummaryPanel({
	eventSummary,
	mismatchedTitles,
}: {
	eventSummary: ImportEventSummary[];
	/** Normalized titles (see normalizeEventTitle) that don't match the event this import is locked to. */
	mismatchedTitles?: Set<string>;
}) {
	const newEvents = eventSummary.filter((e) => !e.exists);
	const hasMultipleNewEvents = newEvents.length > 1;

	return (
		<div className="rounded-none border bg-background shadow-sm">
			<div className="border-b px-4 py-2.5 font-semibold text-sm">
				Events in this file ({eventSummary.length})
			</div>
			<ul className="divide-y">
				{eventSummary.map((event) => {
					const isMismatched = mismatchedTitles?.has(
						normalizeEventTitle(event.title),
					);
					return (
						<li
							key={event.title}
							className="flex items-center justify-between gap-3 px-4 py-2.5"
						>
							<div className="min-w-0">
								<p className="truncate font-medium text-sm">{event.title}</p>
								<p className="text-muted-foreground text-xs">
									{event.row_count} row{event.row_count === 1 ? "" : "s"}
								</p>
							</div>
							<div className="flex shrink-0 items-center gap-1.5">
								{isMismatched && (
									<Badge
										variant="secondary"
										className="shrink-0 rounded-none border-red-300 bg-red-100 text-red-800 hover:bg-red-100"
									>
										<AlertCircle className="mr-1 h-3.5 w-3.5" />
										Not this event
									</Badge>
								)}
								{event.exists ? (
									<Badge
										variant="secondary"
										className="shrink-0 rounded-none border-emerald-200 bg-emerald-100/80 text-emerald-800 hover:bg-emerald-100/80"
									>
										<CheckCircle2 className="mr-1 h-3.5 w-3.5" />
										Existing event
									</Badge>
								) : (
									<Badge
										variant="secondary"
										className="shrink-0 rounded-none border-amber-200 bg-amber-100/80 text-amber-800 hover:bg-amber-100/80"
									>
										<AlertTriangle className="mr-1 h-3.5 w-3.5" />
										Will create new event
									</Badge>
								)}
							</div>
						</li>
					);
				})}
			</ul>
			{hasMultipleNewEvents && (
				<div className="flex items-start gap-2 border-amber-200 border-t bg-amber-50 px-4 py-2.5 text-amber-900">
					<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
					<p className="text-xs">
						This file will create {newEvents.length} new events (
						{newEvents.map((e) => e.title).join(", ")}). Each distinct Event
						Title creates a separate event — if these are meant to be the same
						event, fix the Event Title column so every row matches exactly, then
						re-upload.
					</p>
				</div>
			)}
		</div>
	);
}

/**
 * The shared two-pane import flow: guidelines + template + upload + options on
 * the left, dry-run preview table on the right. Rendered inline on the
 * standalone import page and inside ImportDataDialog on the event ticket page.
 */
export function ImportDataFlow({
	importType,
	onImported,
	lockedEventId,
}: ImportDataFlowProps) {
	const queryClient = useQueryClient();
	const typeLabel = IMPORT_TYPE_LABELS[importType] ?? importType;
	const [phase, setPhase] = useState<"idle" | "previewed" | "imported">("idle");
	const [rows, setRows] = useState<PreviewRow[]>([]);
	const [eventSummary, setEventSummary] = useState<ImportEventSummary[]>([]);
	const [selectedEventId, setSelectedEventId] = useState<string>(
		lockedEventId !== undefined ? String(lockedEventId) : "",
	);
	// When on, blank cells in the file wipe existing custom-field values on the
	// matched records instead of leaving them untouched (overwrite_blank_custom_fields).
	const [overwriteBlankCustomFields, setOverwriteBlankCustomFields] =
		useState(false);

	// Events for the optional "generate template from this event's custom fields".
	// When one is picked, its labels_data display names become the template's
	// custom columns; with no selection the template falls back to generic columns.
	const { data: events } = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
	});
	const selectedEvent = events?.find((e) => String(e.id) === selectedEventId);

	const [{ files, isDragging, errors: fileErrors }, fileActions] =
		useFileUpload({
			maxFiles: 1,
			maxSize: 10 * 1024 * 1024,
			accept: `.xlsx,.xls,.csv,${XLSX_MIME},application/vnd.ms-excel,text/csv`,
			multiple: false,
		});
	const currentFileEntry = files[0];
	const currentFileId = currentFileEntry?.id ?? null;

	// A newly picked/removed file always invalidates any earlier preview or
	// import result. Keyed on the file's id (a primitive) so this can't turn
	// into an update-depth loop. Setters are stable and intentionally omitted.
	// biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when the picked file changes
	useEffect(() => {
		setPhase("idle");
		setRows([]);
		setEventSummary([]);
	}, [currentFileId]);

	const importFn = importType === "visitors" ? importVisitors : importTickets;

	const previewMutation = useMutation({
		mutationFn: (file: File) =>
			importFn(file, {
				dryRun: true,
				full: true,
				noLabel: false,
				overwriteBlankCustomFields,
			}),
		onSuccess: (data) => {
			setRows(mergeRows(data, "ready"));
			setEventSummary(data.events ?? []);
			setPhase("previewed");
			if (data.errors.count > 0 || data.skipped.count > 0) {
				toast.warning(
					`Preview: ${data.created.count} ready, ${data.skipped.count} skipped, ${data.errors.count} error(s)`,
				);
			} else {
				toast.success(`Preview: ${data.created.count} row(s) ready to import`);
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to preview the file");
		},
	});

	const importMutation = useMutation({
		mutationFn: (file: File) =>
			importFn(file, {
				full: true,
				noLabel: false,
				overwriteBlankCustomFields,
			}),
		onSuccess: (data) => {
			setRows(mergeRows(data, "created"));
			setEventSummary(data.events ?? []);
			setPhase("imported");
			if (importType === "visitors") {
				queryClient.invalidateQueries({ queryKey: ["visitors"] });
			}
			queryClient.invalidateQueries({ queryKey: ["event"] });
			onImported?.(data);

			if (data.errors.count > 0) {
				toast.warning(
					`Import completed: ${data.created.count} created, ${data.updated?.count ?? 0} updated, ${data.skipped.count} skipped, ${data.errors.count} error(s)`,
				);
			} else {
				toast.success(
					`Import completed: ${data.created.count} created, ${data.updated?.count ?? 0} updated, ${data.skipped.count} skipped`,
				);
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || `Failed to import ${typeLabel}`);
		},
	});

	const handleDownloadTemplate = async () => {
		try {
			// Dynamic import exception: the xlsx writer is a heavy, rarely-used
			// dependency — a static import would force it into the initial bundle for
			// every page. Mirrors the existing ImportFullForm template download.
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
		}
	};

	const resetFile = () => {
		fileActions.clearFiles();
		setPhase("idle");
		setRows([]);
		setEventSummary([]);
	};

	const currentFile = currentFileEntry?.file;

	const handlePreview = () => {
		if (!currentFile || !(currentFile instanceof File)) {
			toast.error("Please select a file to preview");
			return;
		}
		previewMutation.mutate(currentFile);
	};

	const handleImport = () => {
		if (!currentFile || !(currentFile instanceof File)) {
			toast.error("Please select a file to import");
			return;
		}
		importMutation.mutate(currentFile);
	};

	const isBusy = previewMutation.isPending || importMutation.isPending;
	const columns = useMemo(() => deriveColumns(rows), [rows]);
	// When scoped to one event (lockedEventId set), the file's Event Title
	// column is still what actually routes each row — a typo or a file meant
	// for another event would silently import into (or create) a different
	// event than the one this dialog says. Flag any row whose title doesn't
	// match this event so that isn't silent.
	const mismatchedEvents = useMemo(() => {
		if (lockedEventId === undefined || !selectedEvent) return [];
		const expected = normalizeEventTitle(selectedEvent.title);
		return eventSummary.filter(
			(e) => normalizeEventTitle(e.title) !== expected,
		);
	}, [lockedEventId, selectedEvent, eventSummary]);
	const readyCount = rows.filter(
		(r) => r.status === "ready" || r.status === "created",
	).length;
	const updatedCount = rows.filter((r) => r.status === "updated").length;
	const skippedCount = rows.filter((r) => r.status === "skipped").length;
	const errorCount = rows.filter((r) => r.status === "error").length;

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			<Banner
				title="Before you import"
				description="Start from the downloaded template and keep every header, even blank columns. Custom-field columns must match the event's field labels exactly. Most important: fill the Event Title column carefully — every distinct Event Title creates a separate new event, so a typo or mixing names (e.g. Sabah 2026 / Sabah 2027) will split your data across extra events. Use the exact same Event Title on every row for one event."
				leadingIcon={<AlertCircle />}
				onCloser={true}
				className="flex-none border-amber-500/20 bg-amber-500/5 [&_div:first-child]:border-amber-500/30 [&_div:first-child]:bg-amber-500/10"
			/>
			<div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
				{/* LEFT: guidelines + steps */}
				<div className="w-full flex-none space-y-6 overflow-y-auto border-r p-6 lg:w-[420px]">
					<div>
						<h3 className="mb-1 font-semibold text-base">
							1. Get the template
						</h3>
						<p className="mb-4 text-muted-foreground text-sm">
							{lockedEventId !== undefined
								? "The template is built from this event's custom fields."
								: "Pick an event to bake its custom fields into the template columns, or download a generic one."}
						</p>
						<div className="flex flex-col gap-2">
							{lockedEventId !== undefined ? (
								<div className="flex h-9 items-center border bg-muted/30 px-3 text-sm">
									{selectedEvent?.title ?? "This event"}
								</div>
							) : (
								<Select
									value={selectedEventId}
									onValueChange={setSelectedEventId}
								>
									<SelectTrigger className="w-full rounded-none border">
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
							)}
							<Button
								type="button"
								variant="outline"
								onClick={handleDownloadTemplate}
								className="w-full rounded-none"
							>
								<Download className="mr-2 h-4 w-4" />
								Download Template
							</Button>
						</div>
					</div>

					<div>
						<h3 className="mb-1 font-semibold text-base">2. Upload the file</h3>
						<p className="mb-4 text-muted-foreground text-sm">
							Fill in the template, then upload it here as a single .xlsx, .xls,
							or .csv file.
						</p>
						{/* biome-ignore lint: File upload drop zone requires interactive div with drag handlers */}
						<div
							aria-label="File upload drop zone"
							onClick={currentFile ? undefined : fileActions.openFileDialog}
							onDragEnter={fileActions.handleDragEnter}
							onDragLeave={fileActions.handleDragLeave}
							onDragOver={fileActions.handleDragOver}
							onDrop={fileActions.handleDrop}
							className={cn(
								"relative flex min-h-[104px] flex-col items-center justify-center gap-2 border border-dashed p-4 text-center transition-colors",
								currentFile ? "border-muted-foreground/25" : "cursor-pointer",
								isDragging
									? "border-primary bg-primary/5"
									: !currentFile && "hover:border-muted-foreground/50",
							)}
						>
							<input {...fileActions.getInputProps()} className="sr-only" />

							{currentFile ? (
								<div className="flex w-full items-center gap-2 text-left">
									<div className="flex size-8 shrink-0 items-center justify-center text-muted-foreground/80">
										{getFileIcon(currentFile)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm">
											{currentFile.name}
										</p>
										<p className="text-muted-foreground text-xs">
											{formatBytes(currentFile.size)}
										</p>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="size-8 shrink-0 rounded-none"
										onClick={(e) => {
											e.stopPropagation();
											if (currentFileEntry) {
												fileActions.removeFile(currentFileEntry.id);
											}
										}}
									>
										<X className="size-4" />
									</Button>
								</div>
							) : (
								<>
									<Upload className="h-5 w-5 text-muted-foreground" />
									<p className="text-sm">
										Drop file here or{" "}
										<span className="text-primary underline-offset-4 hover:underline">
											browse
										</span>
									</p>
									<p className="text-muted-foreground text-xs">
										.xlsx, .xls, or .csv, up to 10MB
									</p>
								</>
							)}
						</div>
						{fileErrors.length > 0 && (
							<p className="mt-2 text-destructive text-xs">
								{fileErrors.join(" ")}
							</p>
						)}
					</div>

					<div>
						<h3 className="mb-1 font-semibold text-base">3. Options</h3>
						<div
							className={cn(
								"flex items-start gap-3 rounded-none border p-4 transition-colors",
								overwriteBlankCustomFields
									? "border-red-500/60 bg-red-500/10"
									: "border-primary/50",
							)}
						>
							<Switch
								id="overwrite-blank-custom-fields"
								checked={overwriteBlankCustomFields}
								onCheckedChange={setOverwriteBlankCustomFields}
								disabled={isBusy}
								className={cn(
									overwriteBlankCustomFields &&
										"data-[state=checked]:bg-red-600",
								)}
							/>
							<div className="space-y-1">
								<Label
									htmlFor="overwrite-blank-custom-fields"
									className={cn(
										"flex items-center gap-1.5 font-medium text-sm",
										overwriteBlankCustomFields && "text-red-700",
									)}
								>
									{overwriteBlankCustomFields && (
										<AlertTriangle className="h-4 w-4 text-red-600" />
									)}
									Reset custom fields
								</Label>
								<p
									className={cn(
										"text-xs",
										overwriteBlankCustomFields
											? "text-red-700/90"
											: "text-muted-foreground",
									)}
								>
									When on, blank custom-field cells and columns removed from the
									file clear the existing values on matched records. When off,
									blanks and missing columns leave existing values untouched.
								</p>
							</div>
						</div>
					</div>

					<div>
						<h3 className="mb-1 font-semibold text-base">
							4. Preview & import
						</h3>
						<p className="mb-4 text-muted-foreground text-sm">
							Preview validates every row without saving anything — fix any
							errors shown on the right, re-upload, then import for real.
						</p>
						<div className="flex flex-col gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={handlePreview}
								disabled={!currentFile || isBusy}
								className="w-full rounded-none"
							>
								{previewMutation.isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<FileSpreadsheet className="mr-2 h-4 w-4" />
								)}
								{previewMutation.isPending ? "Checking..." : "Preview File"}
							</Button>
							{phase === "previewed" && (
								<p className="text-muted-foreground text-xs">
									Preview only — nothing was saved yet. Review the table on the
									right, then click Import to save these rows for real.
								</p>
							)}
							{phase === "imported" && (
								<Button
									type="button"
									variant="ghost"
									onClick={resetFile}
									className="w-full rounded-none"
								>
									<RefreshCw className="mr-2 h-4 w-4" />
									Import Another File
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* RIGHT: preview table */}
				<div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted/10 p-6 lg:p-8">
					{mismatchedEvents.length > 0 && (
						<div className="flex items-start gap-2 border border-red-300 bg-red-50 px-4 py-3 text-red-900">
							<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
							<p className="text-sm">
								This file targets{" "}
								<strong>
									{mismatchedEvents.map((e) => `"${e.title}"`).join(", ")}
								</strong>
								, not <strong>"{selectedEvent?.title}"</strong> — the event this
								import is scoped to. Importing will still route those rows to{" "}
								{mismatchedEvents.map((e) => `"${e.title}"`).join(", ")}
								{eventSummary.length > mismatchedEvents.length
									? " instead of this event"
									: ""}
								. Fix the Event Title column to match this event, or import from
								the standalone Import page if you meant to target a different
								one.
							</p>
						</div>
					)}
					{eventSummary.length > 0 && (
						<EventSummaryPanel
							eventSummary={eventSummary}
							mismatchedTitles={
								mismatchedEvents.length > 0
									? new Set(
											mismatchedEvents.map((e) => normalizeEventTitle(e.title)),
										)
									: undefined
							}
						/>
					)}
					{rows.length > 0 && (
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="flex flex-wrap items-center gap-3 text-sm">
								<Badge
									variant="secondary"
									className="rounded-none border-emerald-200 bg-emerald-100/80 text-emerald-800 hover:bg-emerald-100/80"
								>
									<CheckCircle2 className="mr-1 h-3.5 w-3.5" />
									{readyCount} {phase === "imported" ? "created" : "ready"}
								</Badge>
								{updatedCount > 0 && (
									<Badge
										variant="secondary"
										className="rounded-none border-blue-200 bg-blue-100/80 text-blue-800 hover:bg-blue-100/80"
									>
										{updatedCount}{" "}
										{phase === "imported" ? "updated" : "will update"}
									</Badge>
								)}
								{skippedCount > 0 && (
									<Badge
										variant="secondary"
										className="rounded-none border-amber-200 bg-amber-100/80 text-amber-800 hover:bg-amber-100/80"
									>
										{skippedCount} skipped
									</Badge>
								)}
								{errorCount > 0 && (
									<Badge
										variant="secondary"
										className="rounded-none border-red-200 bg-red-100/80 text-red-800 hover:bg-red-100/80"
									>
										<AlertCircle className="mr-1 h-3.5 w-3.5" />
										{errorCount} error{errorCount === 1 ? "" : "s"}
									</Badge>
								)}
							</div>
							{phase === "previewed" && (
								<Button
									type="button"
									onClick={handleImport}
									disabled={isBusy || readyCount + updatedCount === 0}
									className="rounded-none"
								>
									{importMutation.isPending ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<Upload className="mr-2 h-4 w-4" />
									)}
									{importMutation.isPending
										? "Importing..."
										: `Import ${readyCount + updatedCount} ${typeLabel}`}
								</Button>
							)}
						</div>
					)}

					<div className="overflow-x-auto rounded-none border bg-background shadow-sm">
						<Table>
							<TableHeader>
								<TableRow>
									{columns.length > 0 ? (
										columns.map((column) => (
											<TableHead key={column}>
												{humanizeColumn(column)}
											</TableHead>
										))
									) : (
										<TableHead>Details</TableHead>
									)}
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={Math.max(columns.length, 1) + 1}
											className="py-8 text-center text-muted-foreground"
										>
											{isBusy
												? "Processing..."
												: "Upload a file and click Preview File to see rows here."}
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => {
										const isError = row.status === "error";
										const isSkipped = row.status === "skipped";
										const cellClass = cn(
											isError && "text-red-700",
											isSkipped && "text-amber-800",
										);
										return (
											<TableRow
												key={row.key}
												className={cn(
													isError && "bg-red-50/70 hover:bg-red-50/70",
													isSkipped && "bg-amber-50/70 hover:bg-amber-50/70",
												)}
											>
												{columns.length > 0 ? (
													columns.map((column) => (
														<TableCell key={column} className={cellClass}>
															{cellValue(row.cells[column])}
														</TableCell>
													))
												) : (
													<TableCell className={cellClass}>
														{row.error || "-"}
													</TableCell>
												)}
												<TableCell>
													{row.status === "error" ? (
														<div className="flex flex-col gap-1">
															<Badge
																variant="secondary"
																className="w-fit rounded-none border-red-200 bg-red-100/80 text-red-800 hover:bg-red-100/80"
															>
																Error
															</Badge>
															{row.error && (
																<span className="text-red-700 text-xs">
																	{row.error}
																</span>
															)}
														</div>
													) : row.status === "skipped" ? (
														<div className="flex flex-col gap-1">
															<Badge
																variant="secondary"
																className="w-fit rounded-none border-amber-200 bg-amber-100/80 text-amber-800 hover:bg-amber-100/80"
															>
																Skipped
															</Badge>
															{row.error && (
																<span className="text-amber-800 text-xs">
																	{row.error}
																</span>
															)}
														</div>
													) : row.status === "updated" ? (
														<div className="flex flex-col gap-1">
															<Badge
																variant="secondary"
																className="w-fit rounded-none border-blue-200 bg-blue-100/80 text-blue-800 hover:bg-blue-100/80"
															>
																{phase === "imported"
																	? "Updated"
																	: "Will update"}
															</Badge>
															{row.error && (
																<span className="text-blue-800 text-xs">
																	{row.error}
																</span>
															)}
														</div>
													) : row.status === "created" ? (
														<Badge
															variant="secondary"
															className="rounded-none border-emerald-200 bg-emerald-100/80 text-emerald-800 hover:bg-emerald-100/80"
														>
															Created
														</Badge>
													) : (
														<Badge variant="outline" className="rounded-none">
															Ready
														</Badge>
													)}
												</TableCell>
											</TableRow>
										);
									})
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</div>
		</div>
	);
}
