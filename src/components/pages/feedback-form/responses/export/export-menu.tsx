"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ChevronDown,
	Download,
	FileSpreadsheet,
	FileText,
	Loader2,
	Table2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import type {
	FeedbackAiSummary,
	FeedbackExportData,
	FeedbackFilters,
} from "@/lib/api/feedback-form";
import {
	getFeedbackAiSummary,
	getFeedbackExportData,
} from "@/lib/api/feedback-form";
import { filtersKey } from "../filters";
import { buildResponsesCsv } from "./csv";
import { downloadBlob } from "./download";
import { DEFAULT_OPTIONS, exportFilename, filtersDescription } from "./rows";

type Format = "csv" | "xlsx" | "pdf";

const FORMATS: Record<Format, { label: string; icon: typeof Table2 }> = {
	csv: { label: "CSV", icon: Table2 },
	xlsx: { label: "Excel", icon: FileSpreadsheet },
	pdf: { label: "PDF report", icon: FileText },
};

async function buildFile(
	format: Format,
	data: FeedbackExportData,
	includeAttendee: boolean,
	aiSummary: FeedbackAiSummary | null,
): Promise<{ blob: Blob; filename: string }> {
	const options = { includeAttendee };
	if (format === "csv") {
		return {
			blob: new Blob([buildResponsesCsv(data, options)], {
				type: "text/csv;charset=utf-8",
			}),
			filename: exportFilename(data, "csv"),
		};
	}
	if (format === "xlsx") {
		const { buildFeedbackWorkbook } = await import("./xlsx");
		const bytes = await buildFeedbackWorkbook(data, options, aiSummary);
		return {
			blob: new Blob([bytes as BlobPart], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			}),
			filename: exportFilename(data, "xlsx"),
		};
	}
	const [{ pdf }, { FeedbackReport }] = await Promise.all([
		import("@react-pdf/renderer"),
		import("@/components/pdf-reports/feedback-report"),
	]);
	return {
		blob: await pdf(
			<FeedbackReport data={data} options={options} aiSummary={aiSummary} />,
		).toBlob(),
		filename: exportFilename(data, "pdf"),
	};
}

/** CSV / Excel / PDF export of whatever the current filters show. */
export function FeedbackExportMenu({
	eventId,
	filters,
}: {
	eventId: string;
	filters: FeedbackFilters;
}) {
	const [format, setFormat] = useState<Format | null>(null);
	const [includeAttendee, setIncludeAttendee] = useState(true);
	const [includeAi, setIncludeAi] = useState(false);
	const [busy, setBusy] = useState(false);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["event", eventId, "feedback-export", ...filtersKey(filters)],
		queryFn: () => getFeedbackExportData(eventId, filters),
		enabled: format !== null,
		staleTime: 0,
		gcTime: 0,
	});

	// A ready AI summary can be added to Excel and PDF files (never CSV), opt-in.
	const { data: aiState } = useQuery({
		queryKey: ["event", eventId, "feedback-ai-summary"],
		queryFn: () => getFeedbackAiSummary(eventId),
		enabled: format === "xlsx" || format === "pdf",
	});
	const aiSummary =
		aiState?.summary?.status === "ready" && aiState.summary.content
			? aiState.summary
			: null;

	const choose = (next: Format) => {
		setIncludeAi(false);
		setIncludeAttendee(DEFAULT_OPTIONS[next].includeAttendee);
		setFormat(next);
	};

	const run = async () => {
		if (!data || !format) return;
		setBusy(true);
		try {
			const { blob, filename } = await buildFile(
				format,
				data,
				includeAttendee,
				includeAi ? aiSummary : null,
			);
			downloadBlob(blob, filename);
			toast.success(`${FORMATS[format].label} downloaded`);
			setFormat(null);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not build the file");
		} finally {
			setBusy(false);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button type="button" variant="outline" className="h-9 rounded-none">
						<Download className="size-4" />
						Export
						<ChevronDown className="size-3.5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="rounded-none">
					{(Object.keys(FORMATS) as Format[]).map((key) => {
						const Icon = FORMATS[key].icon;
						return (
							<DropdownMenuItem key={key} onSelect={() => choose(key)}>
								<Icon className="size-4" />
								{FORMATS[key].label}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog
				open={format !== null}
				onOpenChange={(o) => !o && !busy && setFormat(null)}
			>
				<DialogContent className="rounded-none">
					<DialogHeader>
						<DialogTitle>
							Export {format ? FORMATS[format].label : ""}
						</DialogTitle>
						<DialogDescription>
							{isLoading
								? "Preparing your data…"
								: data
									? `${data.responses.length} response${data.responses.length === 1 ? "" : "s"} and ${data.comments.length} comment${data.comments.length === 1 ? "" : "s"}. ${filtersDescription(data)}.`
									: "Exports follow the filters currently applied."}
						</DialogDescription>
					</DialogHeader>

					{isError ? (
						<p
							role="alert"
							className="border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm"
						>
							{error instanceof Error
								? error.message
								: "Could not load the data."}
						</p>
					) : (
						<div className="space-y-2">
							<div className="flex items-start gap-2">
								<Checkbox
									id="export-include-attendee"
									checked={includeAttendee}
									onCheckedChange={(v) => setIncludeAttendee(v === true)}
									className="mt-0.5"
								/>
								<Label
									htmlFor="export-include-attendee"
									className="leading-snug"
								>
									Include attendee name, email and ticket ID
								</Label>
							</div>
							<p className="text-muted-foreground text-xs">
								{includeAttendee
									? "This file will contain personal information, so share it carefully."
									: "Answers stay anonymous. Only the ticket type is kept."}
							</p>
							{aiSummary && format !== "csv" && (
								<div className="space-y-1 border-t pt-3">
									<div className="flex items-start gap-2">
										<Checkbox
											id="export-include-ai"
											checked={includeAi}
											onCheckedChange={(v) => setIncludeAi(v === true)}
											className="mt-0.5"
										/>
										<Label htmlFor="export-include-ai" className="leading-snug">
											Include the AI summary
										</Label>
									</div>
									<p className="text-muted-foreground text-xs">
										Labelled AI-generated in the file, made from{" "}
										{aiSummary.comments_count} comments on{" "}
										{new Date(
											aiSummary.finished_at ?? aiSummary.created_at,
										).toLocaleDateString()}
										{aiSummary.stale
											? " (newer responses have arrived since)"
											: ""}
										{Object.values(aiSummary.filters ?? {}).some(Boolean)
											? ". It was made for a filtered view, which may differ from this export"
											: ""}
										.
									</p>
								</div>
							)}
						</div>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							className="rounded-none"
							disabled={busy}
							onClick={() => setFormat(null)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							className="rounded-none"
							disabled={!data || isError || busy}
							onClick={run}
						>
							{busy || isLoading ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Download className="size-4" />
							)}
							Download
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
