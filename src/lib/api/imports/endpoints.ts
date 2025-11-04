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
	options?: { dryRun?: boolean; full?: boolean },
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

		// Build URL with optional parameters
		const params = new URLSearchParams();
		if (options?.dryRun) {
			params.append("dry_run", "true");
		}
		if (options?.full) {
			params.append("full", "true");
		}
		const queryString = params.toString();
		const url = queryString
			? `v1/imports/tickets?${queryString}`
			: "v1/imports/tickets";

		// Call the import endpoint
		const response =
			await restClient.postFormData<BackendImportTicketsResponse>(
				url,
				formData,
			);

		// Transform backend response to frontend format
		const backendData = response.data;

		// Calculate total
		const total =
			backendData.created.count +
			(backendData.updated?.count || 0) +
			backendData.skipped.count;

		return {
			total,
			created: {
				count: backendData.created.count,
				data: backendData.created.data || [],
			},
			updated: backendData.updated
				? {
						count: backendData.updated.count,
						data: backendData.updated.data || [],
					}
				: undefined,
			skipped: {
				count: backendData.skipped.count,
				data: backendData.skipped.data || [],
			},
			duplicates_in_file: backendData.duplicates_in_file
				? {
						count: backendData.duplicates_in_file.count,
						data: backendData.duplicates_in_file.data || [],
					}
				: undefined,
			errors: {
				count: backendData.errors.count,
				data: backendData.errors.data || [],
			},
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
	options?: { full?: boolean },
): Promise<ImportTicketsResponse> {
	return importTickets(file, { ...options, dryRun: true });
}
