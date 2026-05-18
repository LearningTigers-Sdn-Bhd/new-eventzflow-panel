import { publicRestClient, restClient } from "@/utils/rest-api";
import { type SubmitWishRequest, submitWishSchema } from "./request";
import type { WishListResponse, WishResponse } from "./response";

export async function submitWish(slug: string, data: SubmitWishRequest) {
	return publicRestClient.post<WishResponse>(
		`v1/public/events/${slug}/wishes`,
		submitWishSchema.parse(data),
	);
}

export async function fetchApprovedWishes(slug: string) {
	return publicRestClient.get<WishListResponse>(
		`v1/public/events/${slug}/wishes`,
	);
}

export async function listWishes(eventId: string, status?: string) {
	const suffix = status ? `?status=${status}` : "";
	return restClient.get<WishListResponse>(
		`v1/events/${eventId}/wishes${suffix}`,
	);
}

export async function approveWish(eventId: string, wishId: number) {
	return restClient.patch<WishResponse>(
		`v1/events/${eventId}/wishes/${wishId}/approve`,
	);
}

export async function rejectWish(eventId: string, wishId: number) {
	return restClient.patch<WishResponse>(
		`v1/events/${eventId}/wishes/${wishId}/reject`,
	);
}

export async function deleteWish(eventId: string, wishId: number) {
	return restClient.delete(`v1/events/${eventId}/wishes/${wishId}`);
}
