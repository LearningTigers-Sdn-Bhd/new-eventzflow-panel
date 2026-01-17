/**
 * Resource Menu Configuration
 *
 * Defines all navigation tabs for resource management pages.
 * Tabs are organized into standalone items and groups.
 *
 * Visibility is controlled by:
 * - User permissions (org owner, has_writer_permission)
 */

import {
	BarChart3,
	CheckSquare,
	Files,
	FileText,
	type LucideIcon,
	PenTool,
	Tag,
	TrendingUp,
	UserPlus,
	Video,
} from "lucide-react";
import type { IconType } from "react-icons";
import type { useUserPermissions } from "@/hooks/auth/use-user-permissions";

// ============================================================================
// TYPES
// ============================================================================

type Permissions = ReturnType<typeof useUserPermissions>;

export type MenuItem = {
	route: string;
	label: string;
	description: string;
	icon: IconType | LucideIcon;
	visible?: (permissions: Permissions) => boolean;
	isActive?: (pathname: string, route: string) => boolean;
};

export type MenuGroup = {
	id: string;
	label: string;
	icon: IconType | LucideIcon;
	visible?: (permissions: Permissions) => boolean;
	tabs: MenuItem[];
};

export type ResourceMenuConfig = {
	standalone: MenuItem[];
	groups: MenuGroup[];
};

// ============================================================================
// VISIBILITY HELPERS - Reusable permission checks
// ============================================================================

const visible = {
	orgOwner: (p: Permissions) => p.isOrgOwner ?? false,
	hasWriterPermission: (p: Permissions) =>
		(p.hasWriterPermission || p.isOrgOwner) ?? false,
};

// ============================================================================
// MENU CONFIGURATION
// ============================================================================

export const resourceMenuConfig: ResourceMenuConfig = {
	standalone: [
		{
			route: "published-posts",
			label: "Published Posts",
			description:
				"View and manage all published resource posts by authorized authors",
			icon: Files,
			visible: visible.orgOwner,
		},
		{
			route: "posts",
			label: "My Posts",
			description: "View and manage your resource posts.",
			icon: PenTool,
			visible: visible.hasWriterPermission,
		},
		{
			route: "post-approval",
			label: "Posts Approval",
			description: "Approve or reject submitted resource posts.",
			icon: CheckSquare,
			visible: visible.orgOwner,
		},
	],

	groups: [
		{
			id: "manage",
			label: "Manage",
			icon: FileText,
			tabs: [
				{
					route: "manage/permissions",
					label: "Permissions",
					description: "Manage resource access permissions.",
					icon: UserPlus,
					visible: visible.orgOwner,
				},
				{
					route: "manage/topics",
					label: "Topics",
					description: "Manage resource topics.",
					icon: FileText,
					visible: visible.orgOwner,
				},
				{
					route: "manage/categories",
					label: "Categories",
					description: "Manage resource categories.",
					icon: Tag,
					visible: visible.orgOwner,
				},
				{
					route: "manage/media-type",
					label: "Media Type",
					description: "Manage media types for resources.",
					icon: Video,
					visible: visible.orgOwner,
				},
			],
		},
		{
			id: "analytics",
			label: "Analytics",
			icon: BarChart3,
			tabs: [
				{
					route: "leads/metrics",
					label: "Lead Metrics",
					description: "Analytics and insights for lead generation performance.",
					icon: TrendingUp,
					visible: visible.orgOwner,
					isActive: (pathname, route) => {
						// Exact match for metrics route
						return pathname === `/manage-resources/${route}` ||
						       pathname.startsWith(`/manage-resources/${route}/`);
					},
				},
				{
					route: "leads",
					label: "Leads",
					description: "View and manage resource leads.",
					icon: BarChart3,
					visible: visible.orgOwner,
					isActive: (pathname, route) => {
						// Only active if exactly on /leads, not on /leads/metrics or other sub-routes
						return pathname === `/manage-resources/${route}`;
					},
				},
			],
		},
	],
} as const;

// ============================================================================
// ROUTE LOOKUP MAP
// ============================================================================

export const routeMenuMap: Record<string, MenuItem> = (() => {
	const map: Record<string, MenuItem> = {};

	// Add standalone items
	for (const item of resourceMenuConfig.standalone) {
		map[item.route] = item;
	}

	// Add grouped items
	for (const group of resourceMenuConfig.groups) {
		for (const item of group.tabs) {
			map[item.route] = item;
		}
	}

	return map;
})();
