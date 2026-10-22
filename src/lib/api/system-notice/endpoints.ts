import { kyPublicClient, restClient } from "@/utils/rest-api";
import {
	type UpdateSystemNoticeRequest,
	updateSystemNoticeSchema,
} from "./request";
import type {
	BackendPublicSystemNoticeResponse,
	BackendSystemNoticeResponse,
	SystemNotice,
} from "./response";

export const PUBLIC_SYSTEM_NOTICE_QUERY_KEY = ["public-system-notice"];

// Public: the banner text everyone sees, or null while the notice is off.
// `no-store` skips the browser's HTTP cache (the backend sends max-age=30), so
// a refetch right after saving shows the new state instead of a stale one.
export async function getPublicSystemNoticeMessage(): Promise<string | null> {
	const response = await kyPublicClient
		.get("v1/public/system_notice", { cache: "no-store" })
		.json<BackendPublicSystemNoticeResponse>();
	return response.data.message;
}

// Org owners: the saved notice, including its text while switched off.
export async function getSystemNotice(): Promise<SystemNotice> {
	const response =
		await restClient.get<BackendSystemNoticeResponse>("v1/system_notice");
	return response.data;
}

export async function updateSystemNotice(
	data: UpdateSystemNoticeRequest,
): Promise<SystemNotice> {
	const validated = updateSystemNoticeSchema.parse(data);
	const response = await restClient.patch<BackendSystemNoticeResponse>(
		"v1/system_notice",
		validated,
	);
	return response.data;
}
