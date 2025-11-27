import { restClient } from "@/utils/rest-api";
import type { VendorDashboardResponse } from "./response";

/**
 * Get vendor dashboard data in a single optimized call
 * Returns summary stats and per-event analytics for the current vendor
 */
export async function getVendorDashboard(): Promise<VendorDashboardResponse> {
	return restClient.get<VendorDashboardResponse>("v1/vendor/dashboard");
}
