"use client";

import { PanelLeftIcon } from "lucide-react";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { ModeToggle } from "@/components/mode-toggle";

import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/stores/sidebar-store";

interface ContentLayoutProps {
	children: React.ReactNode;
	hasDoubleSidebar?: boolean;
}

/**
 * ContentLayout
 *
 * Main content wrapper that provides:
 * - Desktop header
 * - Responsive content area
 * - Desktop footer
 *
 * Used by SidebarOrchestrator to wrap page content.
 */
export function ContentLayout({
	children,
	hasDoubleSidebar = false,
}: ContentLayoutProps) {
	const { toggleEventSidebar } = useSidebarStore();

	return (
		<ResponsiveLayout>
			<DesktopView>
				<div className="relative flex h-full w-full overflow-hidden bg-background">
					{/* Top Left Corner */}
					<div className="absolute top-0 left-0 z-50 flex h-12 w-12 items-center justify-center border-border border-r border-b border-dashed bg-background">
						{hasDoubleSidebar && (
							<Button
								variant="ghost"
								size="icon"
								onClick={toggleEventSidebar}
								className="h-8 w-8 rounded-none"
							>
								<PanelLeftIcon className="h-4 w-4 stroke-foreground" />
							</Button>
						)}
					</div>

					{/* Top Header Bar (Breadcrumbs) */}
					<div className="absolute top-0 right-12 left-12 z-40 flex h-12 items-center border-border border-b border-dashed bg-background px-4">
						<BreadcrumbNav />
					</div>

					{/* Top Right Corner */}
					<div className="absolute top-0 right-0 z-50 flex h-12 w-12 items-center justify-center border-border border-b border-l border-dashed bg-background">
						<ModeToggle />
					</div>

					{/* Bottom Left Corner */}
					<div className="absolute bottom-0 left-0 z-50 h-12 w-12 border-border border-t border-r border-dashed bg-background" />

					{/* Bottom Right Corner */}
					<div className="absolute right-0 bottom-0 z-50 h-12 w-12 border-border border-t border-l border-dashed bg-background" />

					{/* Left Rail Pattern */}
					<div className="absolute top-12 bottom-12 left-0 z-10 w-12 bg-[repeating-linear-gradient(45deg,currentColor_0,currentColor_2px,transparent_0,transparent_6px)] opacity-4" />

					{/* Right Rail Pattern */}
					<div className="absolute top-12 right-0 bottom-12 z-10 w-12 bg-[repeating-linear-gradient(45deg,currentColor_0,currentColor_2px,transparent_0,transparent_6px)] opacity-4" />

					{/* Blueprint Grid Lines (Remaining borders) */}
					<div className="pointer-events-none absolute inset-0 z-0">
						<div className="absolute top-12 right-12 left-12 border-border border-b border-dashed" />
						<div className="absolute right-12 bottom-12 left-12 border-border border-t border-dashed" />
						<div className="absolute top-12 bottom-12 left-12 border-border border-r border-dashed" />
						<div className="absolute top-12 right-12 bottom-12 border-border border-l border-dashed" />
					</div>

					{/* Content Area */}
					<div className="relative z-10 flex h-full w-full min-w-0 flex-col pt-12 pr-12 pb-12 pl-12">
						<div className="h-full w-full overflow-auto">{children}</div>
					</div>
				</div>
			</DesktopView>

			<MobileTabletView>
				<div className="flex h-full w-full flex-col overflow-auto bg-background p-4">
					{children}
				</div>
			</MobileTabletView>
		</ResponsiveLayout>
	);
}
