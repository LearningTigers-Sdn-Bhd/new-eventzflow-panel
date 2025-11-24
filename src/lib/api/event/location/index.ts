// Request types and schemas

// API endpoints
export {
	createLocation,
	deleteLocation,
	getLocationById,
	getLocations,
	updateLocationInfo,
	updateLocationMembers,
} from "./endpoints";
export {
	type CreateLocationRequest,
	createLocationSchema,
	type DeleteLocationRequest,
	deleteLocationSchema,
	type GetLocationByIdRequest,
	type GetLocationsRequest,
	getLocationByIdSchema,
	getLocationsSchema,
	type UpdateLocationInfoRequest,
	type UpdateLocationMembersRequest,
	updateLocationInfoSchema,
	updateLocationMembersSchema,
} from "./request";
// Response types
export type {
	BackendLocation,
	CreateLocationResponse,
	DeleteLocationResponse,
	Location,
	UpdateLocationResponse,
} from "./response";
