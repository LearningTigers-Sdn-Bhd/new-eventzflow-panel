import type {
	ExhibitorKit,
	ExhibitorKitFilters,
} from "@/lib/api/exhibitor-kit";
import { restClient } from "@/utils/rest-api";
import {
	type CreateEventVendorBatchRequest,
	type CreateEventVendorRequest,
	createEventVendorBatchSchema,
	createEventVendorSchema,
	type UpdateEventVendorRequest,
	updateEventVendorSchema,
} from "./request";
import type { EventVendor } from "./response";

type EventVendorResponse = Omit<EventVendor, "exhibitor_kits"> & {
	exhibitor_kits?: EventVendor["exhibitor_kits"];
	exhibitor_kit?: EventVendor["exhibitor_kits"][number];
};

function normalizeEventVendor({
	exhibitor_kit,
	...vendor
}: EventVendorResponse): EventVendor {
	return {
		...vendor,
		exhibitor_kits:
			vendor.exhibitor_kits ?? (exhibitor_kit ? [exhibitor_kit] : []),
	};
}

/**
 * Get all vendors for an event
 */
export async function getEventVendors(eventId: number): Promise<EventVendor[]> {
	const vendors = await restClient.get<EventVendorResponse[]>(
		`v1/events/${eventId}/vendors`,
	);
	return vendors.map(normalizeEventVendor);
}

export interface ExhibitorKitRow {
	vendor: EventVendor;
	kit: ExhibitorKit;
}

export interface GetExhibitorKitsPagedOptions {
	page: number;
	perPage: number;
	/** Search and filters; `zone` is a zone name or "__unassigned__". */
	filters: ExhibitorKitFilters;
	sortBy?: "booth_number" | "company_name" | "created_at";
	sortDir?: "asc" | "desc";
}

/** Tags over every matching kit, not just one page: collected (capped at the included
 * count per kit), included in total, and taken beyond the included count. */
export interface TagTotals {
	collected: number;
	entitled: number;
	extra: number;
}

export interface PagedExhibitorKits {
	data: ExhibitorKitRow[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalCount: number;
		perPage: number;
	};
	tagTotals: TagTotals;
}

/**
 * One server-paginated page of exhibitor kits (a row per kit, with its vendor) for the
 * Exhibitors table. Search, filters, sort and paging run server-side so large events
 * don't ship every kit to the browser — see event_vendors_controller.rb#exhibitor_kits.
 */
export async function getExhibitorKitsPaged(
	eventId: number | string,
	options: GetExhibitorKitsPagedOptions,
): Promise<PagedExhibitorKits> {
	const params = new URLSearchParams();
	params.set("page", String(options.page));
	params.set("per_page", String(options.perPage));
	for (const [key, value] of Object.entries(options.filters)) {
		if (value) params.set(key, value);
	}
	if (options.sortBy) params.set("sort_by", options.sortBy);
	if (options.sortDir) params.set("sort_dir", options.sortDir);

	const { data, headers } = await restClient.getWithHeaders<
		{ vendor: EventVendorResponse; kit: ExhibitorKit }[]
	>(`v1/events/${eventId}/vendors/exhibitor_kits?${params.toString()}`);

	return {
		data: data.map(({ vendor, kit }) => ({
			vendor: { ...normalizeEventVendor(vendor), exhibitor_kits: [kit] },
			kit,
		})),
		pagination: {
			currentPage: Number(headers.get("X-Page")) || options.page,
			totalPages: Number(headers.get("X-Total-Pages")) || 0,
			totalCount: Number(headers.get("X-Total-Count")) || 0,
			perPage: Number(headers.get("X-Per-Page")) || options.perPage,
		},
		tagTotals: {
			collected: Number(headers.get("X-Tags-Collected")) || 0,
			entitled: Number(headers.get("X-Tags-Entitled")) || 0,
			extra: Number(headers.get("X-Tags-Extra")) || 0,
		},
	};
}

/**
 * Get a single event vendor by event_vendor id from the list
 * Note: There's no direct GET endpoint for a single event vendor,
 * so we fetch the list and find the matching one
 */
export async function getEventVendor(
	eventId: number,
	eventVendorId: number,
): Promise<EventVendor> {
	const vendors = await getEventVendors(eventId);
	const vendor = vendors.find((v) => v.id === eventVendorId);
	if (!vendor) {
		throw new Error(`Event vendor with id ${eventVendorId} not found`);
	}
	return vendor;
}

/**
 * Add a vendor to an event
 */
export async function createEventVendor(
	eventId: number,
	data: CreateEventVendorRequest,
): Promise<EventVendor> {
	const validated = createEventVendorSchema.parse(data);
	const vendor = await restClient.post<EventVendorResponse>(
		`v1/events/${eventId}/vendors`,
		{
			vendor: validated,
		},
	);
	return normalizeEventVendor(vendor);
}

/**
 * Add a vendor to an event with one or more booths in a single atomic batch.
 * Used by the organizer Manual Add form's multi-booth flow.
 */
export async function createEventVendorBatch(
	eventId: number,
	data: CreateEventVendorBatchRequest,
	idempotencyKey: string,
): Promise<EventVendor> {
	const validated = createEventVendorBatchSchema.parse(data);
	const vendor = await restClient.postWithHeaders<EventVendorResponse>(
		`v1/events/${eventId}/vendors/batch`,
		{ vendor: validated },
		{ "Idempotency-Key": idempotencyKey },
	);
	return normalizeEventVendor(vendor);
}

/**
 * Update a vendor in an event
 */
export async function updateEventVendor(
	eventId: number,
	vendorId: number,
	data: UpdateEventVendorRequest,
): Promise<EventVendor> {
	const validated = updateEventVendorSchema.parse(data);
	const vendor = await restClient.patch<EventVendorResponse>(
		`v1/events/${eventId}/vendors/${vendorId}`,
		{
			vendor: validated,
		},
	);
	return normalizeEventVendor(vendor);
}

/**
 * Remove a vendor from an event
 */
export async function deleteEventVendor(
	eventId: number,
	vendorId: number,
): Promise<void> {
	await restClient.delete<void>(`v1/events/${eventId}/vendors/${vendorId}`);
}
