"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingPage from "@/components/admin-ui/loading-page";
import { useAuth } from "@/hooks/auth/use-auth";

// ponytail: pathname is unused in the redirect check but kept — the effect
// re-runs on navigation within the workshop so a stale `user` doesn't let a
// signed-out visitor linger on a previously-loaded plan.
export function WorkshopAuthGate({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user, isInitialized } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!isInitialized) return;
		if (!user) {
			router.push("/auth?login");
			return;
		}
	}, [user, isInitialized, router, pathname]);

	if (!isInitialized || !user) {
		return <LoadingPage />;
	}

	return (
		<div className="h-screen w-screen overflow-hidden bg-slate-100">
			{children}
		</div>
	);
}
