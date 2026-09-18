// src/lib/api/system-activity/endpoints.ts

import { restClient } from "@/utils/rest-api";
import type { SystemActivityResponse } from "./types";

export interface GetSystemActivityParams {
	page?: number;
	per_page?: number;
	user_id?: number;
	category?: string;
	include_superadmin?: boolean;
}

export async function getSystemActivity(
	params: GetSystemActivityParams = {},
): Promise<SystemActivityResponse> {
	const searchParams = new URLSearchParams();
	if (params.page) searchParams.set("page", String(params.page));
	if (params.per_page) searchParams.set("per_page", String(params.per_page));
	if (params.user_id) searchParams.set("user_id", String(params.user_id));
	if (params.category) searchParams.set("category", params.category);
	if (params.include_superadmin) searchParams.set("include_superadmin", "true");

	const queryString = searchParams.toString();
	const url = `v1/superadmin/system_activity${queryString ? `?${queryString}` : ""}`;

	return restClient.get<SystemActivityResponse>(url);
}
