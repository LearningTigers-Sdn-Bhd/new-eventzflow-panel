// Import type definitions for extensible import functionality

export type ImportType = "tickets" | "visitors" | "events" | "users";

export interface ImportTypeConfig {
	value: ImportType;
	label: string;
	endpoint: string;
}

// Import type configurations
export const IMPORT_TYPES: ImportTypeConfig[] = [
	{
		value: "tickets",
		label: "Tickets",
		endpoint: "v1/imports/tickets",
	},
	{
		value: "visitors",
		label: "Visitors",
		endpoint: "v1/imports/visitors",
	},
	// Future import types can be added here:
	// {
	//   value: "events",
	//   label: "Events",
	//   endpoint: "v1/imports/events",
	// },
	// {
	//   value: "users",
	//   label: "Users",
	//   endpoint: "v1/imports/users",
	// },
];

export function getImportTypeConfig(type: ImportType): ImportTypeConfig {
	const config = IMPORT_TYPES.find((t) => t.value === type);
	if (!config) {
		throw new Error(`Unknown import type: ${type}`);
	}
	return config;
}
