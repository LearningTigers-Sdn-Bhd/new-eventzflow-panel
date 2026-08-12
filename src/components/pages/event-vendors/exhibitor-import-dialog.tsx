"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	Download,
	FileSpreadsheet,
	Loader2,
	Upload,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	Alert,
	AlertContent,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
import { useFullScreenDialogOpen } from "@/hooks/use-full-screen-dialog-open";
import type {
	ImportExhibitorKitsResponse,
	ImportExhibitorKitsRowResult,
} from "@/lib/api/exhibitor-kit";
import {
	downloadExhibitorKitImportTemplate,
	importExhibitorKits,
} from "@/lib/api/exhibitor-kit";
import { cn } from "@/lib/utils";

const XLSX_MIME =
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type RowStatus = "ready" | "created" | "error";

interface PreviewRow extends ImportExhibitorKitsRowResult {
	status: RowStatus;
}

function mergeRows(
	data: ImportExhibitorKitsResponse,
	createdStatus: "ready" | "created",
): PreviewRow[] {
	const created = data.created.data.map((r) => ({
		...r,
		status: createdStatus as RowStatus,
	}));
	const errors = data.errors.data.map((r) => ({
		...r,
		status: "error" as RowStatus,
	}));
	return [...created, ...errors].sort((a, b) => a.row - b.row);
}

interface ExhibitorImportDialogProps {
	eventId: number;
	trigger?: React.ReactNode;
}

export function ExhibitorImportDialog({
	eventId,
	trigger,
}: ExhibitorImportDialogProps) {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useFullScreenDialogOpen(
		`exhibitor-import-dialog-${eventId}`,
	);
	const [phase, setPhase] = useState<"idle" | "previewed" | "imported">("idle");
	const [rows, setRows] = useState<PreviewRow[]>([]);

	const [{ files, isDragging, errors: fileErrors }, fileActions] =
		useFileUpload({
			maxFiles: 1,
			maxSize: 50 * 1024 * 1024,
			accept: `.xlsx,${XLSX_MIME}`,
			multiple: false,
		});
	const currentFileEntry = files[0];
	const currentFileId = currentFileEntry?.id ?? null;

	// A newly picked/removed file always invalidates any earlier preview or
	// import result, so it can't be shown as still applying to a different file.
	// Keyed on the file's id (a primitive) rather than the files array/callback
	// reference, so this can't turn into an update-depth loop.
	useEffect(() => {
		setPhase("idle");
		setRows([]);
	}, [currentFileId]);

	const templateMutation = useMutation({
		mutationFn: () => downloadExhibitorKitImportTemplate(eventId),
		onError: () => toast.error("Failed to download the import template"),
	});

	const previewMutation = useMutation({
		mutationFn: (file: File) =>
			importExhibitorKits(eventId, file, { dryRun: true }),
		onSuccess: (data) => {
			setRows(mergeRows(data, "ready"));
			setPhase("previewed");
			if (data.errors.count > 0) {
				toast.warning(
					`Preview: ${data.created.count} row(s) ready, ${data.errors.count} error(s)`,
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
		mutationFn: (file: File) => importExhibitorKits(eventId, file),
		onSuccess: (data) => {
			setRows(mergeRows(data, "created"));
			setPhase("imported");
			queryClient.invalidateQueries({
				queryKey: ["event", String(eventId), "vendors"],
			});

			if (data.errors.count > 0) {
				toast.warning(
					`Import completed: ${data.created.count} created, ${data.errors.count} error(s)`,
				);
			} else {
				toast.success(
					`Import completed: ${data.created.count} exhibitor(s) created`,
				);
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to import exhibitors");
		},
	});

	const resetFile = () => {
		fileActions.clearFiles();
		setPhase("idle");
		setRows([]);
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
	const readyCount = rows.filter((r) => r.status !== "error").length;
	const errorCount = rows.filter((r) => r.status === "error").length;

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				if (!open) resetFile();
			}}
		>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" className="w-full rounded-none sm:w-auto">
						<FileSpreadsheet className="mr-2 h-4 w-4" />
						Import Exhibitors
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="!max-w-none sm:!max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 !p-0 !gap-0 flex flex-col bg-background shadow-none duration-200">
				<div className="flex-none border-b px-6 py-4">
					<DialogHeader className="sm:text-left">
						<DialogTitle>Import Exhibitors</DialogTitle>
						<DialogDescription>
							Download the template, fill it in, preview the file, then import
							for real.
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
					<div className="w-full flex-none space-y-6 overflow-y-auto border-r p-6 lg:w-[420px]">
						<Alert
							variant="warning"
							appearance="light"
							className="rounded-none"
						>
							<AlertIcon>
								<AlertCircle className="h-4 w-4" />
							</AlertIcon>
							<AlertContent>
								<AlertTitle>Set up booth pricing first</AlertTitle>
								<AlertDescription>
									This template's Booth Type, Zone, and Package options come
									from this event's existing booth pricing. Configure booth
									prices (and zones/packages if used) before downloading, or
									every row will fail to match during import.
								</AlertDescription>
							</AlertContent>
						</Alert>

						<div>
							<h3 className="mb-1 font-semibold text-base">
								1. Get the template
							</h3>
							<p className="mb-4 text-muted-foreground text-sm">
								Every column, plus a Reference sheet listing this event's
								current booth types, zones, and remaining quota.
							</p>
							<Button
								type="button"
								variant="outline"
								onClick={() => templateMutation.mutate()}
								disabled={templateMutation.isPending}
								className="w-full rounded-none"
							>
								<Download className="mr-2 h-4 w-4" />
								{templateMutation.isPending
									? "Downloading..."
									: "Download Template"}
							</Button>
						</div>

						<div>
							<h3 className="mb-1 font-semibold text-base">
								2. Upload the file
							</h3>
							<p className="mb-4 text-muted-foreground text-sm">
								Fill in the template with your exhibitors, then upload it here
								as a single .xlsx file.
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
											.xlsx, up to 50MB
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
							<h3 className="mb-1 font-semibold text-base">
								3. Preview & import
							</h3>
							<p className="mb-4 text-muted-foreground text-sm">
								Preview validates every row against current booth pricing/zones
								without saving anything — fix any errors shown on the right,
								re-upload, then import for real.
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
										Preview only — nothing was saved yet. Review the table on
										the right, then click Import to create these bookings for
										real.
									</p>
								)}
								{phase === "imported" && (
									<Button
										type="button"
										variant="ghost"
										onClick={resetFile}
										className="w-full rounded-none"
									>
										Import Another File
									</Button>
								)}
							</div>
						</div>
					</div>

					<div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted/10 p-6 lg:p-8">
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
										disabled={isBusy || readyCount === 0}
										className="rounded-none"
									>
										{importMutation.isPending ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<Upload className="mr-2 h-4 w-4" />
										)}
										{importMutation.isPending
											? "Importing..."
											: `Import ${readyCount} Exhibitor${readyCount === 1 ? "" : "s"}`}
									</Button>
								)}
							</div>
						)}

						<div className="overflow-x-auto rounded-none border bg-background shadow-sm">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[60px]">Row</TableHead>
										<TableHead>Vendor</TableHead>
										<TableHead>Company</TableHead>
										<TableHead>PIC</TableHead>
										<TableHead>Booth</TableHead>
										<TableHead>Zone</TableHead>
										<TableHead>Price Label</TableHead>
										<TableHead>Package</TableHead>
										<TableHead>Qty</TableHead>
										<TableHead>Amount (RM)</TableHead>
										<TableHead>Payment</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{rows.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={12}
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
											const cellClass = cn(isError && "text-red-700");
											return (
												<TableRow
													key={row.row}
													className={cn(
														isError && "bg-red-50/70 hover:bg-red-50/70",
													)}
												>
													<TableCell className={cn("font-medium", cellClass)}>
														{row.row}
													</TableCell>
													<TableCell className={cellClass}>
														{row.vendor_name || row.vendor_email || "-"}
													</TableCell>
													<TableCell className={cellClass}>
														{row.company_name || "-"}
													</TableCell>
													<TableCell className={cellClass}>
														{row.pic_name || "-"}
													</TableCell>
													<TableCell className={cn(cellClass, "capitalize")}>
														{row.booth_type?.replace(/_/g, " ") || "-"}
													</TableCell>
													<TableCell className={cellClass}>
														{row.zone || "-"}
													</TableCell>
													<TableCell className={cellClass}>
														{row.price_label || "-"}
													</TableCell>
													<TableCell className={cellClass}>
														{row.package_name || "-"}
													</TableCell>
													<TableCell className={cellClass}>
														{row.booth_quantity ?? "-"}
													</TableCell>
													<TableCell className={cellClass}>
														{row.amount != null
															? row.amount.toLocaleString("en-MY", {
																	minimumFractionDigits: 2,
																	maximumFractionDigits: 2,
																})
															: "-"}
													</TableCell>
													<TableCell className={cellClass}>
														{row.payment_status || "-"}
													</TableCell>
													<TableCell>
														{row.status === "error" ? (
															<span className="text-red-700 text-xs">
																{row.error}
															</span>
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
			</DialogContent>
		</Dialog>
	);
}
