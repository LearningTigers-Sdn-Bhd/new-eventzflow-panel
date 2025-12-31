/**
 * Import/Export Page Menu Configuration
 *
 * Defines all navigation tabs for import/export page.
 * Tabs are organized into standalone items and groups.
 *
 * Visibility is controlled by:
 * - User permissions (org owner, event staff, vendor)
 */

import { Ticket, Users } from "lucide-react";
import type { IconType } from "react-icons";
import type { useEventPermissions } from "@/hooks/use-event-permissions";
import type { Event } from "@/lib/api/event/response";

// ============================================================================
// TYPES
// ============================================================================

type Permissions = ReturnType<typeof useEventPermissions>;

export type MenuItem = {
	route: string;
	label: string;
	description: string;
	icon: IconType;
	visible?: (permissions: Permissions, event?: Event) => boolean;
};

export type MenuGroup = {
	id: string;
	label: string;
	visible?: (permissions: Permissions, event?: Event) => boolean;
	tabs: MenuItem[];
};

export type EventMenuConfig = {
	standalone: MenuItem[];
	groups: MenuGroup[];
};

// ============================================================================
// VISIBILITY HELPERS - Reusable permission checks
// ============================================================================

const visible = {
	// Permission checks
	orgOwner: (p: Permissions) => p.isOrgOwner,
	organizer: (p: Permissions) => p.isOrganizer,
	member: (p: Permissions) => p.isMember,
	vendor: (p: Permissions) => p.isVendor,
	exhibitionContractor: (p: Permissions) => p.isExhibitionContractor,
};

// ============================================================================
// MENU CONFIGURATION
// ============================================================================

export const eventMenuConfig: EventMenuConfig = {
	/** Tabs that are always visible to all users */
	standalone: [
		{
			route: "tickets",
			label: "Import Tickets",
			description: "Import tickets from an Excel or CSV file.",
			icon: Ticket,
		},
		{
			route: "visitors",
			label: "Import Visitors",
			description: "Import visitors from an Excel or CSV file.",
			icon: Users,
		},
	],

	/** Grouped tabs with conditional visibility */
	groups: [
		// ------------------------------------------------------------------------
		// EXPERIMENTAL FEATURES - Only for orgOwner can access.
		// ------------------------------------------------------------------------
		{
			id: "experimental",
			label: "Experimental Features",
			visible: visible.orgOwner,
			tabs: [
				{
					route: "#",
					label: "Export Tickets",
					description: "Export tickets to an Excel or CSV file.",
					icon: Ticket,
				},
			],
		},
	],
} as const;

// ============================================================================
// ROUTE LOOKUP MAP - For layout.tsx to find menu item config by route
// ============================================================================

/**
 * Flattened map of all routes to their menu item configurations.
 * Used by layout.tsx to display current page title, description, and icon.
 */
export const routeMenuMap: Record<string, MenuItem> = (() => {
	const map: Record<string, MenuItem> = {};

	// Add standalone items
	for (const item of eventMenuConfig.standalone) {
		map[item.route] = item;
	}

	// Add grouped items
	for (const group of eventMenuConfig.groups) {
		for (const item of group.tabs) {
			map[item.route] = item;
		}
	}

	return map;
})();
