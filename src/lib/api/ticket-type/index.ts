// Request types and schemas

// API endpoints
export {
	createTicketType,
	deleteTicketType,
	getEventTicketTypes,
	getGlobalTicketTypes,
	getTicketType,
	updateTicketType,
} from "./endpoints";
export {
	type CreateTicketTypeRequest,
	createTicketTypeSchema,
	type DeleteTicketTypeRequest,
	deleteTicketTypeSchema,
	type GetEventTicketTypesRequest,
	type GetTicketTypeRequest,
	getEventTicketTypesSchema,
	getTicketTypeSchema,
	type UpdateTicketTypeRequest,
	updateTicketTypeSchema,
} from "./request";
// Response types
export type {
	BackendTicketType,
	CreateTicketTypeResponse,
	DeleteTicketTypeResponse,
	TicketType,
	UpdateTicketTypeResponse,
} from "./response";
