"use client";

import { useQuery } from "@tanstack/react-query";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname, useRouter } from "next/navigation";
import { use, useCallback } from "react";
import { TabHeader } from "@/components/pages/event/tab-header";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useIsTablet } from "@/hooks/use-tablet";
import { getEvents } from "@/lib/api/event";
import {
	EventHeader,
	EventActionsSlot,
	TabNavigationDesktop,
	TabNavigationMobile,
	useTabFiltering,
	useTabGrouping,
	useCurrentTab,
	TAB_ITEMS,
} from "@/components/pages/event/event-layout";

interface EventDetailLayoutProps {
	children: React.ReactNode;
	params: Promise<{
		event_id: string;
	}>;
}

export default function EventDetailLayout({
	children,
	params,
}: EventDetailLayoutProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { event_id } = use(params);
	const isTablet = useIsTablet();

	// Fetch event details
	const { data: events, isLoading } = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
	});
	const currentEvent = events?.find(
		(event) => event.id.toString() === event_id,
	);

	// Get event permissions for the current user
	const permissions = useEventPermissions(event_id, currentEvent);

	// Filter tabs based on permissions and event type
	const visibleTabs = useTabFiltering(currentEvent, permissions);

	// Group tabs
	const {
		mainTabs,
		ticketTabs,
		analyticsTabs,
		logsTabs,
		exhibitorKitTabs,
		userManagementTabs,
	} = useTabGrouping(visibleTabs);

	// Get current tab and tab item (only after loading completes)
	const { currentTab, currentTabItem } = useCurrentTab(
		pathname,
		visibleTabs,
		event_id,
		permissions,
	);

	const handleTabChange = useCallback(
		(value: string) => {
			const tab = TAB_ITEMS.find((t) => t.id === value);
			const route = tab?.route ?? value;
			const path = `/event/${event_id}/${route}`;
			(router as AppRouterInstance).push(path);
		},
		[event_id, router],
	);

	// Check if we're on the lucky-draw session route
	const isLuckyDrawSessionRoute = pathname.includes("lucky-draw/session");
	if (isLuckyDrawSessionRoute) {
		return <div className="mx-auto">{children}</div>;
	}

	// Check if we're on the review-submit route (checkout-style page)
	const isReviewSubmitRoute = pathname.includes("review-submit");
	if (isReviewSubmitRoute) {
		return <>{children}</>;
	}

	// Show loading state while fetching event data
	// This prevents showing wrong tabs to vendors/contractors during load
	if (isLoading) {
		return (
			<div className="p-0">
				<EventHeader event={currentEvent} eventId={event_id} isLoading={isLoading} />
				<div className="w-full border-y border-dashed">
					<div className="h-12 w-full animate-pulse bg-accent/50" />
				</div>
				<div className="w-full rounded-none border border-dashed bg-card">
					<div className="border-b border-dashed p-4">
						<div className="h-8 w-48 animate-pulse rounded bg-muted" />
						<div className="mt-2 h-4 w-96 animate-pulse rounded bg-muted" />
					</div>
					{children}
				</div>
			</div>
		);
	}

	// If no tabs are visible, show a message
	if (mainTabs.length === 0) {
		return (
			<div className="p-8 text-center">
				<p className="text-muted-foreground">
					You don't have permission to view this event.
				</p>
			</div>
		);
	}

	return (
		<div className="p-0">
			<EventHeader event={currentEvent} eventId={event_id} isLoading={false} />

			{isTablet ? (
				<TabNavigationMobile
					currentTab={currentTab}
					currentTabItem={currentTabItem}
					mainTabs={mainTabs}
					ticketTabs={ticketTabs}
					analyticsTabs={analyticsTabs}
					logsTabs={logsTabs}
					exhibitorKitTabs={exhibitorKitTabs}
					userManagementTabs={userManagementTabs}
					onTabChange={handleTabChange}
				/>
			) : (
				<TabNavigationDesktop
					currentTab={currentTab}
					mainTabs={mainTabs}
					ticketTabs={ticketTabs}
					analyticsTabs={analyticsTabs}
					logsTabs={logsTabs}
					exhibitorKitTabs={exhibitorKitTabs}
					userManagementTabs={userManagementTabs}
					onTabChange={handleTabChange}
				/>
			)}

			<div className="w-full rounded-none border border-dashed bg-card">
				<TabHeader
					icon={currentTabItem.icon}
					title={currentTabItem.title}
					description={currentTabItem.description}
					actions={<EventActionsSlot />}
				/>
				{children}
			</div>
		</div>
	);
}
