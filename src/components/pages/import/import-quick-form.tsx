"use client";

import { FileSpreadsheet, Upload } from "lucide-react";
import { useState } from "react";
import TableUpload from "@/components/file-upload/table-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useDialog } from "@/hooks/use-dialog";
import { useImportForm } from "@/hooks/use-import-form";
import type { ImportTicketsResponse } from "@/lib/api/imports";
import type { ImportType } from "@/lib/api/imports/types";

type ImportQuickFormProps = {
	importType?: ImportType;
	dryRun?: boolean;
	onResult?: (data: ImportTicketsResponse) => void;
};

function ImportQuickFormContent({
	importType = "tickets",
	dryRun = false,
	onResult,
}: ImportQuickFormProps) {
	const { closeDialog, isOpen } = useDialog();
	const [useLabelMapping, setUseLabelMapping] = useState(false);
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
		full: false, // Always use quick mode for quick form
		noLabel: useLabelMapping,
		onResult,
	});

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
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
		</form>
	);
}

export function ImportQuickForm(props: ImportQuickFormProps) {
	return <ImportQuickFormContent {...props} />;
}

export function ImportQuickButton({
	importType = "tickets",
}: {
	importType?: ImportType;
}) {
	const { openDialog } = useDialog();

	const openImportDialog = () => {
		const typeLabel = importType === "tickets" ? "Tickets" : importType;
		openDialog({
			component: ImportQuickFormContent,
			props: {
				importType,
			},
			config: {
				size: "lg",
				showCloseButton: true,
				title: `Import ${typeLabel}`,
				description: `Upload an Excel or CSV file to import ${typeLabel.toLowerCase()}`,
			},
		});
	};

	return (
		<Button
			variant="outline"
			onClick={openImportDialog}
			className="w-full rounded-none py-6 md:py-4 lg:w-auto"
		>
			<FileSpreadsheet className="mr-2 h-4 w-4" />
			Import {importType === "tickets" ? "Tickets" : importType}
		</Button>
	);
}
