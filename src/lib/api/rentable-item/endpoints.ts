import { restClient } from "@/utils/rest-api";
import {
	type CreateRentableItemRequest,
	createRentableItemSchema,
	type UpdateRentableItemRequest,
	updateRentableItemSchema,
	type DeleteRentableItemRequest,
	deleteRentableItemSchema,
} from "./request";
import type {
	BackendRentableItem,
	RentableItem,
	CreateRentableItemResponse,
	UpdateRentableItemResponse,
	DeleteRentableItemResponse,
} from "./response";

// Transform backend response to frontend format
function transformRentableItem(backend: BackendRentableItem): RentableItem {
	return {
		id: backend.id,
		name: backend.name,
		description: backend.description,
		unitOfMeasure: backend.unit_of_measure,
		defaultPrice: Number(backend.default_price),
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
 * Get all rentable items
 */
export async function getRentableItems(): Promise<RentableItem[]> {
	try {
		const response = await restClient.get<BackendRentableItem[]>("v1/rentable_items");
		return response.map(transformRentableItem);
	} catch (error: unknown) {
		console.error("Error fetching rentable items:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch rentable items";
		throw new Error(errorMessage);
	}
}

/**
 * Get a specific rentable item
 */
export async function getRentableItem(id: number): Promise<RentableItem> {
	try {
		const response = await restClient.get<BackendRentableItem>(`v1/rentable_items/${id}`);
		return transformRentableItem(response);
	} catch (error: unknown) {
		console.error("Error fetching rentable item:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch rentable item";
		throw new Error(errorMessage);
	}
}

/**
 * Create a new rentable item
 */
export async function createRentableItem(
	data: CreateRentableItemRequest,
): Promise<CreateRentableItemResponse> {
	try {
		const validated = createRentableItemSchema.parse(data);

		const formData = new FormData();
		formData.append("rentable_item[name]", validated.name);
		if (validated.description) {
			formData.append("rentable_item[description]", validated.description);
		}
		formData.append("rentable_item[unit_of_measure]", validated.unit_of_measure);
		formData.append("rentable_item[default_price]", String(validated.default_price));
		formData.append("rentable_item[status]", validated.status);
		formData.append("rentable_item[item_category_id]", String(validated.item_category_id));
		if (validated.image) {
			formData.append("rentable_item[image]", validated.image);
		}

		const response = await restClient.postFormData<BackendRentableItem>(
			"v1/rentable_items",
			formData,
		);

		return {
			success: true,
			item: transformRentableItem(response),
		};
	} catch (error: unknown) {
		console.error("Error creating rentable item:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to create rentable item";
		throw new Error(errorMessage);
	}
}

/**
 * Update an existing rentable item
 */
export async function updateRentableItem(
	data: UpdateRentableItemRequest,
): Promise<UpdateRentableItemResponse> {
	try {
		const validated = updateRentableItemSchema.parse(data);

		const formData = new FormData();
		formData.append("rentable_item[name]", validated.name);
		if (validated.description) {
			formData.append("rentable_item[description]", validated.description);
		}
		formData.append("rentable_item[unit_of_measure]", validated.unit_of_measure);
		formData.append("rentable_item[default_price]", String(validated.default_price));
		formData.append("rentable_item[status]", validated.status);
		formData.append("rentable_item[item_category_id]", String(validated.item_category_id));
		if (validated.image) {
			formData.append("rentable_item[image]", validated.image);
		}
		if (validated.remove_image) {
			formData.append("remove_image", "true");
		}

		const response = await restClient.patchFormData<BackendRentableItem>(
			`v1/rentable_items/${validated.id}`,
			formData,
		);

		return {
			success: true,
			item: transformRentableItem(response),
		};
	} catch (error: unknown) {
		console.error("Error updating rentable item:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to update rentable item";
		throw new Error(errorMessage);
	}
}

/**
 * Delete a rentable item
 */
export async function deleteRentableItem(
	data: DeleteRentableItemRequest,
): Promise<DeleteRentableItemResponse> {
	try {
		const validated = deleteRentableItemSchema.parse(data);

		const response = await restClient.delete<BackendRentableItem>(
			`v1/rentable_items/${validated.id}`,
		);

		return {
			success: true,
			item: transformRentableItem(response),
		};
	} catch (error: unknown) {
		console.error("Error deleting rentable item:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to delete rentable item";
		throw new Error(errorMessage);
	}
}
