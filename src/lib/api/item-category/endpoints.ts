import { restClient } from "@/utils/rest-api";
import {
	type CreateItemCategoryRequest,
	createItemCategorySchema,
	type UpdateItemCategoryRequest,
	updateItemCategorySchema,
	type DeleteItemCategoryRequest,
	deleteItemCategorySchema,
} from "./request";
import type {
	BackendItemCategory,
	ItemCategory,
	CreateItemCategoryResponse,
	UpdateItemCategoryResponse,
	DeleteItemCategoryResponse,
	ToggleItemCategoryStatusResponse,
} from "./response";

// Transform backend response to frontend format
function transformItemCategory(backend: BackendItemCategory): ItemCategory {
	return {
		id: backend.id,
		name: backend.name,
		active: backend.active,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

/**
 * Get all item categories
 */
export async function getItemCategories(): Promise<ItemCategory[]> {
	try {
		const response = await restClient.get<BackendItemCategory[]>("v1/item_categories");
		return response.map(transformItemCategory);
	} catch (error: unknown) {
		console.error("Error fetching item categories:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch item categories";
		throw new Error(errorMessage);
	}
}

/**
 * Get a specific item category
 */
export async function getItemCategory(id: number): Promise<ItemCategory> {
	try {
		const response = await restClient.get<BackendItemCategory>(`v1/item_categories/${id}`);
		return transformItemCategory(response);
	} catch (error: unknown) {
		console.error("Error fetching item category:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch item category";
		throw new Error(errorMessage);
	}
}

/**
 * Create a new item category
 */
export async function createItemCategory(
	data: CreateItemCategoryRequest,
): Promise<CreateItemCategoryResponse> {
	try {
		const validated = createItemCategorySchema.parse(data);

		const response = await restClient.post<BackendItemCategory>("v1/item_categories", {
			name: validated.name,
			active: validated.active,
		});

		return {
			success: true,
			category: transformItemCategory(response),
		};
	} catch (error: unknown) {
		console.error("Error creating item category:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to create item category";
		throw new Error(errorMessage);
	}
}

/**
 * Update an existing item category
 */
export async function updateItemCategory(
	data: UpdateItemCategoryRequest,
): Promise<UpdateItemCategoryResponse> {
	try {
		const validated = updateItemCategorySchema.parse(data);

		const response = await restClient.patch<BackendItemCategory>(
			`v1/item_categories/${validated.id}`,
			{
				name: validated.name,
				active: validated.active,
			},
		);

		return {
			success: true,
			category: transformItemCategory(response),
		};
	} catch (error: unknown) {
		console.error("Error updating item category:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to update item category";
		throw new Error(errorMessage);
	}
}

/**
 * Delete an item category
 */
export async function deleteItemCategory(
	data: DeleteItemCategoryRequest,
): Promise<DeleteItemCategoryResponse> {
	try {
		const validated = deleteItemCategorySchema.parse(data);

		const response = await restClient.delete<BackendItemCategory>(
			`v1/item_categories/${validated.id}`,
		);

		return {
			success: true,
			category: transformItemCategory(response),
		};
	} catch (error: unknown) {
		console.error("Error deleting item category:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to delete item category";
		throw new Error(errorMessage);
	}
}
