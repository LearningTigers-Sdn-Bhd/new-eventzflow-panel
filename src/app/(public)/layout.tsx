"use client";
import { redirect, usePathname } from "next/navigation";
import Script from "next/script";
import FloatingNav from "@/components/floating-nav";
import FloatingNavNew from "@/components/pages/home-new/floating-nav-new";
import Footer from "@/components/footer";
import FooterNew from "@/components/pages/home-new/footer-new";
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

	// Show loading screen during hydration
	if (!isHydrated) {
		const letters = [
			{ char: "E", color: "#23c460" },
			{ char: "v", color: "#23c460" },
			{ char: "e", color: "#23c460" },
			{ char: "n", color: "#23c460" },
			{ char: "t", color: "#23c460" },
			{ char: "z", color: "#2766ec" },
			{ char: "F", color: "#23c460" },
			{ char: "l", color: "#23c460" },
			{ char: "o", color: "#23c460" },
			{ char: "w", color: "#23c460" },
		];

		return (
			<div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden">
				<style>
					{`
						@keyframes slide-up {
							0% {
								opacity: 0;
								transform: translateY(40px);
							}
							100% {
								opacity: 1;
								transform: translateY(0);
							}
						}
						@keyframes draw-line {
							0% {
								width: 0;
							}
							100% {
								width: 100%;
							}
						}
						@keyframes pulse-glow {
							0%, 100% {
								text-shadow: 0 0 10px currentColor;
							}
							50% {
								text-shadow: 0 0 25px currentColor, 0 0 40px currentColor;
							}
						}
						@keyframes fade-in {
							0% {
								opacity: 0;
							}
							100% {
								opacity: 1;
							}
						}
						@keyframes line-glow {
							0%, 100% {
								box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
							}
							50% {
								box-shadow: 0 0 15px rgba(255, 255, 255, 0.6), 0 0 25px rgba(255, 255, 255, 0.3);
							}
						}
					`}
				</style>

				{/* Logo */}
				<div className="relative">
					<h1
						className="text-5xl font-bold md:text-6xl lg:text-7xl flex"
						style={{ fontFamily: "Times New Roman, serif" }}
					>
						{letters.map((letter, index) => (
							<span
								key={index}
								className="inline-block"
								style={{
									color: letter.color,
									opacity: 0,
									animation: `slide-up 0.5s ease-out forwards, pulse-glow 2s ease-in-out infinite`,
									animationDelay: `${index * 0.05}s, ${0.8 + index * 0.05}s`,
								}}
							>
								{letter.char}
							</span>
						))}
					</h1>

					{/* Animated underline */}
					<div className="relative h-[4px] mt-4 bg-white/10 overflow-hidden rounded-full">
						<div
							className="absolute left-0 top-0 h-full bg-white rounded-full"
							style={{
								width: 0,
								animation: 'draw-line 0.8s ease-out 0.6s forwards, line-glow 2s ease-in-out 1.4s infinite',
							}}
						/>
					</div>
				</div>

				{/* Tagline */}
				<p
					className="mt-6 text-xs tracking-[0.3em] text-white/40 uppercase"
					style={{
						opacity: 0,
						animation: 'fade-in 0.5s ease-out 1s forwards',
					}}
				>
					Event Management Platform
				</p>
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
	const isServicePage = pathname.startsWith("/services");
	const isFooterVisible =
		isHomePage || isAboutPage || isPrivacyPolicyPage || isTermsPage || isServicePage;

	// Render layout with floating nav for public routes
	return (
		<div className="min-h-screen w-full">
			{!isNavHidden && (isHomePage || isServicePage) && <FloatingNavNew />}
			{!isNavHidden && !isHomePage && !isServicePage && <FloatingNav />}
			<main className="h-full w-full">{children}</main>
			{(isHomePage || isServicePage) && <FooterNew />}
			{isFooterVisible && !isHomePage && !isServicePage && <Footer />}
			{process.env.NODE_ENV === "production" && (
				<Script
					src="https://plugin.nytsys.com/api/site/663be6f4-0a22-4d55-af28-2ff3becb064c/nytsys.min.js"
					strategy="afterInteractive"
				/>
			)}
		</div>
	);
}
