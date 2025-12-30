// src/components/admin-ui/sidebar/app-menu-config.ts

import type { LucideIcon } from "lucide-react";
import {
	FolderOpen,
	HardHat,
	Import,
	Key,
	LayoutDashboard,
	Package,
	Printer,
	Store,
	Ticket,
	Users,
} from "lucide-react";
import type { Route } from "next";
import { BiQrScan } from "react-icons/bi";
import type { IconType } from "react-icons/lib";
import { MdEvent } from "react-icons/md";

export const USER_ROLES = {
	ORG_OWNER: "org_owner",
	ORGANIZER: "organizer",
	MEMBER: "member",
	VENDOR: "vendor",
	EXHIBITION_CONTRACTOR: "exhibition_contractor",
	EXHIBITOR: "exhibitor",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface NavigationItem {
	name: string;
	url: Route;
	icon: LucideIcon | IconType;
	roleAllowed: UserRole[];
	allowBottomNavigation: boolean; // Controls visibility in mobile bottom nav
	requiresPermission?: string; // Optional permission key for dynamic visibility
}

// Navigation configuration data
export const navigationData = {
	mainMenu: [
		{
			name: "Dashboard",
			url: "/dashboard" as Route,
			icon: LayoutDashboard,
			roleAllowed: [
				USER_ROLES.ORG_OWNER,
				USER_ROLES.ORGANIZER,
				USER_ROLES.MEMBER,
				USER_ROLES.VENDOR,
				USER_ROLES.EXHIBITION_CONTRACTOR,
			],
			allowBottomNavigation: true,
		},
		{
			name: "Events",
			url: "/event" as Route,
			icon: MdEvent,
			roleAllowed: [
				USER_ROLES.ORG_OWNER,
				USER_ROLES.ORGANIZER,
				USER_ROLES.MEMBER,
				USER_ROLES.VENDOR,
				USER_ROLES.EXHIBITION_CONTRACTOR,
			],
			allowBottomNavigation: true,
		},
		{
			name: "Exhibitor Kits",
			url: "/exhibitor-kits" as Route,
			icon: Package,
			roleAllowed: [USER_ROLES.EXHIBITION_CONTRACTOR],
			allowBottomNavigation: false,
		},
		{
			name: "Rentable Items",
			url: "/rentable-items" as Route,
			icon: Package,
			roleAllowed: [USER_ROLES.EXHIBITION_CONTRACTOR],
			allowBottomNavigation: false,
		},
		{
			name: "Printing Services",
			url: "/printing-services" as Route,
			icon: Printer,
			roleAllowed: [USER_ROLES.ORG_OWNER, USER_ROLES.EXHIBITION_CONTRACTOR],
			allowBottomNavigation: false,
			requiresPermission: "allow_printing_services",
		},
		{
			name: "My Vouchers",
			url: "/voucher" as Route,
			icon: Ticket,
			roleAllowed: [USER_ROLES.VENDOR],
			allowBottomNavigation: true,
		},
		{
			name: "Scans",
			url: "/scan" as Route,
			icon: BiQrScan,
			roleAllowed: [
				USER_ROLES.ORG_OWNER,
				USER_ROLES.ORGANIZER,
				USER_ROLES.MEMBER,
			],
			allowBottomNavigation: true,
		},
		// {
		// 	name: "Credits",
		// 	url: "/credits" as Route,
		// 	icon: CreditCard,
		// },
		// {
		// 	name: "Ticket Coins",
		// 	url: "/ticket" as Route,
		// 	icon: Tickets,
		// },
	],
	memberManagement: [
		{
			name: "Team Members",
			url: "/team" as Route,
			icon: Users,
			roleAllowed: [USER_ROLES.ORG_OWNER, USER_ROLES.ORGANIZER],
			allowBottomNavigation: false,
		},
		{
			name: "Exhibitor Contractors",
			url: "/exhibitor-contractor" as Route,
			icon: HardHat,
			roleAllowed: [USER_ROLES.ORG_OWNER, USER_ROLES.ORGANIZER],
			allowBottomNavigation: false,
		},
		{
			name: "Vendors",
			url: "/vendor" as Route,
			icon: Store,
			roleAllowed: [USER_ROLES.ORG_OWNER, USER_ROLES.ORGANIZER],
			allowBottomNavigation: false,
		},
	],
	miscellaneous: [
		{
			name: "API Keys",
			url: "/api" as Route,
			icon: Key,
			roleAllowed: [USER_ROLES.ORG_OWNER, USER_ROLES.ORGANIZER],
			allowBottomNavigation: false,
		},
		{
			name: "Import Data",
			url: "/import" as Route,
			icon: Import,
			roleAllowed: [USER_ROLES.ORG_OWNER],
			allowBottomNavigation: false,
		},
		{
			name: "Item Categories",
			url: "/item-categories" as Route,
			icon: FolderOpen,
			roleAllowed: [USER_ROLES.ORG_OWNER, USER_ROLES.ORGANIZER],
			allowBottomNavigation: false,
		},
	],
};

export interface UserPermissions {
	allow_printing_services?: boolean;
}

function filterByRoleAndPermissions(
	items: NavigationItem[],
	role: UserRole,
	permissions?: UserPermissions,
): NavigationItem[] {
	return items.filter((item) => {
		// First check role
		if (!item.roleAllowed.some((r) => r === role)) {
			return false;
		}
		// Then check permission if required
		if (item.requiresPermission && permissions) {
			const permKey = item.requiresPermission as keyof UserPermissions;
			// For org_owner, always allow (they control the permission)
			if (role === USER_ROLES.ORG_OWNER) {
				return true;
			}
			// For other roles, check the permission value
			if (permissions[permKey] === false) {
				return false;
			}
		}
		return true;
	});
}

export function getFilteredNavigation(userRole?: UserRole, permissions?: UserPermissions) {
	const role = userRole || USER_ROLES.MEMBER;
	return {
		mainMenu: filterByRoleAndPermissions(navigationData.mainMenu, role, permissions),
		memberManagement: filterByRoleAndPermissions(navigationData.memberManagement, role, permissions),
		miscellaneous: filterByRoleAndPermissions(navigationData.miscellaneous, role, permissions),
	};
}

export function getMobileNavigation(userRole?: UserRole, permissions?: UserPermissions) {
	const role = userRole || USER_ROLES.MEMBER;
	const filtered = filterByRoleAndPermissions(navigationData.mainMenu, role, permissions);
	return {
		bottomNavItems: filtered.filter((item) => item.allowBottomNavigation),
		mainMenuNotInBottomNav: filtered.filter((item) => !item.allowBottomNavigation),
		memberManagement: filterByRoleAndPermissions(navigationData.memberManagement, role, permissions),
		miscellaneous: filterByRoleAndPermissions(navigationData.miscellaneous, role, permissions),
	};
}
