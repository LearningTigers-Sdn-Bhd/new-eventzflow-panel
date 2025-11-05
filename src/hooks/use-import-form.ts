"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useDialog } from "@/hooks/use-dialog";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import type { ImportTicketsResponse } from "@/lib/api/imports";
import { importTickets, importTicketsDryRun } from "@/lib/api/imports";
import type { ImportType } from "@/lib/api/imports/types";

export interface UseImportFormOptions {
	dryRun?: boolean;
	importType?: ImportType;
	full?: boolean;
	noLabel?: boolean;
	onResult?: (data: ImportTicketsResponse) => void;
}

export function useImportForm({
	dryRun = false,
	importType = "tickets",
	full = false,
	noLabel = false,
	onResult,
}: UseImportFormOptions = {}) {
	const { closeDialog, isOpen } = useDialog();
	const queryClient = useQueryClient();
	const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
	const [resetKey, setResetKey] = useState(0);

	// Import mutation
	const importMutation = useMutation({
		mutationFn: async (file: File) =>
			dryRun
				? importTicketsDryRun(file, { full, noLabel })
				: importTickets(file, { full, noLabel }),
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

			// Invalidate all event tickets queries to refresh the list
			queryClient.invalidateQueries({
				queryKey: ["event"],
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
			toast.error(error.message || "Failed to import");
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

	const getImportButtonLabel = () => {
		return importType === "tickets" ? "Tickets" : importType;
	};

	return {
		selectedFiles,
		resetKey,
		importMutation,
		handleFilesChange,
		handleSubmit,
		getImportButtonLabel,
		isOpen,
		closeDialog,
	};
}
