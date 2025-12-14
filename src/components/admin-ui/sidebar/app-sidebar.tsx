"use client";

import {
	FolderOpen,
	HardHat,
	Import,
	Key,
	LayoutDashboard,
	List,
	Package,
	Printer,
	Store,
	Ticket,
	Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { BiQrScan } from "react-icons/bi";
import { MdEvent } from "react-icons/md";
import { NavGroup } from "@/components/admin-ui/sidebar/nav-group";
import { UserSheet } from "@/components/admin-ui/sidebar/user-sheet";
import { AppSidebarIcon } from "@/components/app-sidebar-icon";
import { NavUser } from "@/components/nav-user";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";

// This is sample data.
export const navigationData = {
	mainMenu: [
		{
			name: "Dashboard",
			url: "/dashboard" as Route,
			icon: LayoutDashboard,
			roleAllowed: [
				"org_owner",
				"organizer",
				"member",
				"vendor",
				"exhibition_contractor",
			],
		},
		{
			name: "Events",
			url: "/event" as Route,
			icon: MdEvent,
			roleAllowed: [
				"org_owner",
				"organizer",
				"member",
				"vendor",
				"exhibition_contractor",
			],
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
			roleAllowed: ["org_owner", "organizer"],
		},
		{
			name: "Exhibitor Contractors",
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
	],
	miscellaneous: [
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
	],
};

function BottomNavigation() {
	const pathname = usePathname();
	const { user } = useAuth();

	const filteredMainMenu = navigationData.mainMenu.filter((item) =>
		item.roleAllowed.includes(user?.role || "member"),
	);

	return (
		<nav className="fixed right-0 bottom-0 left-0 z-40 flex h-18 items-center justify-around border-stone-300 border-t bg-stone-200 pb-[env(safe-area-inset-bottom)] md:h-20">
			{filteredMainMenu.map((item) => {
				const isActive =
					pathname === item.url || pathname.startsWith(`${item.url}/`);
				return (
					<div
						key={item.name}
						className="flex h-full w-full items-center justify-center"
					>
						<Button
							key={item.name}
							variant="ghost"
							className={cn(
								"group h-full w-full rounded-none border-none bg-transparent shadow-none hover:bg-transparent",
								isActive &&
									"bg-stone-900 text-stone-50 group-hover:text-stone-50",
							)}
							asChild
						>
							<Link href={item.url}>
								<item.icon className="size-6 md:size-7" />
								<span className="sr-only">{item.name}</span>
							</Link>
						</Button>
					</div>
				);
			})}
			<UserSheet
				trigger={
					<div className="flex h-full w-full items-center justify-center">
						<Button
							variant="ghost"
							size="icon"
							className="group rounded-none border-none bg-transparent shadow-none hover:bg-transparent group-hover:text-stone-900"
						>
							<List className="size-6 md:size-7" />
							<span className="sr-only">More Menu</span>
						</Button>
					</div>
				}
			/>
		</nav>
	);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth();
	const isTablet = useIsTablet();

	// Render bottom navigation on tablet and mobile
	if (isTablet) {
		return <BottomNavigation />;
	}

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<AppSidebarIcon />
			</SidebarHeader>
			<SidebarContent>
				<NavGroup
					name="Main Menu"
					navGroup={navigationData.mainMenu.filter((item) =>
						item.roleAllowed.includes(user?.role || "member"),
					)}
				/>
				{navigationData.memberManagement.length > 0 && (
					<NavGroup
						name="Member Management"
						navGroup={navigationData.memberManagement.filter((item) =>
							item.roleAllowed.includes(user?.role || "member"),
						)}
					/>
				)}
				{navigationData.miscellaneous.length > 0 && (
					<NavGroup
						name="Miscellaneous"
						navGroup={navigationData.miscellaneous.filter((item) =>
							item.roleAllowed.includes(user?.role || "member"),
						)}
					/>
				)}
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
