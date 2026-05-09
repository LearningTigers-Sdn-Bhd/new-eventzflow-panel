// src/components/admin-ui/sidebar/app-menu-config.ts

import type { LucideIcon } from "lucide-react";
import {
	CircleHelp,
	ClipboardList,
	FileText,
	FolderOpen,
	Handshake,
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
	isActive?: (pathname: string) => boolean;
	openInNewTab?: boolean; // Opens link in new tab
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
			name: "Exhibitor List",
			url: "/exhibitor-list" as Route,
			icon: ClipboardList,
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
			name: "Lead Scan",
			url: "/lead-scan" as Route,
			icon: BiQrScan,
			roleAllowed: [USER_ROLES.VENDOR, USER_ROLES.EXHIBITOR],
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
			name: "Sponsors",
			url: "/sponsors" as Route,
			icon: Handshake,
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
			name: "Manage Post Content",
			url: "/manage-resources/posts/" as Route,
			icon: FileText,
			roleAllowed: [
				USER_ROLES.ORG_OWNER,
				USER_ROLES.ORGANIZER,
				USER_ROLES.MEMBER,
			],
			allowBottomNavigation: false,
			requiresPermission: "has_writer_permission",
			isActive: (pathname: string) => pathname.startsWith("/manage-resources/"),
		},
		{
			name: "API Keys",
			url: "/api" as Route,
			icon: Key,
			roleAllowed: [USER_ROLES.ORG_OWNER],
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
		{
			name: "Help & Docs",
			url: "/help" as Route,
			icon: CircleHelp,
			roleAllowed: [
				USER_ROLES.ORG_OWNER,
				USER_ROLES.ORGANIZER,
				USER_ROLES.MEMBER,
				USER_ROLES.VENDOR,
				USER_ROLES.EXHIBITION_CONTRACTOR,
			],
			allowBottomNavigation: false,
			openInNewTab: true,
		},
	],
};

export interface UserPermissions {
	allow_printing_services?: boolean;
	has_writer_permission?: boolean;
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

			// Special case: has_writer_permission must be strictly followed as per backend
			if (item.requiresPermission === "has_writer_permission") {
				return permissions[permKey] === true;
			}

			// For org_owner, always allow other permissions (they control them)
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

export function getFilteredNavigation(
	userRole?: UserRole,
	permissions?: UserPermissions,
) {
	const role = userRole || USER_ROLES.MEMBER;
	return {
		mainMenu: filterByRoleAndPermissions(
			navigationData.mainMenu,
			role,
			permissions,
		),
		memberManagement: filterByRoleAndPermissions(
			navigationData.memberManagement,
			role,
			permissions,
		),
		miscellaneous: filterByRoleAndPermissions(
			navigationData.miscellaneous,
			role,
			permissions,
		),
	};
}

export function getMobileNavigation(
	userRole?: UserRole,
	permissions?: UserPermissions,
) {
	const role = userRole || USER_ROLES.MEMBER;
	const filtered = filterByRoleAndPermissions(
		navigationData.mainMenu,
		role,
		permissions,
	);
	return {
		bottomNavItems: filtered.filter((item) => item.allowBottomNavigation),
		mainMenuNotInBottomNav: filtered.filter(
			(item) => !item.allowBottomNavigation,
		),
		memberManagement: filterByRoleAndPermissions(
			navigationData.memberManagement,
			role,
			permissions,
		),
		miscellaneous: filterByRoleAndPermissions(
			navigationData.miscellaneous,
			role,
			permissions,
		),
	};
}
