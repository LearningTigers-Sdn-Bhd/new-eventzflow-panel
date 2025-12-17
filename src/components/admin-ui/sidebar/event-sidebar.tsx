"use client";

import { PanelLeftIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useIsTablet } from "@/hooks/use-tablet";
import type { Event } from "@/lib/api/event/response";
import { useSidebarStore } from "@/stores/sidebar-store";
import { eventMenuConfig, type MenuGroup } from "./event-menu-config";
import { EventMenuHeader } from "./event-menu-header";
import { EventMenuItem } from "./event-menu-item";

export function EventSidebar({
	eventId,
	leftOffset,
}: {
	eventId: string;
	leftOffset?: number | string;
}) {
	const pathname = usePathname();
	const [currentEvent, setCurrentEvent] = useState<Event | undefined>();
	const isTablet = useIsTablet();

	// Get sidebar state from Zustand store
	const { isEventSidebarOpen, setEventSidebarOpen } = useSidebarStore();

	// Get permissions
	const permissions = useEventPermissions(eventId, currentEvent);

	// Handle events loaded from header
	const handleEventsLoaded = useCallback(
		(_events: Event[], event: Event | undefined) => {
			setCurrentEvent(event);
		},
		[],
	);

	// Filter menu items based on permissions and event settings
	const { visibleGroups, visibleStandalone } = useMemo(() => {
		if (!currentEvent) {
			return { visibleGroups: [], visibleStandalone: [] };
		}

		// Filter standalone items
		const filteredStandalone = eventMenuConfig.standalone.filter((item) =>
			item.visible ? item.visible(permissions, currentEvent) : true,
		);

		// Filter groups and their tabs
		const filteredGroups: MenuGroup[] = eventMenuConfig.groups
			.map((group) => {
				// Check if group itself is visible
				if (group.visible && !group.visible(permissions, currentEvent)) {
					return null;
				}

				// Filter tabs within the group
				const filteredTabs = group.tabs.filter((tab) =>
					tab.visible ? tab.visible(permissions, currentEvent) : true,
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
	}, [currentEvent, permissions]);

	// Check if menu item is active
	const isActive = useCallback(
		(route: string) => pathname.includes(`/event/${eventId}/${route}`),
		[pathname, eventId],
	);

	// Show loading skeleton while waiting for event data
	if (!currentEvent) {
		return (
			<Sidebar
				leftOffset={leftOffset}
				collapsible="icon"
				className="border-l-0"
			>
				<EventMenuHeader
					eventId={eventId}
					onEventsLoaded={handleEventsLoaded}
				/>
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
							tooltip="Open Event Navigation"
							onClick={() => setEventSidebarOpen(!isEventSidebarOpen)}
						>
							<PanelLeftIcon />
							<span>Close Event Navigation</span>
						</SidebarMenuButton>
					</SidebarFooter>
				)}
			</Sidebar>
		);
	}

	return (
		<Sidebar leftOffset={leftOffset} collapsible="icon">
			<EventMenuHeader eventId={eventId} onEventsLoaded={handleEventsLoaded} />
			<EventMenuItem
				eventId={eventId}
				groups={visibleGroups}
				standalone={visibleStandalone}
				isActive={isActive}
			/>
			{!isTablet && (
				<SidebarFooter className="border-t">
					<SidebarMenuButton
						tooltip="Open Event Navigation"
						onClick={() => setEventSidebarOpen(!isEventSidebarOpen)}
					>
						<PanelLeftIcon />
						<span>Close Event Navigation</span>
					</SidebarMenuButton>
				</SidebarFooter>
			)}
		</Sidebar>
	);
}
