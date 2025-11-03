"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TableUpload from "@/components/file-upload/table-upload";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import type { ImportTicketsResponse } from "@/lib/api/imports";
import { importTickets, importTicketsDryRun } from "@/lib/api/imports";

type ImportTicketFormProps = {
	dryRun?: boolean;
	onResult?: (data: ImportTicketsResponse) => void;
};

function ImportTicketForm({ dryRun, onResult }: ImportTicketFormProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();
	const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);

	// Import tickets mutation
	const importMutation = useMutation({
		mutationFn: async (file: File) =>
			dryRun ? importTicketsDryRun(file) : importTickets(file),
		onSuccess: (data) => {
			const {
				created,
				updated,
				skipped,
				duplicates_in_file,
				errors: importErrors,
			} = data;
			const message = `Import completed: ${created} created${typeof updated === "number" ? `, ${updated} updated` : ""}, ${skipped} skipped`;

			if (importErrors && importErrors.length > 0) {
				toast.warning(message, {
					description: `Some rows had errors${duplicates_in_file ? `; ${duplicates_in_file} duplicate(s) in file` : ""}: ${importErrors.join(", ")}`,
				});
			} else {
				toast.success(message);
			}

			onResult?.(data);

			// Invalidate all event tickets queries to refresh the list
			queryClient.invalidateQueries({
				queryKey: ["event"],
			});

			// Reset form and close dialog
			setSelectedFiles([]);
			setTimeout(() => {
				closeDialog();
			}, 1500);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to import tickets");
		},
	});

	// Handle file changes from TableUpload component
	const handleFilesChange = (files: FileWithPreview[]) => {
		setSelectedFiles(files);
	};

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

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<TableUpload
				maxFiles={1}
				maxSize={10 * 1024 * 1024} // 10MB
				accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
				multiple={false}
				simulateUpload={false}
				onFilesChange={handleFilesChange}
				className="w-full"
			/>

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={importMutation.isPending}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={selectedFiles.length === 0 || importMutation.isPending}
				>
					{importMutation.isPending ? (
						<>
							<Upload className="mr-2 h-4 w-4 animate-spin" />
							Uploading...
						</>
					) : (
						<>
							<Upload className="mr-2 h-4 w-4" />
							Import Tickets
						</>
					)}
				</Button>
			</div>
		</form>
	);
}

export function ImportTicketButton() {
	const { openDialog } = useDialog();

	const openImportDialog = () => {
		openDialog({
			component: ImportTicketForm,
			config: {
				size: "lg",
				showCloseButton: true,
				title: "Import Tickets",
				description: "Upload an Excel or CSV file to import tickets",
			},
		});
	};

	return (
		<Button
			variant="outline"
			onClick={openImportDialog}
			className="w-full rounded-none lg:w-auto"
		>
			<FileSpreadsheet className="mr-2 h-4 w-4" />
			Import Tickets
		</Button>
	);
}

export default ImportTicketForm;
