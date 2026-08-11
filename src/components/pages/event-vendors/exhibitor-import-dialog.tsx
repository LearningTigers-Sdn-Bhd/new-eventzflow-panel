"use client";

import { useMutation } from "@tanstack/react-query";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TableUpload from "@/components/file-upload/table-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useDialog } from "@/hooks/use-dialog";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import type { ImportExhibitorKitsResponse } from "@/lib/api/exhibitor-kit";
import {
	downloadExhibitorKitImportTemplate,
	importExhibitorKits,
} from "@/lib/api/exhibitor-kit";

const XLSX_MIME =
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

interface ExhibitorImportDialogContentProps {
	eventId: number;
}

function ExhibitorImportDialogContent({
	eventId,
}: ExhibitorImportDialogContentProps) {
	const { closeDialog, isOpen } = useDialog();
	const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
	const [dryRun, setDryRun] = useState(false);
	const [resetKey, setResetKey] = useState(0);

	const templateMutation = useMutation({
		mutationFn: () => downloadExhibitorKitImportTemplate(eventId),
		onError: () => toast.error("Failed to download the import template"),
	});

	const importMutation = useMutation({
		mutationFn: (file: File) => importExhibitorKits(eventId, file, { dryRun }),
		onSuccess: (data: ImportExhibitorKitsResponse) => {
			const { total, created, errors } = data;
			const message = dryRun
				? `Dry run: ${total} row(s) checked, ${errors.count} error(s)`
				: `Import completed: ${created.count} of ${total} row(s) created`;

			if (errors.count > 0) {
				toast.warning(message, {
					description: errors.data
						.map((e) => `Row ${e.row}: ${e.error}`)
						.join("; "),
				});
			} else {
				toast.success(message);
			}

			setSelectedFiles([]);
			setResetKey((prev) => prev + 1);

			if (!dryRun && isOpen) {
				setTimeout(() => closeDialog(), 1500);
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to import exhibitors");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const file = selectedFiles[0];
		if (!file || !(file.file instanceof File)) {
			toast.error("Please select a file to upload");
			return;
		}
		importMutation.mutate(file.file);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Button
				type="button"
				variant="outline"
				onClick={() => templateMutation.mutate()}
				disabled={templateMutation.isPending}
				className="w-full rounded-none"
			>
				<Download className="mr-2 h-4 w-4" />
				{templateMutation.isPending ? "Downloading..." : "Download Template"}
			</Button>

			<TableUpload
				key={`exhibitor-import-${resetKey}`}
				maxFiles={1}
				maxSize={50 * 1024 * 1024}
				accept={`.xlsx,${XLSX_MIME}`}
				multiple={false}
				simulateUpload={false}
				onFilesChange={setSelectedFiles}
				className="w-full"
			/>

			<FieldGroup>
				<Field>
					<FieldLabel>Dry run (validate only)</FieldLabel>
					<div className="flex h-9 items-center rounded-lg border border-primary/50 p-4">
						<Switch
							id="exhibitor-import-dry-run"
							checked={dryRun}
							onCheckedChange={setDryRun}
							disabled={importMutation.isPending}
						/>
						<span className="ml-2 text-muted-foreground text-sm">
							{dryRun ? "Validate only, no changes" : "Import for real"}
						</span>
					</div>
				</Field>
			</FieldGroup>

			<div className="flex justify-end gap-2">
				{isOpen && (
					<Button
						type="button"
						variant="outline"
						onClick={closeDialog}
						disabled={importMutation.isPending}
						className="rounded-none"
					>
						Cancel
					</Button>
				)}
				<Button
					type="submit"
					disabled={selectedFiles.length === 0 || importMutation.isPending}
					className="rounded-none"
				>
					{importMutation.isPending ? (
						<>
							<Upload className="mr-2 h-4 w-4 animate-spin" />
							{dryRun ? "Checking..." : "Importing..."}
						</>
					) : (
						<>
							<Upload className="mr-2 h-4 w-4" />
							{dryRun ? "Check File" : "Import Exhibitors"}
						</>
					)}
				</Button>
			</div>
		</form>
	);
}

export function ExhibitorImportButton({ eventId }: { eventId: number }) {
	const { openDialog } = useDialog();

	const openImportDialog = () => {
		openDialog({
			component: ExhibitorImportDialogContent,
			props: { eventId },
			config: {
				size: "lg",
				showCloseButton: true,
				title: "Import Exhibitors",
				description:
					"Download the template, fill it in, then upload it here to bulk-create exhibitor bookings.",
			},
		});
	};

	return (
		<Button
			variant="outline"
			onClick={openImportDialog}
			className="w-full rounded-none sm:w-auto"
		>
			<FileSpreadsheet className="mr-2 h-4 w-4" />
			Import Exhibitors
		</Button>
	);
}
