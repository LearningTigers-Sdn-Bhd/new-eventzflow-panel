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
			roleAllowed: [USER_ROLES.EXHIBITION_CONTRACTOR],
			allowBottomNavigation: false,
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

export function getFilteredNavigation(userRole?: UserRole) {
	const role = userRole || USER_ROLES.MEMBER;
	return {
		mainMenu: navigationData.mainMenu.filter((item) =>
			item.roleAllowed.some((r) => r === role),
		),
		memberManagement: navigationData.memberManagement.filter((item) =>
			item.roleAllowed.some((r) => r === role),
		),
		miscellaneous: navigationData.miscellaneous.filter((item) =>
			item.roleAllowed.some((r) => r === role),
		),
	};
}

export function getMobileNavigation(userRole?: UserRole) {
	const role = userRole || USER_ROLES.MEMBER;
	return {
		bottomNavItems: navigationData.mainMenu.filter(
			(item) =>
				item.allowBottomNavigation && item.roleAllowed.some((r) => r === role),
		),
		mainMenuNotInBottomNav: navigationData.mainMenu.filter(
			(item) =>
				!item.allowBottomNavigation && item.roleAllowed.some((r) => r === role),
		),
		memberManagement: navigationData.memberManagement.filter((item) =>
			item.roleAllowed.some((r) => r === role),
		),
		miscellaneous: navigationData.miscellaneous.filter((item) =>
			item.roleAllowed.some((r) => r === role),
		),
	};
}
