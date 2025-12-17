"use client";

import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";

// Register GSAP plugin
if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

import { IconHeading } from "@/components/admin-ui/icon-heading";
import { routeMenuMap } from "@/components/admin-ui/sidebar/event-menu-config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useIsMobile } from "@/hooks/use-mobile";
import { getEvents } from "@/lib/api/event";
import { cn } from "@/lib/utils";
import { useEventActionsStore } from "@/stores/event-actions-store";

interface EventDetailLayoutProps {
	children: React.ReactNode;
	params: Promise<{
		event_id: string;
	}>;
}

// EventActionsSlot - renders actions from Zustand store
function EventActionsSlot() {
	const actions = useEventActionsStore((state) => state.actions);
	return actions ? (
		<div className="flex items-center gap-3">{actions}</div>
	) : null;
}

// MobileNavigationMenu - shows current menu label and sidebar trigger on mobile
function MobileNavigationMenu({
	currentMenuLabel,
}: {
	currentMenuLabel: string;
}) {
	const { toggleSidebar } = useSidebar();

	return (
		<div className="flex items-center justify-between gap-4 rounded-none border bg-muted px-4 py-2">
			<span className="font-semibold text-sm">{currentMenuLabel}</span>
			<Button
				variant="ghost"
				size="icon"
				onClick={toggleSidebar}
				className="size-8"
			>
				<Menu className="size-5" />
				<span className="sr-only">Open Event Navigation</span>
			</Button>
		</div>
	);
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
					status === "draft" && "bg-yellow-200 text-yellow-800",
					status === "published" && "bg-green-200 text-green-800",
					status === "cancelled" && "bg-red-200 text-red-800",
					status === "completed" && "bg-blue-200 text-blue-800",
				)}
			>
				{status}
			</Badge>
			<Badge
				variant="secondary"
				className={cn(
					"rounded-none font-bold capitalize",
					use_ticket
						? "bg-green-200 text-green-800"
						: "bg-red-200 text-red-800",
				)}
			>
				{use_ticket ? "Tickets Event" : "Visitors Event"}
			</Badge>
		</>
	);
}

interface MobileEventHeaderProps {
	currentEvent: {
		title: string;
		status: "draft" | "published" | "cancelled" | "completed";
		use_ticket: boolean;
	};
	currentMenuTitle: string;
}

function MobileEventHeader({
	currentEvent,
	currentMenuTitle,
}: MobileEventHeaderProps) {
	const headerRef = useRef<HTMLDivElement>(null);
	const detailsRef = useRef<HTMLDivElement>(null);
	const descriptionRef = useRef<HTMLDivElement>(null);
	const [isSticky, setIsSticky] = useState(false);

	useEffect(() => {
		const ctx = gsap.context(() => {
			ScrollTrigger.create({
				trigger: headerRef.current,
				start: "top top-=50px",
				onEnter: () => {
					setIsSticky(true);
					// Only animate the smooth transitions, let CSS handle positioning
					gsap.to(descriptionRef.current, {
						height: 0,
						opacity: 0,
						duration: 0.25,
						ease: "power2.out",
					});
					gsap.to(detailsRef.current, {
						paddingTop: "0.5rem",
						paddingBottom: "0.5rem",
						duration: 0.25,
						ease: "power2.out",
					});
				},
				onLeaveBack: () => {
					setIsSticky(false);
					// Reverse animations
					gsap.to(descriptionRef.current, {
						height: "auto",
						opacity: 1,
						duration: 0.25,
						ease: "power2.in",
					});
					gsap.to(detailsRef.current, {
						paddingTop: "0.5rem",
						paddingBottom: "2rem",
						duration: 0.25,
						ease: "power2.in",
					});
				},
			});
		});

		return () => ctx.revert(); // Cleanup
	}, []);

	return (
		<>
			{/* Placeholder div to prevent layout jump when header becomes fixed */}
			{isSticky && <div className="h-40" />}
			{/* When scrolling, the change div into absolute top-0, w-screen, -mt-4 */}
			<div
				ref={headerRef}
				className={cn(
					"flex flex-col",
					isSticky
						? "-mt-4 fixed top-0 left-0 z-50 w-screen pt-4 shadow-sm"
						: "relative w-full",
				)}
			>
				<div
					ref={detailsRef}
					className={cn(
						"flex w-full flex-col items-start gap-2 rounded-none border bg-muted px-4 transition-all duration-300",
						isSticky ? "pt-2 pb-2" : "pt-2 pb-8",
					)}
				>
					<div className="flex h-full items-center gap-4">
						<AvatarIcon title={currentEvent.title} />
						{/* When scrolling, the title should be truncated */}
						<h3
							className={cn(
								"text-balance font-bold text-lg tracking-tight md:text-xl",
								isSticky && "line-clamp-1",
							)}
						>
							{currentEvent.title}
						</h3>
					</div>
					{/* When scrolling, dont render this div */}
					<div
						ref={descriptionRef}
						className={cn(
							"flex w-full flex-col gap-2 overflow-hidden transition-all duration-300",
							isSticky && "hidden",
						)}
					>
						<p className="text-muted-foreground text-sm md:text-base">
							{`Manage current event details, team members and vendors, and ${currentEvent.use_ticket ? "tickets" : "visitors"}.`}
						</p>
						<div className="flex items-center gap-2">
							<EventBadges
								status={currentEvent.status}
								use_ticket={currentEvent.use_ticket}
							/>
						</div>
					</div>
				</div>
				<MobileNavigationMenu currentMenuLabel={currentMenuTitle} />
			</div>
		</>
	);
}

export default function EventDetailLayout({
	children,
	params,
}: EventDetailLayoutProps) {
	const pathname = usePathname();
	const { event_id } = use(params);
	const isMobile = useIsMobile();

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

	// Determine current menu from pathname
	const currentMenu = useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);

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

	// Check if we're on the lucky-draw session route
	const isLuckyDrawSessionRoute = pathname.includes("lucky-draw/session");
	if (isLuckyDrawSessionRoute) {
		return <div className="w-full">{children}</div>;
	}

	// Check if we're on the review-submit route (checkout-style page)
	const isReviewSubmitRoute = pathname.includes("review-submit");
	if (isReviewSubmitRoute) {
		return <div className="mx-auto">{children}</div>;
	}

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
					<div className="mx-auto flex w-full items-start gap-4 md:max-w-5xl md:px-0 2xl:max-w-7xl">
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
				) : currentEvent ? (
					<MobileEventHeader
						currentEvent={currentEvent}
						currentMenuTitle={currentMenuTitle}
					/>
				) : null}
			</div>

			{/* Current Menu Header */}
			<div className="mx-auto w-full max-w-4xl rounded-none bg-card px-0 md:max-w-5xl 2xl:max-w-7xl">
				<div className="flex flex-col gap-2 px-0 py-0 md:flex-row md:items-center md:justify-between">
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
				<div className="w-full pt-4">
					<div className="w-full">{children}</div>
				</div>
			</div>
		</div>
	);
}
