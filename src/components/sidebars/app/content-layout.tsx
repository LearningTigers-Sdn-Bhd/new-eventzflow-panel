"use client";

import { PanelLeftIcon } from "lucide-react";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
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
				<div className="relative flex w-full h-full overflow-hidden bg-background">
					{/* Top Left Corner */}
					<div className="absolute top-0 left-0 z-20 flex h-12 w-12 items-center justify-center border-b border-r border-dashed border-border bg-background">
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

					{/* Top Right Corner */}
					<div className="absolute top-0 right-0 z-20 flex h-12 w-12 items-center justify-center border-b border-l border-dashed border-border bg-background">
						<ModeToggle />
					</div>

					{/* Bottom Left Corner */}
					<div className="absolute bottom-0 left-0 z-20 h-12 w-12 border-t border-r border-dashed border-border bg-background" />

					{/* Bottom Right Corner */}
					<div className="absolute bottom-0 right-0 z-20 h-12 w-12 border-t border-l border-dashed border-border bg-background" />

					{/* Left Rail Pattern */}
					<div className="absolute top-12 bottom-12 left-0 z-10 w-12 opacity-4 bg-[repeating-linear-gradient(45deg,currentColor_0,currentColor_2px,transparent_0,transparent_6px)]" />

					{/* Right Rail Pattern */}
					<div className="absolute top-12 bottom-12 right-0 z-10 w-12 opacity-4 bg-[repeating-linear-gradient(45deg,currentColor_0,currentColor_2px,transparent_0,transparent_6px)]" />

					{/* Blueprint Grid Lines (Remaining borders) */}
					<div className="absolute inset-0 z-0 pointer-events-none">
						<div className="absolute top-12 left-12 right-12 border-b border-dashed border-border" />
						<div className="absolute bottom-12 left-12 right-12 border-t border-dashed border-border" />
						<div className="absolute left-12 top-12 bottom-12 border-r border-dashed border-border" />
						<div className="absolute right-12 top-12 bottom-12 border-l border-dashed border-border" />
					</div>

					{/* Content Area */}
					<div className="relative z-10 flex flex-col w-full h-full pt-12 pb-12 pl-12 pr-12">
						<div className="w-full h-full overflow-auto">{children}</div>
					</div>
				</div>
			</DesktopView>

			<MobileTabletView>
				<div className="flex flex-col w-full h-full overflow-auto bg-background p-4">
					{children}
				</div>
			</MobileTabletView>
		</ResponsiveLayout>
	);
}
