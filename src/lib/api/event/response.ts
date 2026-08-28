// Pure TypeScript types for API responses

export type EventEmailSetting = {
	sender_name: string | null;
	sender_address: string | null;
	contact_email: string | null;
	payment_receipt_email: string | null;
	emails_enabled: boolean;
	disabled_categories: string[];
};

export type WishWallSetting = {
	display_mode: "cards" | "animation";
	animation_shape: "heart" | "names" | "infinity" | "butterfly" | null;
	animation_text: string | null;
	accent_color: string | null;
	header_text_color: string | null;
	card_background_color: string | null;
	background_image_url: string | null;
};

export type ScanMode = "unlimited" | "per_location" | "per_day";

export type Event = {
	id: number;
	title: string;
	slug: string;
	description: string | null;
	status: "draft" | "published" | "cancelled" | "completed";
	visibility: boolean;
	multiple_scans: boolean;
	multiple_scan_mode: ScanMode;
	allow_multiple_tickets_per_email: boolean;
	use_ticket: boolean;
	use_wedding: boolean;
	auto_approve_wishes: boolean;
	extra_guest_limit: number | null;
	use_seat_ticketing: boolean;
	use_exhibitor_kit: boolean;
	enable_exhibitor_management: boolean;
	exhibitor_reservation_ttl_hours: number | null;
	allow_contractor_printing_services: boolean;
	use_business_matching: boolean;
	use_voucher: boolean;
	use_sponsorship: boolean;
	// photo_booth_enabled: boolean;
	use_event_leads: boolean;
	use_certificate: boolean;
	use_api_access: boolean;
	reminders_enabled: boolean;
	reminder_7_day: boolean;
	reminder_1_day: boolean;
	payment_receipt_email: string | null;
	event_email_setting: EventEmailSetting | null;
	wish_wall_setting: WishWallSetting;
	start_date: string;
	end_date: string;
	venue_name: string | null;
	venue_address: string | null;
	webhook_url: string | null;
	business_matching_webhook_url: string | null;
	business_matching_linked_exhibitor_enabled: boolean;
	public_registration_url: string | null;
	registration_path_template: string | null;
	labels_data: Record<string, string>;
	exhibitor_labels_data: Record<string, string>;
	booth_types: string[];
	payment_status: "unpaid" | "paid" | "waived";
	price: string;
	published: boolean;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	logo_url: string | null;
	poster_url: string | null;
};

export type EventDetails = Event;

// Backend response types (raw API responses) - BackendEvent is the same as Event
export type BackendEvent = Event;
