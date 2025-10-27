// Request types and schemas

// API endpoints
export {
	assignStaff,
	getAvailableTeamMembers,
	getEventStaff,
	removeStaff,
	updateStaffRole,
} from "./endpoints";
export {
	type AssignStaffRequest,
	assignStaffSchema,
	type GetAvailableTeamMembersRequest,
	type GetEventStaffRequest,
	getAvailableTeamMembersSchema,
	getEventStaffSchema,
	type RemoveStaffRequest,
	removeStaffSchema,
} from "./request";
// Response types
export type {
	AssignStaffResponse,
	AvailableTeamMember,
	BackendEventAssignment,
	BackendEventStaffResponse,
	BackendUser,
	EventStaffMember,
	RemoveStaffResponse,
	UpdateStaffRoleResponse,
} from "./response";
