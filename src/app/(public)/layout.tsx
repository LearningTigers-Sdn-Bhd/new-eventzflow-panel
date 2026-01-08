"use client";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Script from "next/script";
import FloatingNav from "@/components/floating-nav";
import FloatingNavNew from "@/components/pages/home-new/floating-nav-new";
import Footer from "@/components/footer";
import FooterNew from "@/components/pages/home-new/footer-new";
import LoadingScreen, {
	EXIT_ANIMATION_DURATION_MS,
} from "@/components/loading-screen";
import { useAuth } from "@/hooks/use-auth";
import { useHydratedStore } from "@/hooks/use-hydrated-store";

export default function PublicLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const isHydrated = useHydratedStore();
	const { user } = useAuth();
	const pathname = usePathname();
	const [showLoading, setShowLoading] = useState(true);
	const [isExiting, setIsExiting] = useState(false);

	// Handle loading screen exit animation
	useEffect(() => {
		if (isHydrated && showLoading) {
			// Trigger exit animation
			setIsExiting(true);

			// Hide loading screen after animation completes
			const timer = setTimeout(() => {
				setShowLoading(false);
			}, EXIT_ANIMATION_DURATION_MS);

			return () => clearTimeout(timer);
		}
	}, [isHydrated, showLoading]);

	// Redirect authenticated users away from login to dashboard
	if (user && pathname.startsWith("/auth")) {
		redirect("/dashboard");
	}

	// Redirect authenticated users away from forget-password routes
	if (user && pathname.startsWith("/forget-password")) {
		redirect("/dashboard");
	}

	// Check if we're on pages where floating nav should be hidden
	const isLoginPage = pathname.startsWith("/auth");
	const isForgotPasswordPage = pathname.startsWith("/forget-password");
	const isCheckinPage = pathname.startsWith("/check-in");
	const isPublicVoucherPage = pathname.startsWith("/event");
	const isVendorSignupPage = pathname.startsWith("/vendor-signup");
	const isNavHidden =
		isLoginPage ||
		isForgotPasswordPage ||
		isCheckinPage ||
		isPublicVoucherPage ||
		isVendorSignupPage;

	// Check if we're on pages where footer should be shown
	const isHomePage = pathname === "/";
	const isAboutPage = pathname.startsWith("/about");
	const isPrivacyPolicyPage = pathname === "/privacy-policy";
	const isTermsPage = pathname === "/terms-and-conditions";
	const isServicePage = pathname.startsWith("/services");
	const isBlogPage = pathname.startsWith("/blog");
	const isContactPage = pathname.startsWith("/contact");
	const isFooterVisible =
		isHomePage || isAboutPage || isPrivacyPolicyPage || isTermsPage || isServicePage || isBlogPage || isContactPage;

	// Pages that use new design (FloatingNavNew + FooterNew)
	const useNewDesign = isHomePage || isServicePage || isBlogPage || isContactPage || isAboutPage || isPrivacyPolicyPage || isTermsPage;

	// Render layout with floating nav for public routes
	return (
		<>
			{/* Loading screen overlay - renders on top while loading */}
			{showLoading && <LoadingScreen isExiting={isExiting} />}
			
			{/* Main content - always rendered so it's ready when loading completes */}
			<div className="relative min-h-screen w-full">
				{!isNavHidden && useNewDesign && <FloatingNavNew />}
				{!isNavHidden && !useNewDesign && <FloatingNav />}
				<main className="h-full w-full">{children}</main>
				{useNewDesign && <FooterNew />}
				{isFooterVisible && !useNewDesign && <Footer />}
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
