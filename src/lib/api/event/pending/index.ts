// Request types and schemas

// API endpoints
export {
	acceptWaitingList,
	approveTicketApplication,
	approveTicketRsvp,
	createPendingTicket,
	type GetPendingTicketsPagedOptions,
	getPendingTicketsPaged,
	rejectTicketApplication,
	resendTicketRsvp,
	revertTicketApplication,
	updatePendingTicket,
} from "./endpoints";
export {
	type AcceptWaitingListRequest,
	type ApproveTicketApplicationRequest,
	type ApproveTicketRsvpRequest,
	acceptWaitingListSchema,
	approveTicketApplicationSchema,
	approveTicketRsvpSchema,
	type CreatePendingTicketRequest,
	createPendingTicketSchema,
	type RejectTicketApplicationRequest,
	type ResendTicketRsvpRequest,
	type RevertTicketApplicationRequest,
	rejectTicketApplicationSchema,
	resendTicketRsvpSchema,
	revertTicketApplicationSchema,
	type UpdatePendingTicketRequest,
	updatePendingTicketSchema,
} from "./request";
// Response types
export type {
	BackendPendingTicket,
	BackendTicketApplication,
	CreatePendingTicketResponse,
	PagedPendingTicketsResult,
	PendingTicket,
	PendingTicketsPagination,
	ReviewStatus,
	RsvpStatus,
	UpdatePendingTicketResponse,
} from "./response";
