// Request types and schemas

// API endpoints
export {
	createLocation,
	deleteLocation,
	getLocationById,
	getLocations,
	updateLocation,
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
	type UpdateLocationRequest,
	updateLocationSchema,
} from "./request";
// Response types
export type {
	BackendLocation,
	CreateLocationResponse,
	DeleteLocationResponse,
	Location,
	UpdateLocationResponse,
} from "./response";
