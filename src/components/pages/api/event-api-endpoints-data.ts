import type { Event } from "@/lib/api/event/response";

export interface ApiEndpoint {
	id: string;
	title: string;
	method: "GET" | "POST" | "PATCH" | "DELETE";
	endpoint: string;
	description: string;
	category: string;
	headers?: Record<string, string>;
	queryParams?: Record<string, string>;
	requestBody?: object;
	response?: object;
	visible?: (event: Event) => boolean;
}

export const API_BASE_URL = "https://api.eventzflow.com";

export const EVENT_API_CATEGORIES = [
	"Getting Started",
	"Tickets",
	"Check-In",
	"Visitors",
	"Ticket Types",
	"Vouchers",
	"Vendors",
	"Exhibitor Kits",
	"Analytics",
];

const AUTH_HEADER = { Authorization: "YOUR_EVENT_API_KEY" };
const JSON_HEADERS = {
	Authorization: "YOUR_EVENT_API_KEY",
	"Content-Type": "application/json",
};

// ============ GETTING STARTED ============
const GETTING_STARTED: ApiEndpoint[] = [
	{
		id: "get-event",
		title: "Get Event Details",
		method: "GET",
		endpoint: "/v1/events/{event_id}",
		category: "Getting Started",
		description:
			"Fetch the full details of your event — title, dates, venue, status, and feature flags. A great first call to confirm your key is working.",
		headers: AUTH_HEADER,
		response: {
			id: 42,
			title: "Tech Summit 2026",
			status: "published",
			visibility: true,
			start_date: "2026-08-01T09:00:00Z",
			end_date: "2026-08-02T18:00:00Z",
			venue_name: "Sabah International Convention Centre",
			venue_address: "Kota Kinabalu, Sabah",
			use_ticket: true,
			use_voucher: true,
		},
	},
];

// ============ TICKETS ============
const TICKET_ENDPOINTS: ApiEndpoint[] = [
	{
		id: "list-tickets",
		title: "List Tickets",
		method: "GET",
		endpoint: "/v1/events/{event_id}/tickets",
		category: "Tickets",
		visible: (e) => e.use_ticket,
		description:
			"Retrieve all tickets for your event. Each ticket includes attendee info, payment status, and check-in state. The `public_id` field is the value encoded in each attendee's QR code — use it with the Check-In endpoint or generate a QR image from it using any standard QR library.",
		headers: AUTH_HEADER,
		queryParams: {
			page: "Page number (default: 1)",
			per_page: "Results per page (default: 25, max: 100)",
			archived: "Set to 'true' to list only archived tickets",
		},
		response: [
			{
				id: 1,
				public_id: "abc123-def456",
				attendee_name: "Amirah Binti Hassan",
				attendee_email: "amirah@example.com",
				attendee_phone: "+60123456789",
				status: "purchased",
				payment_status: "paid",
				checked_in: false,
				ticket_type: { id: 1, name: "Early Bird", price: "99.00" },
			},
		],
	},
	{
		id: "get-ticket",
		title: "Get Ticket",
		method: "GET",
		endpoint: "/v1/events/{event_id}/tickets/{id}",
		category: "Tickets",
		visible: (e) => e.use_ticket,
		description:
			"Fetch a single ticket by its ID. Includes all attendee details and any custom field responses collected during registration.",
		headers: AUTH_HEADER,
		response: {
			id: 1,
			public_id: "abc123-def456",
			attendee_name: "Amirah Binti Hassan",
			attendee_email: "amirah@example.com",
			attendee_phone: "+60123456789",
			status: "purchased",
			payment_status: "paid",
			checked_in: false,
			custom_fields_data: {
				dietary_preference: "Vegetarian",
				t_shirt_size: "M",
			},
			ticket_type: { id: 1, name: "Early Bird", price: "99.00" },
		},
	},
	{
		id: "create-ticket",
		title: "Create Ticket",
		method: "POST",
		endpoint: "/v1/events/{event_id}/tickets",
		category: "Tickets",
		visible: (e) => e.use_ticket,
		description:
			"Register a new attendee by creating a ticket. Useful for importing registrations from an external form or payment system.",
		headers: JSON_HEADERS,
		requestBody: {
			ticket: {
				attendee_name: "Amirah Binti Hassan",
				attendee_email: "amirah@example.com",
				attendee_phone: "+60123456789",
				ticket_type_id: 1,
				payment_status: "paid",
				custom_fields_data: { dietary_preference: "Vegetarian" },
			},
		},
		response: {
			id: 2,
			public_id: "xyz789-uvw012",
			attendee_name: "Amirah Binti Hassan",
			attendee_email: "amirah@example.com",
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
		visible: (e) => e.use_ticket,
		description:
			"Update an attendee's details or payment status. Handy when a registration needs to be corrected after the fact.",
		headers: JSON_HEADERS,
		requestBody: {
			ticket: {
				attendee_name: "Amirah Hassan",
				payment_status: "paid",
			},
		},
		response: {
			id: 1,
			attendee_name: "Amirah Hassan",
			payment_status: "paid",
			status: "purchased",
		},
	},
	{
		id: "cancel-ticket",
		title: "Cancel Ticket",
		method: "PATCH",
		endpoint: "/v1/events/{event_id}/tickets/{id}/cancel_ticket",
		category: "Tickets",
		visible: (e) => e.use_ticket,
		description:
			"Cancel a ticket. The ticket status will be set to 'canceled'. This is a soft operation — the record is kept for audit purposes.",
		headers: AUTH_HEADER,
		response: {
			id: 1,
			public_id: "abc123-def456",
			status: "canceled",
			attendee_name: "Amirah Binti Hassan",
		},
	},
	{
		id: "archive-ticket",
		title: "Archive Ticket",
		method: "DELETE",
		endpoint: "/v1/events/{event_id}/tickets/{id}",
		category: "Tickets",
		visible: (e) => e.use_ticket,
		description:
			"Soft-archives a ticket (sets deleted_at). The ticket is hidden from default listings but can be retrieved with ?archived=true. This is not a permanent deletion.",
		headers: AUTH_HEADER,
	},
];

// ============ CHECK-IN ============
const CHECKIN_ENDPOINTS: ApiEndpoint[] = [
	{
		id: "check-in",
		title: "Check In (Unified)",
		method: "PATCH",
		endpoint: "/v1/scan/{public_id}/check_in",
		category: "Check-In",
		description:
			"The main check-in endpoint. Scan a QR code to get the `public_id`, then pass it here — works for both tickets and visitors. Returns the attendee's full details on success. Perfect for building a custom check-in kiosk or mobile scanner.",
		headers: AUTH_HEADER,
		response: {
			type: "ticket",
			public_id: "abc123-def456",
			checked_in: true,
			check_in_at: "2026-08-01T09:15:00Z",
			attendee_name: "Amirah Binti Hassan",
			attendee_email: "amirah@example.com",
			ticket_type: { id: 1, name: "Early Bird", price: 99.0 },
			event: { id: 42, title: "Tech Summit 2026" },
			scanned_by: { id: 5, full_name: "Ahmad Organizer" },
		},
	},
	{
		id: "recent-check-ins",
		title: "Recent Check-Ins",
		method: "GET",
		endpoint: "/v1/scan/recent_check_ins",
		category: "Check-In",
		description:
			"Retrieve the most recent check-ins scanned by the authenticated user. Useful for a live check-in feed or audit log. Returns both ticket and visitor check-ins combined.",
		headers: AUTH_HEADER,
		queryParams: {
			event_id: "Filter to a specific event (optional)",
			limit: "Number of records to return (default: 50, max: 100)",
		},
		response: {
			check_ins: [
				{
					type: "ticket",
					scan_id: "abc123-def456",
					name: "Amirah Binti Hassan",
					email: "amirah@example.com",
					ticket_type: "Early Bird",
					event_id: 42,
					event_name: "Tech Summit 2026",
					checked_in: true,
					check_in_at: "2026-08-01T09:15:00Z",
				},
			],
			total: 1,
			limit: 50,
		},
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
		visible: (e) => !e.use_ticket,
		description:
			"Retrieve all visitors for your event. The `public_id` field is the value encoded in each visitor's QR code — use it with the Check-In endpoint or generate a QR image from it using any standard QR library.",
		headers: AUTH_HEADER,
		response: [
			{
				id: 1,
				public_id: "vis-abc123",
				full_name: "Razif Bin Ahmad",
				email: "razif@example.com",
				phone: "+60198765432",
				gender: "male",
				rsvp_status: "attending",
				checked_in: false,
			},
		],
	},
	{
		id: "get-visitor",
		title: "Get Visitor",
		method: "GET",
		endpoint: "/v1/events/{event_id}/visitors/{id}",
		category: "Visitors",
		visible: (e) => !e.use_ticket,
		description: "Fetch a single visitor by their ID.",
		headers: AUTH_HEADER,
		response: {
			id: 1,
			public_id: "vis-abc123",
			full_name: "Razif Bin Ahmad",
			email: "razif@example.com",
			phone: "+60198765432",
			gender: "male",
			rsvp_status: "attending",
			checked_in: false,
		},
	},
	{
		id: "create-visitor",
		title: "Create Visitor",
		method: "POST",
		endpoint: "/v1/events/{event_id}/visitors",
		category: "Visitors",
		visible: (e) => !e.use_ticket,
		description:
			"Register a new visitor for your event. Use this to pre-register walk-in attendees from an external source.",
		headers: JSON_HEADERS,
		requestBody: {
			visitor: {
				full_name: "Razif Bin Ahmad",
				email: "razif@example.com",
				phone: "+60198765432",
				gender: "male",
			},
		},
		response: {
			id: 2,
			public_id: "vis-xyz789",
			full_name: "Razif Bin Ahmad",
			email: "razif@example.com",
			rsvp_status: "pending",
		},
	},
	{
		id: "update-visitor",
		title: "Update Visitor",
		method: "PATCH",
		endpoint: "/v1/events/{event_id}/visitors/{id}",
		category: "Visitors",
		visible: (e) => !e.use_ticket,
		description: "Update a visitor's details or RSVP status.",
		headers: JSON_HEADERS,
		requestBody: {
			visitor: {
				full_name: "Razif Ahmad",
				rsvp_status: "attending",
			},
		},
		response: {
			id: 1,
			full_name: "Razif Ahmad",
			rsvp_status: "attending",
		},
	},
];

// ============ TICKET TYPES ============
const TICKET_TYPE_ENDPOINTS: ApiEndpoint[] = [
	{
		id: "list-ticket-types",
		title: "List Ticket Types",
		method: "GET",
		endpoint: "/v1/events/{event_id}/ticket_types",
		category: "Ticket Types",
		visible: (e) => e.use_ticket,
		description:
			"Retrieve all ticket types for your event (e.g. Early Bird, VIP, General Admission). You'll need the ticket type IDs when creating tickets via the API.",
		headers: AUTH_HEADER,
		response: [
			{
				id: 1,
				name: "Early Bird",
				price: "99.00",
				status: "published",
				quantity: 200,
				sold_count: 45,
			},
			{
				id: 2,
				name: "VIP",
				price: "299.00",
				status: "published",
				quantity: 50,
				sold_count: 12,
			},
		],
	},
	{
		id: "get-ticket-type",
		title: "Get Ticket Type",
		method: "GET",
		endpoint: "/v1/events/{event_id}/ticket_types/{id}",
		category: "Ticket Types",
		visible: (e) => e.use_ticket,
		description: "Fetch a single ticket type by its ID.",
		headers: AUTH_HEADER,
		response: {
			id: 1,
			name: "Early Bird",
			price: "99.00",
			status: "published",
			quantity: 200,
			sold_count: 45,
			description: "Limited early bird pricing",
		},
	},
];

// ============ VOUCHERS ============
const VOUCHER_ENDPOINTS: ApiEndpoint[] = [
	{
		id: "list-event-vouchers",
		title: "List Event Vouchers",
		method: "GET",
		endpoint: "/v1/events/{event_id}/vouchers",
		category: "Vouchers",
		visible: (e) => e.use_voucher,
		description:
			"Retrieve all vouchers scoped to this event. This is the recommended way to list vouchers for a specific event.",
		headers: AUTH_HEADER,
		response: [
			{
				id: 1,
				title: "Early Bird Discount",
				voucher_code: "EARLY20",
				voucher_type: "percentage",
				voucher_value: "20.00",
				status: "active",
			},
		],
	},
	{
		id: "create-voucher",
		title: "Create Voucher",
		method: "POST",
		endpoint: "/v1/vouchers",
		category: "Vouchers",
		visible: (e) => e.use_voucher,
		description:
			"Create a new voucher for your event. Supports percentage discounts, fixed amount discounts, and free items.",
		headers: JSON_HEADERS,
		requestBody: {
			title: "Early Bird Discount",
			voucher_code: "EARLY20",
			voucher_type: "percentage",
			voucher_value: 20,
			event_id: 42,
			start_date: "2026-06-01",
			end_date: "2026-07-31",
		},
		response: {
			success: true,
			data: {
				id: 3,
				title: "Early Bird Discount",
				voucher_code: "EARLY20",
				status: "active",
			},
		},
	},
	{
		id: "update-voucher",
		title: "Update Voucher",
		method: "PATCH",
		endpoint: "/v1/vouchers/{id}",
		category: "Vouchers",
		visible: (e) => e.use_voucher,
		description:
			"Update an existing voucher's details or toggle its active/inactive status.",
		headers: JSON_HEADERS,
		requestBody: {
			status: "inactive",
		},
		response: {
			success: true,
			data: { id: 3, status: "inactive" },
		},
	},
	{
		id: "delete-voucher",
		title: "Delete Voucher",
		method: "DELETE",
		endpoint: "/v1/vouchers/{id}",
		category: "Vouchers",
		visible: (e) => e.use_voucher,
		description: "Permanently delete a voucher.",
		headers: AUTH_HEADER,
	},
];

// ============ VENDORS ============
const VENDOR_ENDPOINTS: ApiEndpoint[] = [
	{
		id: "list-vendors",
		title: "List Event Vendors",
		method: "GET",
		endpoint: "/v1/events/{event_id}/vendors",
		category: "Vendors",
		description:
			'Retrieve all vendors assigned to your event. When Exhibitor Kit is enabled, the `type` is always `"Exhibitor"` and each entry includes booth/kit details. When disabled, the `type` is `"Merchant"` with no kit data.',
		headers: AUTH_HEADER,
		response: [
			{
				id: 1,
				type: "Exhibitor",
				vendor: {
					id: 10,
					full_name: "TechCorp Sdn Bhd",
					email: "booth@techcorp.com",
				},
				exhibitor_kit: {
					id: 5,
					booth_number: "A101",
					booth_type: "shell_scheme",
					company_name: "TechCorp Sdn Bhd",
					payment_status: "paid",
				},
			},
		],
	},
	{
		id: "create-vendor",
		title: "Create Event Vendor",
		method: "POST",
		endpoint: "/v1/events/{event_id}/vendors",
		category: "Vendors",
		description:
			'Assign a new vendor to your event. When Exhibitor Kit is enabled, include `exhibitor_kit_attributes` to set up their booth at the same time — the vendor will automatically be created as type `"Exhibitor"`.',
		headers: JSON_HEADERS,
		requestBody: {
			vendor: {
				full_name: "TechCorp Sdn Bhd",
				email: "booth@techcorp.com",
				password: "securepassword",
				password_confirmation: "securepassword",
				redirect_url: "https://techcorp.com",
				exhibitor_kit_attributes: {
					booth_number: "A101",
					booth_type: "shell_scheme",
					company_name: "TechCorp Sdn Bhd",
					pic_full_name: "Ahmad Ali",
					pic_contact_number: "+60123456789",
					pic_email_address: "ahmad@techcorp.com",
				},
			},
		},
		response: {
			id: 2,
			type: "Exhibitor",
			vendor: {
				id: 11,
				full_name: "TechCorp Sdn Bhd",
				email: "booth@techcorp.com",
			},
		},
	},
	{
		id: "delete-vendor",
		title: "Remove Event Vendor",
		method: "DELETE",
		endpoint: "/v1/events/{event_id}/vendors/{id}",
		category: "Vendors",
		description: "Remove a vendor from your event.",
		headers: AUTH_HEADER,
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
		visible: (e) => e.use_exhibitor_kit,
		description:
			"Retrieve all exhibitor kits for your event. Each kit belongs to an exhibitor vendor and contains booth details, payment status, and team member info.",
		headers: AUTH_HEADER,
		response: [
			{
				id: 5,
				booth_number: "A101",
				booth_type: "shell_scheme",
				company_name: "TechCorp Sdn Bhd",
				pic_full_name: "Ahmad Ali",
				pic_contact_number: "+60123456789",
				pic_email_address: "ahmad@techcorp.com",
				payment_status: "paid",
				amount_paid: "500.00",
			},
		],
	},
	{
		id: "get-exhibitor-kit",
		title: "Get Exhibitor Kit",
		method: "GET",
		endpoint: "/v1/events/{event_id}/exhibitor_kits/{id}",
		category: "Exhibitor Kits",
		visible: (e) => e.use_exhibitor_kit,
		description:
			"Fetch a single exhibitor kit by its ID, including full booth details and team members.",
		headers: AUTH_HEADER,
		response: {
			id: 5,
			booth_number: "A101",
			booth_type: "shell_scheme",
			booth_dimensions: "3x3",
			company_name: "TechCorp Sdn Bhd",
			company_address: "Kota Kinabalu, Sabah",
			pic_full_name: "Ahmad Ali",
			pic_contact_number: "+60123456789",
			pic_email_address: "ahmad@techcorp.com",
			payment_status: "paid",
			amount_paid: "500.00",
			special_requirements: "Need extra power socket",
		},
	},
	{
		id: "update-exhibitor-kit",
		title: "Update Exhibitor Kit",
		method: "PATCH",
		endpoint: "/v1/events/{event_id}/exhibitor_kits/{id}",
		category: "Exhibitor Kits",
		visible: (e) => e.use_exhibitor_kit,
		description:
			"Update an exhibitor kit's details. As an organizer you can update all fields including payment status.",
		headers: JSON_HEADERS,
		requestBody: {
			payment_status: "paid",
			amount_paid: 500.0,
			booth_number: "B202",
		},
		response: {
			id: 5,
			booth_number: "B202",
			payment_status: "paid",
			amount_paid: "500.00",
		},
	},
];

// ============ ANALYTICS ============
const ANALYTICS_ENDPOINTS: ApiEndpoint[] = [
	{
		id: "total-tickets",
		title: "Total Tickets",
		method: "GET",
		endpoint: "/v1/events/{event_id}/metrics/total_tickets",
		category: "Analytics",
		visible: (e) => e.use_ticket,
		description: "Get the total number of tickets sold for your event.",
		headers: AUTH_HEADER,
		response: { total_tickets: 312 },
	},
	{
		id: "scanned-tickets",
		title: "Total Scanned Tickets",
		method: "GET",
		endpoint: "/v1/events/{event_id}/metrics/total_scanned_tickets",
		category: "Analytics",
		visible: (e) => e.use_ticket,
		description: "Get the total number of tickets that have been checked in.",
		headers: AUTH_HEADER,
		response: { total_scanned_tickets: 198 },
	},
	{
		id: "unscanned-tickets",
		title: "Total Unscanned Tickets",
		method: "GET",
		endpoint: "/v1/events/{event_id}/metrics/total_unscanned_tickets",
		category: "Analytics",
		visible: (e) => e.use_ticket,
		description: "Get the total number of tickets not yet checked in.",
		headers: AUTH_HEADER,
		response: { total_unscanned_tickets: 114 },
	},
	{
		id: "total-visitors",
		title: "Total Visitors",
		method: "GET",
		endpoint: "/v1/events/{event_id}/metrics/total_visitors",
		category: "Analytics",
		visible: (e) => !e.use_ticket,
		description: "Get the total number of visitors registered for your event.",
		headers: AUTH_HEADER,
		response: { total_visitors: 850 },
	},
	{
		id: "scanned-visitors",
		title: "Total Scanned Visitors",
		method: "GET",
		endpoint: "/v1/events/{event_id}/metrics/total_scanned_visitors",
		category: "Analytics",
		visible: (e) => !e.use_ticket,
		description: "Get the total number of visitors that have been checked in.",
		headers: AUTH_HEADER,
		response: { total_scanned_visitors: 612 },
	},
	{
		id: "voucher-analytics",
		title: "Voucher Analytics",
		method: "GET",
		endpoint: "/v1/events/{event_id}/voucher_analytics",
		category: "Analytics",
		visible: (e) => e.use_voucher,
		description:
			"Get voucher redemption stats for your event — total issued, redeemed, redemption rate, and discount value. Only available when the event has vouchers enabled.",
		headers: AUTH_HEADER,
		response: {
			total_vouchers_issued: 500,
			total_redemptions: 143,
			event_redemption_rate: 28.6,
			total_discount_value: "2145.00",
			total_sales: "10725.00",
		},
	},
];

export const EVENT_API_ENDPOINTS: ApiEndpoint[] = [
	...GETTING_STARTED,
	...TICKET_ENDPOINTS,
	...CHECKIN_ENDPOINTS,
	...VISITOR_ENDPOINTS,
	...TICKET_TYPE_ENDPOINTS,
	...VOUCHER_ENDPOINTS,
	...VENDOR_ENDPOINTS,
	...EXHIBITOR_KIT_ENDPOINTS,
	...ANALYTICS_ENDPOINTS,
];
