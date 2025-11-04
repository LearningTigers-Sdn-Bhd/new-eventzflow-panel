"use client";

import { Upload } from "lucide-react";
import TableUpload from "@/components/file-upload/table-upload";
import { Button } from "@/components/ui/button";
import { useImportForm } from "@/hooks/use-import-form";
import type { ImportTicketsResponse } from "@/lib/api/imports";
import type { ImportType } from "@/lib/api/imports/types";

type ImportFullFormProps = {
	importType?: ImportType;
	dryRun?: boolean;
	onResult?: (data: ImportTicketsResponse) => void;
};

export function ImportFullForm({
	importType = "tickets",
	dryRun = false,
	onResult,
}: ImportFullFormProps) {
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
		onResult,
	});

	return (
		<form onSubmit={handleSubmit} className="space-y-8 pb-8">
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
