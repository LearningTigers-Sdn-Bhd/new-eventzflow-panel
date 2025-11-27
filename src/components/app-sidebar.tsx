"use client";

import { Import, Key, LayoutDashboard, Store, Ticket, Users } from "lucide-react";
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
			roleAllowed: ["org_owner", "organizer", "member", "vendor"],
		},
		{
			name: "Events",
			url: "/event" as Route,
			icon: MdEvent,
			roleAllowed: ["org_owner", "organizer", "member", "vendor"],
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
			name: "Vendors",
			url: "/vendor" as Route,
			icon: Store,
			roleAllowed: ["org_owner", "organizer"],
		},
		{
			name: "API Keys",
			url: "/api" as Route,
			icon: Key,
			roleAllowed: ["org_owner"],
		},
		{
			name: "Import Tickets",
			url: "/import" as Route,
			icon: Import,
			roleAllowed: ["org_owner"],
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
