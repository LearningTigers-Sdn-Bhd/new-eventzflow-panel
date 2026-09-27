export type VehicleIssueCode =
	| "wrong_group"
	| "stale_base"
	| "no_base_holder"
	| "ticket_not_in_group"
	| "unsupported_form";

export interface BackendVehicleIssue {
	code: VehicleIssueCode;
	message: string;
	ticket_id?: number;
}

export interface BackendVehicleCrewMember {
	ticket_id: number;
	public_id: string;
	name: string;
	role: string | null;
	ticket_type_name: string | null;
	status: string;
	payment_status: string;
}

export interface BackendVehicleRegistration {
	id: number;
	plate: string;
	deleted_at?: string | null;
	registration_form: {
		id: number | null;
		name: string | null;
		slug: string | null;
	};
	base_ticket_type: {
		id: number | null;
		name: string | null;
	};
	capacity: number | null;
	seats_used: number;
	crew: BackendVehicleCrewMember[];
	issues: BackendVehicleIssue[];
}

export interface VehicleIssue {
	code: VehicleIssueCode;
	message: string;
	ticketId?: number;
}

export interface VehicleCrewMember {
	ticketId: number;
	publicId: string;
	name: string;
	role: string | null;
	ticketTypeName: string | null;
	status: string;
	paymentStatus: string;
}

export interface VehicleRegistration {
	id: number;
	plate: string;
	deletedAt: string | null;
	registrationForm: {
		id: number | null;
		name: string | null;
		slug: string | null;
	};
	baseTicketType: {
		id: number | null;
		name: string | null;
	};
	capacity: number | null;
	seatsUsed: number;
	crew: VehicleCrewMember[];
	issues: VehicleIssue[];
}

export type MoveVehicleGroupResponse = VehicleRegistration;
export type SyncVehicleBaseResponse = VehicleRegistration;
export type UpdateVehicleResponse = VehicleRegistration;
export type ArchiveVehicleResponse = VehicleRegistration;
export type RestoreVehicleResponse = VehicleRegistration;
