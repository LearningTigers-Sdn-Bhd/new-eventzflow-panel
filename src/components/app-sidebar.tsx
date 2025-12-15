"use client";

import { FolderOpen, HardHat, Import, Key, LayoutDashboard, Package, Printer, Store, Ticket, Users } from "lucide-react";
import type { Route } from "next";
import type * as React from "react";
import { BiQrScan } from "react-icons/bi";
import { MdEvent } from "react-icons/md";
import { AppSidebarIcon } from "@/components/app-sidebar-icon";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

// This is sample data.
const data = {
	navMain: [
		{
			name: "Dashboard",
			url: "/dashboard" as Route,
			icon: LayoutDashboard,
			roleAllowed: ["org_owner", "organizer", "member", "vendor", "exhibition_contractor"],
		},
		{
			name: "Events",
			url: "/event" as Route,
			icon: MdEvent,
			roleAllowed: ["org_owner", "organizer", "member", "vendor", "exhibition_contractor"],
		},
		{
			name: "Exhibitor Kits",
			url: "/exhibitor-kits" as Route,
			icon: Package,
			roleAllowed: ["exhibition_contractor"],
		},
		{
			name: "Rentable Items",
			url: "/rentable-items" as Route,
			icon: Package,
			roleAllowed: ["exhibition_contractor"],
		},
		{
			name: "Printing Services",
			url: "/printing-services" as Route,
			icon: Printer,
			roleAllowed: ["exhibition_contractor"],
		},
		{
			name: "My Vouchers",
			url: "/voucher" as Route,
			icon: Ticket,
			roleAllowed: ["vendor"],
		},
		{
			name: "Scans",
			url: "/scan" as Route,
			icon: BiQrScan,
			roleAllowed: ["org_owner", "organizer", "member"],
		},
		{
			name: "Team Members",
			url: "/team" as Route,
			icon: Users,
			roleAllowed: ["org_owner", "organizer"],
		},
		{
			name: "Exhibitor Contractor",
			url: "/exhibitor-contractor" as Route,
			icon: HardHat,
			roleAllowed: ["org_owner", "organizer"],
		},
		{
			name: "Vendors",
			url: "/vendor" as Route,
			icon: Store,
			roleAllowed: ["org_owner", "organizer"],
		},
		{
			name: "API Keys",
			url: "/api" as Route,
			icon: Key,
			roleAllowed: ["org_owner", "organizer"],
		},
		{
			name: "Import Tickets",
			url: "/import" as Route,
			icon: Import,
			roleAllowed: ["org_owner"],
		},
		{
			name: "Item Categories",
			url: "/item-categories" as Route,
			icon: FolderOpen,
			roleAllowed: ["org_owner", "organizer"],
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
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth();
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<AppSidebarIcon />
			</SidebarHeader>
			<SidebarContent>
				<NavMain
					navMain={data.navMain.filter((item) =>
						item.roleAllowed.includes(user?.role || "member"),
					)}
				/>
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
