"use client";

import { useQuery } from "@tanstack/react-query";
import type * as React from "react";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
import { AppMobileBottomNav } from "@/components/admin-ui/sidebar/app-mobile-bottom-nav";
import { NavUser } from "@/components/admin-ui/sidebar/app-nav-footer";
import { AppSidebarIcon } from "@/components/admin-ui/sidebar/app-sidebar-icon";
import { NavGroup } from "@/components/admin-ui/sidebar/nav-group";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { getContractor } from "@/lib/api/contractor";
import {
	getFilteredNavigation,
	type UserPermissions,
	type UserRole,
} from "./app-menu-config";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth();
	const { permissions: resourcePermissions } = useUserPermissions();

	// Fetch contractor profile for exhibition_contractor users
	const isContractor = user?.role === "exhibition_contractor";
	const { data: contractor } = useQuery({
		queryKey: ["contractor", user?.id],
		queryFn: () => {
			if (!user?.id) throw new Error("User ID required");
			return getContractor(user.id);
		},
		enabled: !!user?.id && isContractor,
	});

	// Build permissions object from contractor profile and resource permissions
	const permissions: UserPermissions | undefined = {
		...(isContractor && contractor
			? {
					allow_printing_services:
						contractor.exhibition_contractor_profile?.allow_printing_services,
				}
			: {}),
		...resourcePermissions,
	};

	// Get filtered navigation based on user role and permissions
	const filteredNav = getFilteredNavigation(
		user?.role as UserRole,
		permissions,
	);

	return (
		<ResponsiveLayout>
			<DesktopView>
				<Sidebar collapsible="icon" {...props}>
					<SidebarHeader>
						<AppSidebarIcon />
					</SidebarHeader>
					<SidebarContent>
						<NavGroup name="Main Menu" navGroup={filteredNav.mainMenu} />
						{filteredNav.memberManagement.length > 0 && (
							<NavGroup
								name="Member Management"
								navGroup={filteredNav.memberManagement}
							/>
						)}
						{filteredNav.miscellaneous.length > 0 && (
							<NavGroup
								name="Miscellaneous"
								navGroup={filteredNav.miscellaneous}
							/>
						)}
					</SidebarContent>
					<SidebarFooter>
						<NavUser />
					</SidebarFooter>
					<SidebarRail />
				</Sidebar>
			</DesktopView>
			<MobileTabletView>
				<AppMobileBottomNav />
			</MobileTabletView>
		</ResponsiveLayout>
	);
}
