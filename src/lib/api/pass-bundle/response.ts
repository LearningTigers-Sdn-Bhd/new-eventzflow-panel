import type {
	PassBundlePaymentMode,
	PassBundlePaymentStatus,
	PassBundleStatus,
} from "./request";

export interface BackendPassBundle {
	id: number;
	event_id: number;
	name: string;
	token: string;
	pass_limit: number;
	used_count: number;
	remaining_count: number;
	payment_mode: PassBundlePaymentMode;
	payment_status: PassBundlePaymentStatus;
	status: PassBundleStatus;
	expires_at: string | null;
	registration_form: {
		id: number;
		name: string;
		slug: string;
	};
	ticket_type: {
		id: number;
		name: string;
	};
	bundle_link: string;
	created_at: string;
	updated_at: string;
}

export interface PassBundle {
	id: number;
	eventId: number;
	name: string;
	token: string;
	passLimit: number;
	usedCount: number;
	remainingCount: number;
	paymentMode: PassBundlePaymentMode;
	paymentStatus: PassBundlePaymentStatus;
	status: PassBundleStatus;
	expiresAt: string | null;
	registrationForm: {
		id: number;
		name: string;
		slug: string;
	};
	ticketType: {
		id: number;
		name: string;
	};
	bundleLink: string;
	createdAt: string;
	updatedAt: string;
}

export type CreatePassBundleResponse = PassBundle;
export type UpdatePassBundleResponse = PassBundle;
export type DeletePassBundleResponse = { success: boolean };
