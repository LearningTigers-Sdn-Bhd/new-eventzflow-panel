"use client";
import { redirect, usePathname } from "next/navigation";
import Header from "@/components/header";
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

	// Check if we're on pages where header should be hidden
	const isLoginPage = pathname.startsWith("/auth");
	const isForgotPasswordPage = pathname.startsWith("/forget-password");
	const isCheckinPage = pathname.startsWith("/check-in");
	const isHomePage = pathname === "/";
	const isHeaderHidden = isLoginPage || isForgotPasswordPage || isCheckinPage || isHomePage;

	// Render header layout for public routes (hide header on login page)
	return (
		<div className="min-h-screen w-full">
			{!isHeaderHidden && <Header />}
			<main className="h-full w-full">{children}</main>
		</div>
	);
}
