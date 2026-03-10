"use client";

import { redirect, usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import FloatingNav from "@/components/floating-nav";
import Footer from "@/components/footer";
import LoadingScreen, {
	EXIT_ANIMATION_DURATION_MS,
} from "@/components/loading-screen";
import { useAuth } from "@/hooks/auth/use-auth";

export default function PublicLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user, isInitialized } = useAuth();
	const pathname = usePathname();

	// Landing/marketing pages - show loading screen, nav, and footer
	const isLandingPage =
		pathname === "/" ||
		pathname.startsWith("/about") ||
		pathname.startsWith("/services") ||
		pathname.startsWith("/blog") ||
		pathname.startsWith("/contact") ||
		pathname === "/privacy-policy" ||
		pathname === "/terms-and-conditions" ||
		pathname.startsWith("/resources");

	// Pages where nav should be hidden
	const isNavHidden =
		pathname.startsWith("/auth") ||
		pathname.startsWith("/forget-password") ||
		pathname.startsWith("/event") ||
		pathname.startsWith("/vendor-signup") ||
		pathname.startsWith("/payment");

	// Redirect authenticated users away from auth pages
	if (user && pathname.startsWith("/auth")) {
		redirect("/dashboard");
	}
	if (user && pathname.startsWith("/forget-password")) {
		redirect("/dashboard");
	}

	// Loading screen state - only for landing pages
	const [showLoading, setShowLoading] = useState(isLandingPage);
	const [isExiting, setIsExiting] = useState(false);
	const [minTimeElapsed, setMinTimeElapsed] = useState(false);

	// Minimum display time for loading screen (800ms)
	useEffect(() => {
		if (!isLandingPage) return;

		const minTimer = setTimeout(() => {
			setMinTimeElapsed(true);
		}, 800);

		return () => clearTimeout(minTimer);
	}, [isLandingPage]);

	// Handle loading screen exit animation
	useEffect(() => {
		if (!isLandingPage) return;

		if (isInitialized && minTimeElapsed && showLoading) {
			setIsExiting(true);

			const timer = setTimeout(() => {
				setShowLoading(false);
			}, EXIT_ANIMATION_DURATION_MS);

			return () => clearTimeout(timer);
		}
	}, [isInitialized, minTimeElapsed, showLoading, isLandingPage]);

	return (
		<>
			{showLoading && <LoadingScreen isExiting={isExiting} />}

			<div className="relative min-h-screen w-full">
				{!isNavHidden && <FloatingNav />}
				<main className="h-full w-full">{children}</main>
				{isLandingPage && <Footer />}
				{process.env.NODE_ENV === "production" && (
					<Script
						src="https://plugin.nytsys.com/api/site/663be6f4-0a22-4d55-af28-2ff3becb064c/nytsys.min.js"
						strategy="afterInteractive"
					/>
				)}
			</div>
		</>
	);
}
