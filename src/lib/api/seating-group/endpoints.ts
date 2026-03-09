import { restClient } from "@/utils/rest-api";
import type {
	AddSeatingGroupMemberRequest,
	AssignSeatingGroupToTableRequest,
	CreateSeatingGroupRequest,
	UpdateSeatingGroupRequest,
} from "./request";
import type {
	SeatingGroup,
	SeatingGroupAssignResult,
	SeatingGroupMember,
} from "./response";

export async function getSeatingGroups(
	planId: number | string,
): Promise<SeatingGroup[]> {
	return restClient.get<SeatingGroup[]>(`v1/plans/${planId}/seating_groups`);
}

export async function createSeatingGroup(
	planId: number | string,
	data: CreateSeatingGroupRequest,
): Promise<SeatingGroup> {
	return restClient.post<SeatingGroup>(`v1/plans/${planId}/seating_groups`, {
		seating_group: data,
	});
}

export async function updateSeatingGroup(
	planId: number | string,
	groupId: number | string,
	data: UpdateSeatingGroupRequest,
): Promise<SeatingGroup> {
	return restClient.patch<SeatingGroup>(
		`v1/plans/${planId}/seating_groups/${groupId}`,
		{
			seating_group: data,
		},
	);
}

export async function deleteSeatingGroup(
	planId: number | string,
	groupId: number | string,
): Promise<void> {
	return restClient.delete(`v1/plans/${planId}/seating_groups/${groupId}`);
}

export async function addSeatingGroupMember(
	planId: number | string,
	groupId: number | string,
	data: AddSeatingGroupMemberRequest,
): Promise<SeatingGroupMember> {
	return restClient.post<SeatingGroupMember>(
		`v1/plans/${planId}/seating_groups/${groupId}/members`,
		data,
	);
}

export async function removeSeatingGroupMember(
	planId: number | string,
	groupId: number | string,
	memberId: number | string,
): Promise<void> {
	return restClient.delete(
		`v1/plans/${planId}/seating_groups/${groupId}/members/${memberId}`,
	);
}

export async function assignSeatingGroupToTable(
	planId: number | string,
	groupId: number | string,
	data: AssignSeatingGroupToTableRequest,
): Promise<SeatingGroupAssignResult> {
	return restClient.post<SeatingGroupAssignResult>(
		`v1/plans/${planId}/seating_groups/${groupId}/assign_to_table`,
		data,
	);
}
