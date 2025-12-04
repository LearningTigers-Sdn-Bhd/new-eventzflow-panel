export interface ApiEndpoint {
	id: string;
	title: string;
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	endpoint: string;
	description: string;
	category: string;
	headers?: Record<string, string>;
	requestBody?: object;
	response?: object;
}

export const API_BASE_URL = "https://api.eventzflow.com";

export const API_CATEGORIES = [
	"Events",
	"Tickets",
	"Visitors",
	"Vouchers",
	"Vendors",
	"Exhibitor Kits",
];

const DEFAULT_HEADERS = { Authorization: "YOUR_API_KEY" };
const JSON_HEADERS = { Authorization: "YOUR_API_KEY", "Content-Type": "application/json" };
const FORM_HEADERS = { Authorization: "YOUR_API_KEY", "Content-Type": "multipart/form-data" };

// ============ EVENTS ============
const EVENT_ENDPOINTS: ApiEndpoint[] = [
	{
		id: "list-events",
		title: "List Events",
		method: "GET",
		endpoint: "/v1/events",
		category: "Events",
		description: "Lists all events managed or staffed by the authenticated user.",
		headers: DEFAULT_HEADERS,
		response: [
			{
				id: 1,
				title: "My Event",
				status: "draft",
				start_date: "2024-03-15T09:00:00Z",
				end_date: "2024-03-16T18:00:00Z",
				payment_status: "paid",
			},
		],
	},
	{
		id: "get-event",
		title: "Get Event",
		method: "GET",
		endpoint: "/v1/events/{id}",
		category: "Events",
		description: "Retrieves a specific event by ID.",
		headers: DEFAULT_HEADERS,
		response: {
			id: 1,
			title: "My Event",
			description: "Event description",
			status: "draft",
			multiple_scans: false,
			start_date: "2024-03-15T09:00:00Z",
			end_date: "2024-03-16T18:00:00Z",
			location: "Convention Center",
			webhook_url: null,
			labels_data: {},
			payment_status: "paid",
			price: "100.0",
			published: true,
			visibility: true,
		},
	},
	{
		id: "create-event",
		title: "Create Event",
		method: "POST",
		endpoint: "/v1/events",
		category: "Events",
		description: "Creates a new event. Only org_owner or organizer can create.",
		headers: JSON_HEADERS,
		requestBody: {
			title: "New Event",
			description: "Event description",
			start_date: "2024-06-01T09:00:00Z",
			end_date: "2024-06-02T18:00:00Z",
			price: 50.0,
			visibility: true,
		},
		response: {
			id: 2,
			title: "New Event",
			status: "draft",
			start_date: "2024-06-01T09:00:00Z",
			end_date: "2024-06-02T18:00:00Z",
			payment_status: "paid",
			price: "50.0",
		},
	},
	{
		id: "update-event",
		title: "Update Event",
		method: "PUT",
		endpoint: "/v1/events/{id}",
		category: "Events",
		description: "Updates an existing event.",
		headers: JSON_HEADERS,
		requestBody: {
			title: "Updated Title",
			description: "Updated description",
			status: "published",
		},
		response: {
			id: 1,
			title: "Updated Title",
			description: "Updated description",
			status: "published",
		},
	},
	{
		id: "delete-event",
		title: "Delete Event",
		method: "DELETE",
		endpoint: "/v1/events/{id}",
		category: "Events",
		description: "Archives/deletes an event (soft delete).",
		headers: DEFAULT_HEADERS,
	},
];


// ============ TICKETS ============
const TICKET_ENDPOINTS: ApiEndpoint[] = [
	{
		id: "list-tickets",
		title: "List Event Tickets",
		method: "GET",
		endpoint: "/v1/events/{event_id}/tickets",
		category: "Tickets",
		description: "Lists all tickets for a specific event.",
		headers: DEFAULT_HEADERS,
		response: [
			{
				id: 1,
				public_id: "abc123-def456",
				attendee_name: "John Doe",
				attendee_email: "john@example.com",
				attendee_phone: "+1234567890",
				status: "purchased",
				payment_status: "paid",
				checked_in: false,
				ticket_type: { id: 1, name: "General Admission", price: "50.00" },
			},
		],
	},
	{
		id: "get-ticket",
		title: "Get Ticket",
		method: "GET",
		endpoint: "/v1/events/{event_id}/tickets/{id}",
		category: "Tickets",
		description: "Retrieves a specific ticket by public ID.",
		headers: DEFAULT_HEADERS,
		response: {
			id: 1,
			public_id: "abc123-def456",
			attendee_name: "John Doe",
			attendee_email: "john@example.com",
			attendee_phone: "+1234567890",
			status: "purchased",
			payment_status: "paid",
			checked_in: false,
			custom_fields_data: { t_shirt_size: "L" },
			event_id: 1,
			ticket_type_id: 1,
			ticket_type: { id: 1, name: "General Admission", price: "50.00" },
		},
	},
	{
		id: "create-ticket",
		title: "Create Ticket",
		method: "POST",
		endpoint: "/v1/events/{event_id}/tickets",
		category: "Tickets",
		description: "Creates a new ticket for an event.",
		headers: JSON_HEADERS,
		requestBody: {
			ticket: {
				attendee_name: "John Doe",
				attendee_email: "john@example.com",
				attendee_phone: "+1234567890",
				ticket_type_id: 1,
				custom_fields_data: { t_shirt_size: "L" },
			},
		},
		response: {
			id: 1,
			public_id: "abc123-def456",
			attendee_name: "John Doe",
			attendee_email: "john@example.com",
			status: "purchased",
			payment_status: "paid",
			checked_in: false,
		},
	},
	{
		id: "update-ticket",
		title: "Update Ticket",
		method: "PATCH",
		endpoint: "/v1/events/{event_id}/tickets/{id}",
		category: "Tickets",
		description: "Updates an existing ticket.",
		headers: JSON_HEADERS,
		requestBody: {
			ticket: {
				attendee_name: "Jane Doe",
				attendee_email: "jane@example.com",
				payment_status: "paid",
			},
		},
		response: {
			id: 1,
			public_id: "abc123-def456",
			attendee_name: "Jane Doe",
			attendee_email: "jane@example.com",
			status: "purchased",
			payment_status: "paid",
		},
	},
	{
		id: "check-in-ticket",
		title: "Check-in Ticket",
		method: "PATCH",
		endpoint: "/v1/tickets/{public_id}/check_in",
		category: "Tickets",
		description: "Performs check-in using the ticket's public ID.",
		headers: DEFAULT_HEADERS,
		response: {
			id: 1,
			public_id: "abc123-def456",
			attendee_name: "John Doe",
			attendee_email: "john@example.com",
			status: "scanned",
			checked_in: true,
			ticket_type: { id: 1, name: "General Admission", price: "50.00" },
		},
	},
	{
		id: "delete-ticket",
		title: "Delete Ticket",
		method: "DELETE",
		endpoint: "/v1/events/{event_id}/tickets/{id}",
		category: "Tickets",
		description: "Cancels/deletes a ticket (soft delete).",
		headers: DEFAULT_HEADERS,
	},
];

// ============ VISITORS ============
const VISITOR_ENDPOINTS: ApiEndpoint[] = [
	{
		id: "list-visitors",
		title: "List Visitors",
		method: "GET",
		endpoint: "/v1/events/{event_id}/visitors",
		category: "Visitors",
		description: "Lists all visitors for an event.",
		headers: DEFAULT_HEADERS,
		response: [
			{
				id: 1,
				public_id: "vis-abc123",
				full_name: "John Doe",
				email: "john@example.com",
				phone: "+1234567890",
				gender: "male",
				age: 30,
			},
		],
	},
	{
		id: "get-visitor",
		title: "Get Visitor",
		method: "GET",
		endpoint: "/v1/events/{event_id}/visitors/{id}",
		category: "Visitors",
		description: "Retrieves a specific visitor by ID or public_id.",
		headers: DEFAULT_HEADERS,
		response: {
			id: 1,
			public_id: "vis-abc123",
			full_name: "John Doe",
			email: "john@example.com",
			phone: "+1234567890",
			gender: "male",
			age: 30,
		},
	},
	{
		id: "create-visitor",
		title: "Create Visitor",
		method: "POST",
		endpoint: "/v1/events/{event_id}/visitors",
		category: "Visitors",
		description: "Creates a new visitor for an event.",
		headers: JSON_HEADERS,
		requestBody: {
			visitor: {
				full_name: "John Doe",
				email: "john@example.com",
				phone: "+1234567890",
				gender: "male",
				age: 30,
			},
		},
		response: {
			id: 1,
			public_id: "vis-abc123",
			full_name: "John Doe",
			email: "john@example.com",
			phone: "+1234567890",
		},
	},
	{
		id: "update-visitor",
		title: "Update Visitor",
		method: "PATCH",
		endpoint: "/v1/events/{event_id}/visitors/{id}",
		category: "Visitors",
		description: "Updates an existing visitor.",
		headers: JSON_HEADERS,
		requestBody: {
			visitor: {
				full_name: "Jane Doe",
				email: "jane@example.com",
				phone: "+0987654321",
			},
		},
		response: {
			id: 1,
			public_id: "vis-abc123",
			full_name: "Jane Doe",
			email: "jane@example.com",
		},
	},
	{
		id: "delete-visitor",
		title: "Delete Visitor",
		method: "DELETE",
		endpoint: "/v1/events/{event_id}/visitors/{id}",
		category: "Visitors",
		description: "Deletes a visitor.",
		headers: DEFAULT_HEADERS,
	},
];


// ============ VOUCHERS ============
const VOUCHER_ENDPOINTS: ApiEndpoint[] = [
	{
		id: "list-vouchers",
		title: "List Vouchers",
		method: "GET",
		endpoint: "/v1/vouchers",
		category: "Vouchers",
		description: "Lists vouchers. Can filter by vendor_id or event_id query params.",
		headers: DEFAULT_HEADERS,
		response: {
			success: true,
			message: "Success",
			data: [
				{
					id: 1,
					title: "20% Off Deal",
					description: "Get 20% off on all items",
					voucher_uuid: "550e8400-e29b-41d4-a716-446655440000",
					voucher_code: "SAVE20",
					status: "active",
					vendor_id: 1,
					event_id: 1,
					voucher_type: "percentage",
					voucher_value: "20.00",
				},
			],
		},
	},
	{
		id: "get-voucher",
		title: "Get Voucher",
		method: "GET",
		endpoint: "/v1/vouchers/{id}",
		category: "Vouchers",
		description: "Retrieves a specific voucher by ID.",
		headers: DEFAULT_HEADERS,
		response: {
			success: true,
			message: "Success",
			data: {
				id: 1,
				title: "20% Off Deal",
				voucher_uuid: "550e8400-e29b-41d4-a716-446655440000",
				voucher_code: "SAVE20",
				status: "active",
				voucher_type: "percentage",
				voucher_value: "20.00",
			},
		},
	},
	{
		id: "create-voucher",
		title: "Create Voucher",
		method: "POST",
		endpoint: "/v1/vouchers",
		category: "Vouchers",
		description: "Creates a new voucher. Use multipart/form-data for image upload.",
		headers: FORM_HEADERS,
		requestBody: {
			title: "Summer Sale",
			description: "Get 25% off",
			voucher_code: "SUMMER25",
			voucher_type: "percentage",
			voucher_value: 25,
			event_id: 1,
			start_date: "2024-06-01",
			end_date: "2024-08-31",
		},
		response: {
			success: true,
			message: "Success",
			data: { id: 2, title: "Summer Sale", voucher_code: "SUMMER25" },
		},
	},
	{
		id: "update-voucher",
		title: "Update Voucher",
		method: "PATCH",
		endpoint: "/v1/vouchers/{id}",
		category: "Vouchers",
		description: "Updates an existing voucher.",
		headers: FORM_HEADERS,
		requestBody: { title: "Updated Summer Sale", voucher_value: 30 },
		response: {
			success: true,
			message: "Success",
			data: { id: 2, title: "Updated Summer Sale", voucher_value: "30.00" },
		},
	},
	{
		id: "delete-voucher",
		title: "Delete Voucher",
		method: "DELETE",
		endpoint: "/v1/vouchers/{id}",
		category: "Vouchers",
		description: "Deletes a voucher.",
		headers: DEFAULT_HEADERS,
	},
	{
		id: "redeem-voucher",
		title: "Redeem Voucher",
		method: "POST",
		endpoint: "/v1/voucher_redemptions",
		category: "Vouchers",
		description: "Redeems a voucher. Only vendors can redeem vouchers.",
		headers: JSON_HEADERS,
		requestBody: {
			voucher_uuid: "550e8400-e29b-41d4-a716-446655440000",
			net_amount: 75.0,
			user_id: 123,
		},
		response: {
			success: true,
			message: "Voucher redeemed successfully",
			data: { net_amount: "75.0", discount_applied: "25.0", voucher_type: "fixed_amount" },
		},
	},
];

// ============ VENDORS ============
const VENDOR_ENDPOINTS: ApiEndpoint[] = [
	{
		id: "list-event-vendors",
		title: "List Event Vendors",
		method: "GET",
		endpoint: "/v1/events/{event_id}/vendors",
		category: "Vendors",
		description: "Lists all vendors assigned to an event.",
		headers: DEFAULT_HEADERS,
		response: [
			{
				id: 1,
				event_id: 1,
				vendor_id: 10,
				type: "Exhibitor",
				redirect_url: "https://example.com",
				vendor: {
					id: 10,
					email: "vendor@example.com",
					full_name: "Vendor Company",
					role: "vendor",
				},
				exhibitor_kit: { id: 1, booth_number: "A101", booth_type: "shell_scheme" },
			},
		],
	},
	{
		id: "create-event-vendor",
		title: "Create Event Vendor",
		method: "POST",
		endpoint: "/v1/events/{event_id}/vendors",
		category: "Vendors",
		description: "Creates a new vendor for an event. Only org_owner or organizer can create.",
		headers: JSON_HEADERS,
		requestBody: {
			vendor: {
				full_name: "John Doe",
				email: "vendor@example.com",
				password: "securepassword",
				password_confirmation: "securepassword",
				redirect_url: "https://example.com",
				exhibitor_kit_attributes: {
					booth_number: "A101",
					booth_type: "shell_scheme",
					name_on_fascia: "Company Name",
					company_name: "Exhibitor Co.",
					company_address: "123 Exhibitor St.",
					pic_full_name: "PIC Name",
					pic_contact_number: "+1234567890",
					pic_email_address: "pic@example.com",
				},
			},
		},
		response: {
			id: 1,
			event_id: 1,
			vendor_id: 10,
			type: "Exhibitor",
			redirect_url: "https://example.com",
		},
	},
	{
		id: "update-event-vendor",
		title: "Update Event Vendor",
		method: "PATCH",
		endpoint: "/v1/events/{event_id}/vendors/{id}",
		category: "Vendors",
		description: "Updates an existing vendor assignment.",
		headers: JSON_HEADERS,
		requestBody: {
			vendor: {
				redirect_url: "https://updated.com",
				exhibitor_kit_attributes: { id: 1, booth_number: "B202" },
			},
		},
		response: { id: 1, event_id: 1, redirect_url: "https://updated.com" },
	},
	{
		id: "create-vendor-user",
		title: "Create Vendor User",
		method: "POST",
		endpoint: "/v1/vendors",
		category: "Vendors",
		description: "Creates a new vendor user account.",
		headers: JSON_HEADERS,
		requestBody: {
			vendor: {
				full_name: "John Doe",
				email: "vendor@example.com",
				password: "securepassword",
				password_confirmation: "securepassword",
			},
		},
		response: { id: 10, email: "vendor@example.com", full_name: "John Doe", role: "vendor" },
	},
];

// ============ EXHIBITOR KITS ============
const EXHIBITOR_KIT_ENDPOINTS: ApiEndpoint[] = [
	{
		id: "list-exhibitor-kits",
		title: "List Exhibitor Kits",
		method: "GET",
		endpoint: "/v1/events/{event_id}/exhibitor_kits",
		category: "Exhibitor Kits",
		description: "Lists all exhibitor kits for an event.",
		headers: DEFAULT_HEADERS,
		response: [
			{
				id: 1,
				event_vendor_id: 1,
				booth_number: "A101",
				booth_type: "shell_scheme",
				company_name: "Exhibitor Co.",
				pic_full_name: "PIC Name",
				pic_contact_number: "+1234567890",
				pic_email_address: "pic@example.com",
			},
		],
	},
	{
		id: "create-exhibitor-kit",
		title: "Create Exhibitor Kit",
		method: "POST",
		endpoint: "/v1/events/{event_id}/exhibitor_kits",
		category: "Exhibitor Kits",
		description: "Creates a new exhibitor kit for an event vendor.",
		headers: JSON_HEADERS,
		requestBody: {
			event_vendor_id: 1,
			booth_number: "A101",
			booth_type: "shell_scheme",
			name_on_fascia: "Company Name",
			company_name: "Exhibitor Co.",
			company_address: "123 Exhibitor St.",
			pic_full_name: "PIC Name",
			pic_contact_number: "+1234567890",
			pic_email_address: "pic@example.com",
		},
		response: { id: 1, booth_number: "A101", booth_type: "shell_scheme" },
	},
	{
		id: "update-exhibitor-kit",
		title: "Update Exhibitor Kit",
		method: "PATCH",
		endpoint: "/v1/events/{event_id}/exhibitor_kits/{id}",
		category: "Exhibitor Kits",
		description: "Updates an existing exhibitor kit.",
		headers: JSON_HEADERS,
		requestBody: { booth_number: "B202", payment_status: "paid" },
		response: { id: 1, booth_number: "B202", payment_status: "paid" },
	},
];

// Export all endpoints combined
export const API_ENDPOINTS: ApiEndpoint[] = [
	...EVENT_ENDPOINTS,
	...TICKET_ENDPOINTS,
	...VISITOR_ENDPOINTS,
	...VOUCHER_ENDPOINTS,
	...VENDOR_ENDPOINTS,
	...EXHIBITOR_KIT_ENDPOINTS,
];
