import { restClient } from "@/utils/rest-api";
import type { ContractorDashboardResponse } from "./response";

/**
 * Get contractor dashboard data in a single optimized call
 * Returns summary stats and per-event analytics for the current contractor
 */
export async function getContractorDashboard(): Promise<ContractorDashboardResponse> {
	return restClient.get<ContractorDashboardResponse>("v1/contractor/dashboard");
}
