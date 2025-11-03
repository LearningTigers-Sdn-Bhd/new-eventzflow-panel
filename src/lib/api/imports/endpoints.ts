import { extractErrorMessage } from "@/utils/error-handler";
import { restClient } from "@/utils/rest-api";
import type {
	BackendImportTicketsResponse,
	ImportTicketsResponse,
} from "./response";

/**
 * Import tickets from an Excel or CSV file
 */
export async function importTickets(
	file: File,
	dryRun?: boolean,
): Promise<ImportTicketsResponse> {
	try {
		// Validate file type
		const validTypes = [
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
			"application/vnd.ms-excel", // .xls
			"text/csv", // .csv
		];
		const validExtensions = [".xlsx", ".xls", ".csv"];

		const fileExtension = file.name
			.substring(file.name.lastIndexOf("."))
			.toLowerCase();

		if (
			!validTypes.includes(file.type) &&
			!validExtensions.includes(fileExtension)
		) {
			throw new Error(
				"Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.",
			);
		}

		// Create FormData with the file
		const formData = new FormData();
		formData.append("file", file);

		// Build URL with optional dry_run parameter
		const url = dryRun
			? "v1/imports/tickets?dry_run=true"
			: "v1/imports/tickets";

		// Call the import endpoint
		const response =
			await restClient.postFormData<BackendImportTicketsResponse>(
				url,
				formData,
			);

		// Transform backend response to frontend format
		return {
			created: response.data.created,
			updated: response.data.updated,
			skipped: response.data.skipped,
			duplicates_in_file: response.data.duplicates_in_file,
			errors: response.data.errors || [],
		};
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Import tickets in dry-run mode (no writes) and return detailed report
 */
export async function importTicketsDryRun(
	file: File,
): Promise<ImportTicketsResponse> {
	return importTickets(file, true);
}
