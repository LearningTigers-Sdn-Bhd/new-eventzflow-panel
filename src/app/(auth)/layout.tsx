"use client";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import LoadingPage from "@/components/admin-ui/loading-page";
import { AppSidebar } from "@/components/admin-ui/sidebar/app-sidebar";
import { EventSidebar } from "@/components/admin-ui/sidebar/event-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";
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

export default function AuthLayout({
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

	// Extract event_id from pathname
	const eventId = useMemo(() => {
		if (!isEventRoute) return null;
		const match = pathname.match(/^\/event\/([^/]+)/);
		return match ? match[1] : null;
	}, [pathname, isEventRoute]);

	// Calculate left offset for event sidebar based on main sidebar state
	// Main sidebar uses collapsible="icon", so:
	// - When open: 16rem (256px) - expanded width
	// - When closed: 3rem (48px) - icon width
	const eventSidebarLeftOffset = useMemo(() => {
		if (isTablet) return 0; // No offset on tablet/mobile
		// Convert rem to pixels: 16rem = 256px, 3rem = 48px
		return isMainSidebarOpen ? "16rem" : "3rem";
	}, [isMainSidebarOpen, isTablet]);

	// Side effects: Handle redirects
	useEffect(() => {
		// Wait for hydration before handling redirects
		if (!isHydrated) return;

		// Redirect unauthenticated users to login
		if (!user) {
			router.push("/auth?mode=login" as Route);
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
			return <div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>;

		case "sidebar":
			return (
				<SidebarProvider
					open={isMainSidebarOpen}
					onOpenChange={setMainSidebarOpen}
				>
					<AppSidebar />
					<SidebarInset>
						{/* Nested SidebarProvider for event sidebar when on event routes */}
						{isEventRoute && eventId ? (
							<SidebarProvider
								open={isEventSidebarOpen}
								onOpenChange={setEventSidebarOpen}
							>
								<EventSidebar
									eventId={eventId}
									leftOffset={eventSidebarLeftOffset}
								/>
								<SidebarInset>
									{!isTablet && (
										<header className="flex h-12 flex-row items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
											<div className="flex flex-row items-stretch justify-start gap-2 px-12">
												<Separator
													orientation="vertical"
													className="data-[orientation=vertical]:h-12"
												/>
											</div>
											<div className="flex items-center gap-2 px-4" />
											<div className="flex flex-row items-stretch justify-start gap-2 px-12">
												<Separator
													orientation="vertical"
													className="data-[orientation=vertical]:h-12"
												/>
											</div>
										</header>
									)}
									<div
										className={cn("mx-auto w-full px-12", isTablet && "px-4")}
									>
										<div
											className={cn(
												"min-h-[calc(100vh-48px)] w-full",
												isTablet ? "pb-24" : "border-x border-dashed pb-12",
											)}
										>
											<div className="w-full">{children}</div>
										</div>
									</div>
									{!isTablet && (
										<footer className="flex h-12 flex-row items-center justify-between gap-2 border-t transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
											<div className="flex flex-row items-stretch justify-start gap-2 px-12">
												<Separator
													orientation="vertical"
													className="data-[orientation=vertical]:h-12"
												/>
											</div>
											<div className="flex flex-row items-stretch justify-start gap-2 px-12">
												<Separator
													orientation="vertical"
													className="data-[orientation=vertical]:h-12"
												/>
											</div>
										</footer>
									)}
								</SidebarInset>
							</SidebarProvider>
						) : (
							<>
								{!isTablet && (
									<header className="flex h-12 flex-row items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
										<div className="flex flex-row items-stretch justify-start gap-2 px-12">
											<Separator
												orientation="vertical"
												className="data-[orientation=vertical]:h-12"
											/>
										</div>
										<div className="flex items-center gap-2 px-4" />
										<div className="flex flex-row items-stretch justify-start gap-2 px-12">
											<Separator
												orientation="vertical"
												className="data-[orientation=vertical]:h-12"
											/>
										</div>
									</header>
								)}
								<div className={cn("mx-auto w-full px-12", isTablet && "px-4")}>
									<div
										className={cn(
											"min-h-[calc(100vh-48px)] w-full",
											isTablet ? "pb-24" : "border-x border-dashed pb-12",
										)}
									>
										<div className="w-full">{children}</div>
									</div>
								</div>
								{!isTablet && (
									<footer className="flex h-12 flex-row items-center justify-between gap-2 border-t transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
										<div className="flex flex-row items-stretch justify-start gap-2 px-12">
											<Separator
												orientation="vertical"
												className="data-[orientation=vertical]:h-12"
											/>
										</div>
										<div className="flex flex-row items-stretch justify-start gap-2 px-12">
											<Separator
												orientation="vertical"
												className="data-[orientation=vertical]:h-12"
											/>
										</div>
									</footer>
								)}
							</>
						)}
					</SidebarInset>
				</SidebarProvider>
			);

		default:
			return null;
	}
}
