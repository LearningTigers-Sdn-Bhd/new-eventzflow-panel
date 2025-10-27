"use client";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useHydratedStore } from "@/hooks/use-hydrated-store";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const isHydrated = useHydratedStore();
	const { user } = useAuth();

	// Show loading spinner during hydration
	if (!isHydrated) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<Spinner className="size-16 text-emerald-500" />
			</div>
		);
	}

	// Redirect unauthenticated users to login
	if (!user) {
		redirect("/login");
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
