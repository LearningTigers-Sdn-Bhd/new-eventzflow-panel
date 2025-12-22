"use client";
import { redirect, usePathname } from "next/navigation";
import FloatingNav from "@/components/floating-nav";
import Footer from "@/components/footer";
import { Spinner } from "@/components/ui/spinner";
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

	// Show loading spinner during hydration
	if (!isHydrated) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<Spinner className="size-16 text-emerald-500" />
			</div>
		);
	}

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
	const isFooterVisible =
		isHomePage || isAboutPage || isPrivacyPolicyPage || isTermsPage;

	// Render layout with floating nav for public routes
	return (
		<div className="min-h-screen w-full">
			{!isNavHidden && <FloatingNav />}
			<main className="h-full w-full">{children}</main>
			{isFooterVisible && <Footer />}
		</div>
	);
}
