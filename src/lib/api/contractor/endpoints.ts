import { restClient } from "@/utils/rest-api";
import {
	type CreateContractorRequest,
	createContractorSchema,
	type ToggleStatusRequest,
	toggleStatusSchema,
	type UpdateContractorRequest,
	updateContractorSchema,
} from "./request";
import type {
	ContractorAssignedEvent,
	ExhibitionContractor,
	ExhibitionContractorProfile,
} from "./response";

/**
 * Get all exhibition contractors (users with exhibition_contractor role)
 */
export async function getContractors(): Promise<ExhibitionContractor[]> {
	return restClient.get<ExhibitionContractor[]>("v1/exhibition_contractors");
}

/**
 * Get a single exhibition contractor by id
 */
export async function getContractor(id: number): Promise<ExhibitionContractor> {
	return restClient.get<ExhibitionContractor>(
		`v1/exhibition_contractors/${id}`,
	);
}

/**
 * Create a new exhibition contractor (user + profile)
 */
export async function createContractor(
	data: CreateContractorRequest,
): Promise<ExhibitionContractor> {
	const validated = createContractorSchema.parse(data);
	return restClient.post<ExhibitionContractor>("v1/exhibition_contractors", {
		exhibition_contractor: validated,
	});
}

/**
 * Update an exhibition contractor
 */
export async function updateContractor(
	id: number,
	data: UpdateContractorRequest,
): Promise<ExhibitionContractor> {
	const validated = updateContractorSchema.parse(data);
	return restClient.patch<ExhibitionContractor>(
		`v1/exhibition_contractors/${id}`,
		{
			exhibition_contractor: validated,
		},
	);
}

/**
 * Toggle exhibition contractor status (active/inactive)
 */
export async function toggleContractorStatus(
	id: number,
	data: ToggleStatusRequest,
): Promise<ExhibitionContractor> {
	const validated = toggleStatusSchema.parse(data);
	return restClient.patch<ExhibitionContractor>(
		`v1/exhibition_contractors/${id}/toggle_status`,
		validated,
	);
}

/**
 * Delete an exhibition contractor
 */
export async function deleteContractor(
	id: number,
): Promise<ExhibitionContractor> {
	return restClient.delete<ExhibitionContractor>(
		`v1/exhibition_contractors/${id}`,
	);
}

// ============================================
// Exhibition Contractor Profile endpoints
// (for profile-only operations)
// ============================================

/**
 * Get a single exhibition contractor profile by id
 */
export async function getContractorProfile(
	id: number,
): Promise<ExhibitionContractorProfile> {
	return restClient.get<ExhibitionContractorProfile>(
		`v1/exhibition_contractor_profiles/${id}`,
	);
}

/**
 * Update an exhibition contractor profile
 */
export async function updateContractorProfile(
	id: number,
	data: Partial<
		Omit<
			ExhibitionContractorProfile,
			"id" | "user_id" | "created_at" | "updated_at"
		>
	>,
): Promise<ExhibitionContractorProfile> {
	return restClient.patch<ExhibitionContractorProfile>(
		`v1/exhibition_contractor_profiles/${id}`,
		{
			exhibition_contractor_profile: data,
		},
	);
}

/**
 * Get events assigned to an exhibition contractor
 */
export async function getContractorAssignedEvents(
	contractorId: number,
): Promise<ContractorAssignedEvent[]> {
	return restClient.get<ContractorAssignedEvent[]>(
		`v1/exhibition_contractors/${contractorId}/assigned_events`,
	);
}
