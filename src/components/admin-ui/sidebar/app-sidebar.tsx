"use client";

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
import { useAuth } from "@/hooks/auth/use-auth";
import { useContractorPermissions } from "@/hooks/use-contractor-permissions";
import { useNavigation } from "@/hooks/use-navigation";
import type { UserRole } from "./app-menu-config";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth();
	const { permissions } = useContractorPermissions();
	const { filteredNav } = useNavigation(user?.role as UserRole, permissions);

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
