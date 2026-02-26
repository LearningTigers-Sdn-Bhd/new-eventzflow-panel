export type BackendExhibitorZoneQuota = {
	id: number;
	event_id: number;
	zone: string;
	quota: number;
	created_at: string;
	updated_at: string;
};

export type ExhibitorZoneQuota = {
	id: number;
	eventId: number;
	zone: string;
	quota: number;
	createdAt: string;
	updatedAt: string;
};

export type CreateExhibitorZoneQuotaResponse = {
	success: boolean;
	zoneQuota: ExhibitorZoneQuota;
};

export type UpdateExhibitorZoneQuotaResponse = {
	success: boolean;
	zoneQuota: ExhibitorZoneQuota;
};

export type DeleteExhibitorZoneQuotaResponse = {
	success: boolean;
};
