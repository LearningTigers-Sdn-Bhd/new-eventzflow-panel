"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import LoadingPage from "@/components/admin-ui/loading-page";
import { useAuth } from "@/hooks/auth/use-auth";

export default function WorkshopLayout({
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
	}, [user, isInitialized, router]);

	if (!isInitialized || !user) {
		return <LoadingPage />;
	}

	return <div className="h-screen w-screen overflow-hidden bg-slate-100">{children}</div>;
}
