"use client";

import { Menu } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { IconHeading } from "@/components/admin-ui/icon-heading";
import {
	MobileStickyHeader,
	MobileStickyHeaderContent,
	MobileStickyHeaderIcon,
	MobileStickyHeaderMain,
	MobileStickyHeaderNav,
	MobileStickyHeaderRow,
	MobileStickyHeaderTitle,
} from "@/components/admin-ui/layout/mobile-sticky-header";
import { routeMenuMap } from "@/components/sidebars/features/events/event-menu-config";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";
import { useEventActionsStore } from "@/stores/event-actions-store";

interface EventDetailLayoutProps {
	children: React.ReactNode;
}

// EventActionsSlot - renders actions from Zustand store
function EventActionsSlot() {
	const actions = useEventActionsStore((state) => state.actions);
	return actions ? (
		<div className="flex items-center gap-3">{actions}</div>
	) : null;
}

function AvatarIcon({ title }: { title: string }) {
	return (
		<Avatar className="size-8 rounded-none md:size-10">
			<AvatarFallback className="rounded-none bg-amber-200 font-bold">
				{title
					.split(" ")
					.map((word) => word.charAt(0))
					.slice(0, 2)
					.join("")}
			</AvatarFallback>
		</Avatar>
	);
}

interface EventBadgesProps {
	status: "draft" | "published" | "cancelled" | "completed";
	use_ticket: boolean;
}
function EventBadges({ status, use_ticket }: EventBadgesProps) {
	return (
		<>
			<Badge
				variant="secondary"
				className={cn(
					"rounded-none font-bold capitalize",
					status === "draft" && "bg-yellow-500 text-white",
					status === "published" && "bg-green-500 text-white",
					status === "cancelled" && "bg-red-500 text-white",
					status === "completed" && "bg-blue-500 text-white",
				)}
			>
				{status}
			</Badge>
			<Badge
				variant="secondary"
				className={cn(
					"rounded-none font-bold capitalize",
					use_ticket ? "bg-purple-500 text-white" : "bg-cyan-500 text-white",
				)}
			>
				{use_ticket ? "Ticket Event" : "Visitor Event"}
			</Badge>
		</>
	);
}

export default function EventDetailLayout({
	children,
}: EventDetailLayoutProps) {
	const pathname = usePathname();

	// Check if we're on special routes that don't need sidebar - check FIRST before any sidebar hooks
	const isLuckyDrawSessionRoute = pathname.includes("lucky-draw/session");
	const isPrizeRouletteSessionRoute = pathname.includes(
		"prize-roulette/session",
	);
	const isSeatTicketingSessionRoute = pathname.includes(
		"seat-ticketing/sessions/",
	);
	const isReviewSubmitRoute = pathname.includes("review-submit");

	// Early return for special routes that don't use sidebar
	if (
		isLuckyDrawSessionRoute ||
		isPrizeRouletteSessionRoute ||
		isSeatTicketingSessionRoute
	) {
		return <div className="w-full">{children}</div>;
	}

	if (isReviewSubmitRoute) {
		return <div className="mx-auto">{children}</div>;
	}

	// Render the full layout with sidebar integration
	return (
		<EventDetailLayoutContent pathname={pathname}>
			{children}
		</EventDetailLayoutContent>
	);
}

// Separate component that uses useSidebar and useEventSidebarContext
function EventDetailLayoutContent({
	children,
	pathname,
}: {
	children: React.ReactNode;
	pathname: string;
}) {
	const isMobile = useIsMobile();
	const isTablet = useIsTablet();
	const { toggleSidebar } = useSidebar();
	const router = useRouter();

	// Use context from EventSidebarProvider - no more duplicate data fetching!
	const { currentEvent, permissions, isLoading } = useEventSidebarContext();

	// A pure business host's only concerns on this event are Business
	// Matching and their own Host Profile — the sidebar only ever shows
	// those two tabs, but nothing stops them from typing/bookmarking any
	// other event URL (analytics, scanned-logs, etc.) directly. Guard at
	// the layout level too, not just in the nav.
	useEffect(() => {
		if (isLoading || !currentEvent?.id) return;

		const isPureBusinessHost =
			permissions.isBusinessHost &&
			!permissions.isOrgOwner &&
			!permissions.isOrganizer &&
			!permissions.isEventAdmin &&
			!permissions.isEventTeamMember &&
			!permissions.isEventVendor &&
			!permissions.isExhibitionContractor;

		const segments = pathname.split("/").filter(Boolean);

		if (
			isPureBusinessHost &&
			!segments.includes("business-matching") &&
			!segments.includes("host-profile")
		) {
			router.replace(`/event/${currentEvent.id}/business-matching` as Route);
		}
	}, [isLoading, permissions, pathname, currentEvent?.id, router]);

	// A business_matching_admin's only concern on this event is Business
	// Matching — their sidebar only ever shows that one tab, but nothing
	// stops them from typing/bookmarking any other event URL directly.
	// Guard at the layout level too, not just in the nav.
	useEffect(() => {
		if (isLoading || !currentEvent?.id) return;

		const isPureBusinessMatchingAdmin =
			permissions.isBusinessMatchingAdmin &&
			!permissions.isOrgOwner &&
			!permissions.isOrganizer &&
			!permissions.isEventAdmin &&
			!permissions.isEventTeamMember &&
			!permissions.isEventVendor &&
			!permissions.isExhibitionContractor;

		const segments = pathname.split("/").filter(Boolean);

		if (
			isPureBusinessMatchingAdmin &&
			!segments.includes("business-matching")
		) {
			router.replace(`/event/${currentEvent.id}/business-matching` as Route);
		}
	}, [isLoading, permissions, pathname, currentEvent?.id, router]);

	// Determine current menu from pathname
	const currentMenu = useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);

		// First, try to match composite routes (e.g., "analytics/ticket", "analytics/visitor")
		for (let i = segments.length - 1; i >= 1; i--) {
			const compositeRoute = `${segments[i - 1]}/${segments[i]}`;
			if (routeMenuMap[compositeRoute]) {
				return {
					title: routeMenuMap[compositeRoute].label,
					description: routeMenuMap[compositeRoute].description,
					icon: routeMenuMap[compositeRoute].icon,
				};
			}
		}

		// Walk from the end to find the first segment that matches a route
		for (let i = segments.length - 1; i >= 0; i--) {
			const segment = segments[i];
			if (routeMenuMap[segment]) {
				return {
					title: routeMenuMap[segment].label,
					description: routeMenuMap[segment].description,
					icon: routeMenuMap[segment].icon,
				};
			}
		}

		// Default to location if no match found
		return {
			title: routeMenuMap.location.label,
			description: routeMenuMap.location.description,
			icon: routeMenuMap.location.icon,
		};
	}, [pathname]);

	// Update vendor title dynamically based on permissions
	const currentMenuTitle = useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);
		const lastSegment = segments[segments.length - 1];

		// Special handling for vendors route
		if (lastSegment === "vendors" || pathname.includes("/vendors/")) {
			if (permissions.isEventVendor && !permissions.canManageEventVendors) {
				return "Vendor Profile";
			}
			return "Event Vendors";
		}

		return currentMenu.title;
	}, [pathname, currentMenu.title, permissions]);

	return (
		<div className="flex min-h-screen flex-col gap-2 md:gap-4">
			{/* Event Header */}
			<div className="rounded-none border-b-0 border-dashed px-0 pt-4 pb-0 md:border-b md:px-4 md:pb-4">
				{isLoading ? (
					<>
						<Skeleton className="mb-2 h-9 w-64" />
						<Skeleton className="h-5 w-96" />
					</>
				) : !isMobile ? (
					<div className="mx-auto flex w-full flex-row justify-between gap-4 3xl:px-4 md:max-w-5xl md:px-0 2xl:max-w-7xl">
						<div className="flex w-full flex-row gap-4">
							<AvatarIcon title={currentEvent?.title || ""} />
							<div className="flex flex-col gap-2">
								<div className="flex flex-col items-start">
									<h3 className="line-clamp-1 font-bold text-lg leading-none tracking-tight md:text-xl">
										{currentEvent?.title}
									</h3>
									<p className="text-muted-foreground text-sm md:text-base">
										{`Manage current event details, team members and vendors, and ${currentEvent?.use_ticket ? "tickets" : "visitors"}.`}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<EventBadges
										status={currentEvent?.status || "draft"}
										use_ticket={currentEvent?.use_ticket || false}
									/>
								</div>
							</div>
						</div>
						{isTablet && (
							<div className="flex items-center justify-end">
								<Button
									variant="ghost"
									size="icon"
									onClick={toggleSidebar}
									className="size-8 rounded-none"
								>
									<Menu className="size-5" />
									<span className="sr-only">Open Event Navigation</span>
								</Button>
							</div>
						)}
					</div>
				) : currentEvent ? (
					<MobileStickyHeader>
						<MobileStickyHeaderMain>
							<MobileStickyHeaderRow>
								<MobileStickyHeaderIcon
									icon={<AvatarIcon title={currentEvent.title} />}
								/>
								<MobileStickyHeaderTitle>
									{currentEvent.title}
								</MobileStickyHeaderTitle>
							</MobileStickyHeaderRow>

							<MobileStickyHeaderContent>
								<p className="text-muted-foreground text-sm md:text-base">
									{`Manage current event details, team members and vendors, and ${currentEvent.use_ticket ? "tickets" : "visitors"}.`}
								</p>
								<div className="flex items-center gap-2">
									<EventBadges
										status={currentEvent.status}
										use_ticket={currentEvent.use_ticket}
									/>
								</div>
							</MobileStickyHeaderContent>
						</MobileStickyHeaderMain>
						<MobileStickyHeaderNav label={currentMenuTitle} />
					</MobileStickyHeader>
				) : null}
			</div>

			{/* Current Menu Header */}
			<div className="mx-auto w-full max-w-4xl rounded-none bg-transparent px-0 md:max-w-5xl 2xl:max-w-7xl">
				<div className="flex flex-col gap-2 px-0 py-0 md:flex-row md:items-center md:justify-between md:px-4">
					<IconHeading
						icon={currentMenu.icon}
						title={currentMenuTitle}
						description={currentMenu.description}
					/>

					{/* Event Actions Slot */}
					<div className="py-2 md:py-0">
						<EventActionsSlot />
					</div>
				</div>

				{/* Page Content */}
				<div className="w-full pt-4 md:px-4">
					<div className="w-full">{children}</div>
				</div>
			</div>
		</div>
	);
}
