"use client";

import type * as React from "react";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
import { AppFooter } from "@/components/sidebars/app/app-footer";
import { AppHeader } from "@/components/sidebars/app/app-header";
import { AppMenuItem } from "@/components/sidebars/app/app-menu-item";
import { AppMobileNav } from "@/components/sidebars/app/app-mobile-nav";
import { useNavigation } from "@/components/sidebars/hooks/use-navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth/use-auth";
import { useContractorPermissions } from "@/hooks/use-contractor-permissions";
import type { UserRole } from "./app-menu-config";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user, isPureBusinessMatchingAdmin } = useAuth();
	const { permissions } = useContractorPermissions();
	const { filteredNav } = useNavigation(
		user?.role as UserRole,
		permissions,
		isPureBusinessMatchingAdmin,
	);

	return (
		<ResponsiveLayout>
			<DesktopView>
				<Sidebar collapsible="icon" {...props}>
					<SidebarHeader>
						<AppHeader />
					</SidebarHeader>
					<SidebarContent>
						<AppMenuItem name="Main Menu" navGroup={filteredNav.mainMenu} />
						{filteredNav.memberManagement.length > 0 && (
							<AppMenuItem
								name="Member Management"
								navGroup={filteredNav.memberManagement}
							/>
						)}
						{filteredNav.miscellaneous.length > 0 && (
							<AppMenuItem
								name="Miscellaneous"
								navGroup={filteredNav.miscellaneous}
							/>
						)}
					</SidebarContent>
					<SidebarFooter>
						<AppFooter />
					</SidebarFooter>
					<SidebarRail />
				</Sidebar>
			</DesktopView>
			<MobileTabletView>
				<AppMobileNav />
			</MobileTabletView>
		</ResponsiveLayout>
	);
}
