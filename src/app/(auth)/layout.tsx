"use client";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user, isHydrated } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	// Redirect unauthenticated users to login
	useEffect(() => {
		if (!user && isHydrated) {
			router.push("/auth?mode=login" as Route);
			return;
		}
	}, [user, isHydrated, router]);

	// Handle email verification redirects
	useEffect(() => {
		if (!user || !isHydrated) return;

		// Redirect to verify-email landing page if not verified
		if (!user.email_verified && !pathname.startsWith("/verify-email")) {
			router.push("/verify-email" as "/dashboard");
			return;
		}

		// Redirect to dashboard if already verified and on verify-email pages
		if (user.email_verified && pathname.startsWith("/verify-email")) {
			router.push("/dashboard");
			return;
		}
	}, [user, pathname, isHydrated, router]);

	// Show loading spinner during hydration
	if (!isHydrated) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<Spinner className="size-16 text-emerald-500" />
			</div>
		);
	}

	// Return null while redirecting
	if (!user) return null;

	// Early return guard: Prevent unverified users from accessing non-verify-email routes
	// This runs BEFORE children mount, preventing API calls
	if (user && !user.email_verified && !pathname.startsWith("/verify-email")) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<Spinner className="size-16 text-emerald-500" />
			</div>
		);
	}

	// Render verify-email pages without sidebar
	if (pathname.startsWith("/verify-email")) {
		return <div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>;
	}

	// Render sidebar layout for authenticated users
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-12"
						/>
					</div>
				</header>
				<div className="mx-auto min-h-screen w-full p-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
