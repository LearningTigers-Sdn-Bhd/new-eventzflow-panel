export type RegistrationFormRsvpSetting = {
	id: number;
	registration_form_id: number;
	enabled: boolean;
	rsvp_required: boolean;
	rsvp_expires_in_hours: number | null;
	review_sla_hours: number;
	notify_by_date: string | null;
	created_at: string;
	updated_at: string;
};
