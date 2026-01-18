"use client";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingPage from "@/components/admin-ui/loading-page";
import { SidebarOrchestrator } from "@/components/sidebars/orchestrator/sidebar-orchestrator";
import { useAuth } from "@/hooks/auth/use-auth";

/**
 * AuthLayoutClient
 *
 * Handles authentication state and renders the sidebar orchestrator.
 * The SidebarOrchestrator manages all layout states internally:
 * - No sidebar routes (verify-email, etc.)
 * - Single sidebar (main routes)
 * - Double sidebar (feature routes like events, resources)
 */
export default function AuthLayoutClient({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user, isInitialized } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	// Side effects: Handle redirects
	useEffect(() => {
		// Wait for hydration before handling redirects
		if (!isInitialized) return;

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
	}, [user, pathname, isInitialized, router]);

	// Loading state - waiting for auth hydration
	if (!isInitialized) {
		return <LoadingPage />;
	}

	// Redirecting - unauthenticated users
	if (!user) {
		return null;
	}

	// Prevent unverified users from accessing non-verify-email routes
	// This runs BEFORE children mount, preventing API calls
	if (!user.email_verified && !pathname.startsWith("/verify-email")) {
		return <LoadingPage />;
	}

	// SidebarOrchestrator handles all layout states:
	// - no-sidebar, single-sidebar, double-sidebar
	return <SidebarOrchestrator>{children}</SidebarOrchestrator>;
}
