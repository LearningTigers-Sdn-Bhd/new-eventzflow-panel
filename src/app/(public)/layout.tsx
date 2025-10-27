"use client";
import { usePathname, redirect } from "next/navigation";
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
	if (user && pathname === "/login") {
		redirect("/dashboard");
	}

	// Check if we're on the login page (hide header)
	const isLoginPage = pathname === "/login";

	// Render header layout for public routes (hide header on login page)
	return (
		<div className="grid h-svh grid-rows-[auto_1fr]">
			{!isLoginPage && <Header />}
			{children}
		</div>
	);
}
