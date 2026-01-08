"use client";

import { PanelLeftIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useIsTablet } from "@/hooks/use-tablet";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { useSidebarStore } from "@/stores/sidebar-store";
import { type MenuGroup, resourceMenuConfig } from "./resource-menu-config";
import { ResourceMenuItem } from "./resource-menu-item";

export function ResourceSidebar({
	leftOffset,
}: {
	leftOffset?: number | string;
}) {
	const pathname = usePathname();
	const isTablet = useIsTablet();

	// Get sidebar state from Zustand store
	const { isEventSidebarOpen, setEventSidebarOpen } = useSidebarStore();

	// Get permissions
	const permissions = useUserPermissions();

	// Filter menu items based on permissions
	const { visibleGroups, visibleStandalone } = useMemo(() => {
		// Filter standalone items
		const filteredStandalone = resourceMenuConfig.standalone.filter((item) =>
			item.visible ? item.visible(permissions) : true,
		);

		// Filter groups and their tabs
		const filteredGroups: MenuGroup[] = resourceMenuConfig.groups
			.map((group) => {
				// Check if group itself is visible
				if (group.visible && !group.visible(permissions)) {
					return null;
				}

				// Filter tabs within the group
				const filteredTabs = group.tabs.filter((tab) =>
					tab.visible ? tab.visible(permissions) : true,
				);

				// Only return group if it has visible tabs
				return filteredTabs.length > 0
					? { ...group, tabs: filteredTabs }
					: null;
			})
			.filter((group): group is MenuGroup => group !== null);

		return {
			visibleGroups: filteredGroups,
			visibleStandalone: filteredStandalone,
		};
	}, [permissions]);

	// Check if menu item is active
	const isActive = useCallback(
		(route: string) => pathname.includes(`/resources/${route}`),
		[pathname],
	);

	// Show loading skeleton while waiting for permissions
	if (permissions.isLoading) {
		return (
			<Sidebar
				leftOffset={leftOffset}
				collapsible="icon"
				className="border-l-0"
			>
				<SidebarContent>
					<SidebarMenu>
						{Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map((key) => (
							<SidebarMenuItem key={key}>
								<SidebarMenuSkeleton showIcon />
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarContent>
				{!isTablet && (
					<SidebarFooter>
						<SidebarMenuButton
							tooltip="Open Resource Navigation"
							onClick={() => setEventSidebarOpen(!isEventSidebarOpen)}
						>
							<PanelLeftIcon />
							<span>Close Resource Navigation</span>
						</SidebarMenuButton>
					</SidebarFooter>
				)}
			</Sidebar>
		);
	}

	return (
		<Sidebar leftOffset={leftOffset} collapsible="icon">
			<ResourceMenuItem
				groups={visibleGroups}
				standalone={visibleStandalone}
				isActive={isActive}
			/>
			{!isTablet && (
				<SidebarFooter className="border-t">
					<SidebarMenuButton
						tooltip="Open Resource Navigation"
						onClick={() => setEventSidebarOpen(!isEventSidebarOpen)}
					>
						<PanelLeftIcon />
						<span>Close Resource Navigation</span>
					</SidebarMenuButton>
				</SidebarFooter>
			)}
		</Sidebar>
	);
}
