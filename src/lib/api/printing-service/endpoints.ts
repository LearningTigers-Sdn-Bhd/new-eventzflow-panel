import { restClient } from "@/utils/rest-api";
import {
	type CreatePrintingServiceRequest,
	createPrintingServiceSchema,
	type DeletePrintingServiceRequest,
	deletePrintingServiceSchema,
	type UpdatePrintingServiceRequest,
	updatePrintingServiceSchema,
} from "./request";
import type {
	BackendPrintingService,
	CreatePrintingServiceResponse,
	DeletePrintingServiceResponse,
	PrintingService,
	UpdatePrintingServiceResponse,
} from "./response";

// Transform backend response to frontend format
function transformPrintingService(
	backend: BackendPrintingService,
): PrintingService {
	return {
		id: backend.id,
		name: backend.name,
		description: backend.description,
		unitOfMeasure: backend.unit_of_measure,
		defaultPrice: backend.default_price,
		status: backend.status,
		itemCategoryId: backend.item_category_id,
		itemCategory: backend.item_category
			? {
					id: backend.item_category.id,
					name: backend.item_category.name,
					active: backend.item_category.active,
					createdAt: backend.item_category.created_at,
					updatedAt: backend.item_category.updated_at,
				}
			: undefined,
		userId: backend.user_id,
		imageUrl: backend.image_url,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

/**
 * Get all printing services
 */
export async function getPrintingServices(): Promise<PrintingService[]> {
	try {
		const response = await restClient.get<BackendPrintingService[]>(
			"v1/printing_services",
		);
		return response.map(transformPrintingService);
	} catch (error: unknown) {
		console.error("Error fetching printing services:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to fetch printing services";
		throw new Error(errorMessage);
	}
}

/**
 * Get a specific printing service
 */
export async function getPrintingService(id: number): Promise<PrintingService> {
	try {
		const response = await restClient.get<BackendPrintingService>(
			`v1/printing_services/${id}`,
		);
		return transformPrintingService(response);
	} catch (error: unknown) {
		console.error("Error fetching printing service:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to fetch printing service";
		throw new Error(errorMessage);
	}
}

/**
 * Create a new printing service
 */
export async function createPrintingService(
	data: CreatePrintingServiceRequest,
): Promise<CreatePrintingServiceResponse> {
	try {
		const validated = createPrintingServiceSchema.parse(data);

		const formData = new FormData();
		formData.append("printing_service[name]", validated.name);
		if (validated.description) {
			formData.append("printing_service[description]", validated.description);
		}
		formData.append(
			"printing_service[unit_of_measure]",
			validated.unit_of_measure,
		);
		formData.append(
			"printing_service[default_price]",
			String(validated.default_price),
		);
		formData.append("printing_service[status]", validated.status);
		formData.append(
			"printing_service[item_category_id]",
			String(validated.item_category_id),
		);
		if (validated.image) {
			formData.append("printing_service[image]", validated.image);
		}

		const response = await restClient.postFormData<BackendPrintingService>(
			"v1/printing_services",
			formData,
		);

		return {
			success: true,
			service: transformPrintingService(response),
		};
	} catch (error: unknown) {
		console.error("Error creating printing service:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to create printing service";
		throw new Error(errorMessage);
	}
}

/**
 * Update an existing printing service
 */
export async function updatePrintingService(
	data: UpdatePrintingServiceRequest,
): Promise<UpdatePrintingServiceResponse> {
	try {
		const validated = updatePrintingServiceSchema.parse(data);

		const formData = new FormData();
		formData.append("printing_service[name]", validated.name);
		if (validated.description) {
			formData.append("printing_service[description]", validated.description);
		}
		formData.append(
			"printing_service[unit_of_measure]",
			validated.unit_of_measure,
		);
		formData.append(
			"printing_service[default_price]",
			String(validated.default_price),
		);
		formData.append("printing_service[status]", validated.status);
		formData.append(
			"printing_service[item_category_id]",
			String(validated.item_category_id),
		);
		if (validated.image) {
			formData.append("printing_service[image]", validated.image);
		}
		if (validated.remove_image) {
			formData.append("remove_image", "true");
		}

		const response = await restClient.patchFormData<BackendPrintingService>(
			`v1/printing_services/${validated.id}`,
			formData,
		);

		return {
			success: true,
			service: transformPrintingService(response),
		};
	} catch (error: unknown) {
		console.error("Error updating printing service:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to update printing service";
		throw new Error(errorMessage);
	}
}

/**
 * Delete a printing service
 */
export async function deletePrintingService(
	data: DeletePrintingServiceRequest,
): Promise<DeletePrintingServiceResponse> {
	try {
		const validated = deletePrintingServiceSchema.parse(data);

		const response = await restClient.delete<BackendPrintingService>(
			`v1/printing_services/${validated.id}`,
		);

		return {
			success: true,
			service: transformPrintingService(response),
		};
	} catch (error: unknown) {
		console.error("Error deleting printing service:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to delete printing service";
		throw new Error(errorMessage);
	}
}
