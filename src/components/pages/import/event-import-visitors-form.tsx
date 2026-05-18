"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TableUpload from "@/components/file-upload/table-upload";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import { getEventById } from "@/lib/api/event";
import { importVisitors } from "@/lib/api/imports";
import type { ImportResponse } from "@/lib/api/imports/response";

type EventImportVisitorsFormProps = {
	eventId: number;
	dryRun?: boolean;
	onResult?: (data: ImportResponse) => void;
};

export function EventImportVisitorsForm({
	eventId,
	dryRun = false,
	onResult,
}: EventImportVisitorsFormProps) {
	const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
	const [resetKey, setResetKey] = useState(0);
	const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
	const { closeDialog, isOpen } = useDialog();
	const queryClient = useQueryClient();

	// Fetch event data to get labels_data (custom fields) and event title
	const { data: eventData } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(String(eventId)),
	});

	// Import mutation - uses existing global endpoint
	const importMutation = useMutation({
		mutationFn: async (file: File) => {
			// Always use header names (noLabel: false) for better UX
			const options = { full: true, noLabel: false, dryRun };
			return importVisitors(file, options);
		},
		onSuccess: (data) => {
			const {
				total,
				created,
				updated,
				skipped,
				duplicates_in_file,
				errors: importErrors,
			} = data;

			const message = `Import completed: ${total} total processed (${created.count} created${
				updated ? `, ${updated.count} updated` : ""
			}, ${skipped.count} skipped)`;

			// Check if any updated items have payment status or custom labels changes
			const hasPaymentStatusChanges =
				updated?.data.some(
					(item) =>
						Array.isArray(item.changed_fields) &&
						item.changed_fields.includes("payment_status"),
				) ?? false;
			const hasCustomLabelsChanges =
				updated?.data.some(
					(item) =>
						Array.isArray(item.changed_fields) &&
						item.changed_fields.includes("custom_fields_data"),
				) ?? false;

			const changeDescriptions: string[] = [];
			if (hasPaymentStatusChanges) {
				changeDescriptions.push("payment status");
			}
			if (hasCustomLabelsChanges) {
				changeDescriptions.push("custom labels");
			}

			const changeDescription =
				changeDescriptions.length > 0
					? ` Some items had ${changeDescriptions.join(" and ")} changes.`
					: "";

			if (importErrors.count > 0) {
				toast.warning(message, {
					description: `Some rows had errors${
						duplicates_in_file
							? `; ${duplicates_in_file.count} duplicate(s) in file`
							: ""
					}: ${importErrors.data.join(", ")}${changeDescription}`,
				});
			} else {
				toast.success(message, {
					description: changeDescription || undefined,
				});
			}

			onResult?.(data);

			// Invalidate queries
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "visitors"],
			});
			queryClient.invalidateQueries({
				queryKey: ["events"],
			});

			// Reset form - clear selected files and reset TableUpload component
			setSelectedFiles([]);
			setResetKey((prev) => prev + 1);

			// Close dialog only if we're in a dialog context
			if (isOpen) {
				setTimeout(() => {
					closeDialog();
				}, 1500);
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to import visitors");
		},
	});

	// Handle file changes from TableUpload component
	const handleFilesChange = (files: FileWithPreview[]) => {
		setSelectedFiles(files);
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (selectedFiles.length === 0) {
			toast.error("Please select a file to upload");
			return;
		}

		const file = selectedFiles[0];
		if (file.file instanceof File) {
			importMutation.mutate(file.file);
		}
	};

	// Handle download template
	const handleDownloadTemplate = async () => {
		setIsDownloadingTemplate(true);
		try {
			const xlsx = await import("xlsx-js-style");

			// Get custom field labels from event's labels_data
			const customFieldLabels: string[] = [];
			if (
				eventData?.labels_data &&
				Object.keys(eventData.labels_data).length > 0
			) {
				// labels_data format: { "role": "Role", "company": "Company" }
				// We use the values (display names) as column headers
				customFieldLabels.push(
					...(Object.values(eventData.labels_data) as string[]),
				);
			}

			// Create template with base columns + custom field columns
			// Backend expects: Full Name, Email, Phone, Gender, Age, Event Title, [Custom Fields...]
			const createTemplateRow = (): Record<string, string> => {
				const row: Record<string, string> = {
					"Full Name": "",
					Email: "",
					Phone: "",
					Gender: "",
					Age: "",
					"Event Title": eventData?.title || "", // Pre-fill with current event title
				};
				// Add custom field columns
				for (const label of customFieldLabels) {
					row[label] = "";
				}
				return row;
			};

			// Create 3 pre-filled rows for user convenience
			const templateRows = Array.from({ length: 3 }, () => createTemplateRow());

			// Create worksheet with header row and data rows
			const worksheet = xlsx.utils.json_to_sheet(templateRows);

			// Style header row with background color
			const headerStyle = {
				fill: { fgColor: { rgb: "4F46E5" } }, // Indigo color
				font: { bold: true, color: { rgb: "FFFFFF" } },
				alignment: { horizontal: "center", vertical: "center" },
			};

			// Calculate total columns (6 base + custom labels)
			const totalColumns = 6 + customFieldLabels.length;
			const headerCells = Array.from({ length: totalColumns }, (_, i) => {
				// Handle columns beyond Z (AA, AB, etc.)
				if (i < 26) {
					return String.fromCharCode(65 + i) + "1";
				}
				const firstChar = String.fromCharCode(65 + Math.floor(i / 26) - 1);
				const secondChar = String.fromCharCode(65 + (i % 26));
				return firstChar + secondChar + "1";
			});

			for (const cell of headerCells) {
				if (worksheet[cell]) {
					worksheet[cell].s = headerStyle;
				}
			}

			// Set column widths
			const colWidths = [
				{ wch: 25 }, // Full Name
				{ wch: 30 }, // Email
				{ wch: 15 }, // Phone
				{ wch: 12 }, // Gender
				{ wch: 8 }, // Age
				{ wch: Math.max(20, (eventData?.title?.length || 0) + 2) }, // Event Title
				// Custom field columns
				...customFieldLabels.map((label) => ({
					wch: Math.max(15, label.length + 2),
				})),
			];
			worksheet["!cols"] = colWidths;

			const workbook = xlsx.utils.book_new();
			xlsx.utils.book_append_sheet(workbook, worksheet, "Visitors Template");

			// Generate filename
			const sanitizedEventName = (eventData?.title || "event")
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "_")
				.replace(/^_|_$/g, "");
			const filename = `${sanitizedEventName}_visitor_import_template.xlsx`;

			xlsx.writeFile(workbook, filename);
			toast.success("Template downloaded successfully");
		} catch (error) {
			console.error("Template download failed:", error);
			toast.error("Failed to download template");
		} finally {
			setIsDownloadingTemplate(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6 pb-8">
			{/* Download Template Button */}
			<div className="flex justify-start px-2 pt-4 md:px-4">
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
				key={`event-visitors-${resetKey}`}
				maxFiles={1}
				maxSize={10 * 1024 * 1024} // 10MB
				accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
				multiple={false}
				simulateUpload={false}
				onFilesChange={handleFilesChange}
				className="w-full"
			/>

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
								Import Visitors
							</>
						)}
					</Button>
				</div>
			)}
		</form>
	);
}
