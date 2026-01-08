"use client";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AuthMainWrapper } from "@/components/admin-ui/layout/auth-main-wrapper";
import LoadingPage from "@/components/admin-ui/loading-page";
import { AppSidebar } from "@/components/admin-ui/sidebar/app-sidebar";
import { EventSidebar } from "@/components/admin-ui/sidebar/event-sidebar";
import { ResourceSidebar } from "@/components/admin-ui/sidebar/resource-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useIsTablet } from "@/hooks/use-tablet";
import { useSidebarStore } from "@/stores/sidebar-store";

interface NoSidebarRoute {
	route: string;
	type: "start" | "include";
}

const NoSidebarRoutes: NoSidebarRoute[] = [
	{ route: "/verify-email", type: "start" },
	{ route: "lucky-draw/session", type: "include" },
	{ route: "review-submit", type: "include" },
];

export default function AuthLayoutClient({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user, isHydrated } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const isTablet = useIsTablet();

	// Sidebars management with Zustand
	const {
		isMainSidebarOpen,
		isEventSidebarOpen,
		setMainSidebarOpen,
		setEventSidebarOpen,
	} = useSidebarStore();

	// Detect if we're on an event route
	const isEventRoute = useMemo(() => {
		return pathname.startsWith("/event/") && pathname !== "/event";
	}, [pathname]);

	// Detect if we're on a resource route
	const isResourceRoute = useMemo(() => {
		return pathname.startsWith("/resources/") && pathname !== "/resources";
	}, [pathname]);

	// Extract event_id from pathname
	const eventId = useMemo(() => {
		if (!isEventRoute) return null;
		const pathSegments = pathname.split("/"); // e.g., /event/abc -> ["", "event", "abc"]
		const potentialEventId = pathSegments[2];
		return potentialEventId || null;
	}, [pathname, isEventRoute]);

	// Calculate left offset for nested sidebar based on main sidebar state
	const nestedSidebarLeftOffset = useMemo(() => {
		if (isTablet) return 0; // No offset on tablet/mobile
		return isMainSidebarOpen ? "16rem" : "3rem";
	}, [isMainSidebarOpen, isTablet]);

	// Side effects: Handle redirects
	useEffect(() => {
		// Wait for hydration before handling redirects
		if (!isHydrated) return;

		// Redirect unauthenticated users to login
		if (!user) {
			router.push("/auth?login" as Route);
			return;
		}

		// Handle email verification redirects
		// Redirect to verify-email landing page if not verified
		if (!user.email_verified && !pathname.startsWith("/verify-email")) {
			router.push("/verify-email" as "/dashboard");
			return;
		}

		// Redirect to dashboard if already verified and on verify-email pages
		if (user.email_verified && pathname.startsWith("/verify-email")) {
			router.push("/dashboard");
		}
	}, [user, pathname, isHydrated, router]);

	// Determine layout state
	type LayoutState = "loading" | "redirecting" | "no-sidebar" | "sidebar";

	const getLayoutState = (): LayoutState => {
		// Show loading spinner during hydration
		if (!isHydrated) return "loading";

		// Return null while redirecting unauthenticated users
		if (!user) return "redirecting";

		// Prevent unverified users from accessing non-verify-email routes
		// This runs BEFORE children mount, preventing API calls
		if (!user.email_verified && !pathname.startsWith("/verify-email")) {
			return "loading";
		}

		// Check if route should render without sidebar
		const isNoSidebarRoute = NoSidebarRoutes.some(({ route, type }) =>
			type === "start" ? pathname.startsWith(route) : pathname.includes(route),
		);
		if (isNoSidebarRoute) return "no-sidebar";

		// Default: render sidebar layout for authenticated users
		return "sidebar";
	};

	const layoutState = getLayoutState();

	// Render based on layout state
	switch (layoutState) {
		case "loading":
			return <LoadingPage />;

		case "redirecting":
			return null;

		case "no-sidebar":
			return (
				<div className="mx-auto flex h-svh w-full max-w-7xl flex-col">
					{children}
				</div>
			);

		case "sidebar":
			return (
				<SidebarProvider
					open={isMainSidebarOpen}
					onOpenChange={setMainSidebarOpen}
				>
					<AppSidebar />
					<SidebarInset>
						{isEventRoute && eventId ? (
							<SidebarProvider
								open={isEventSidebarOpen}
								onOpenChange={setEventSidebarOpen}
							>
								<EventSidebar
									eventId={eventId}
									leftOffset={nestedSidebarLeftOffset}
								/>
								<SidebarInset>
									<AuthMainWrapper>{children}</AuthMainWrapper>
								</SidebarInset>
							</SidebarProvider>
						) : isResourceRoute ? (
							<SidebarProvider
								open={isEventSidebarOpen}
								onOpenChange={setEventSidebarOpen}
							>
								<ResourceSidebar leftOffset={nestedSidebarLeftOffset} />
								<SidebarInset>
									<AuthMainWrapper>{children}</AuthMainWrapper>
								</SidebarInset>
							</SidebarProvider>
						) : (
							<AuthMainWrapper>{children}</AuthMainWrapper>
						)}
					</SidebarInset>
				</SidebarProvider>
			);

		default:
			return null;
	}
}
