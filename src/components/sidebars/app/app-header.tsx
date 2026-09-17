import { PanelLeftIcon, PanelRightOpen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsCalendar2Event } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useSidebarStore } from "@/stores/sidebar-store";

export function AppHeader() {
	const router = useRouter();
	const { state } = useSidebar();
	const { toggleMainSidebar } = useSidebarStore();

	const isCollapsed = state === "collapsed";

	// Collapsed state: logo mark doubles as the expand affordance. Clicking it
	// reopens the sidebar; the active event context is still reachable via the
	// feature sidebar and breadcrumbs, so we don't spend a second icon on Home.
	if (isCollapsed) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						size="lg"
						className="size-8 cursor-pointer rounded-none"
						onClick={toggleMainSidebar}
						tooltip="Expand sidebar"
					>
						<div className="flex aspect-square size-8 items-center justify-center rounded-none bg-sidebar-primary text-sidebar-primary-foreground">
							<PanelLeftIcon className="size-4" />
						</div>
						<span className="sr-only">Expand sidebar</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	// Expanded state: Show horizontal row with home button and toggle
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<div className="flex items-center gap-2">
					{/* Home button with icon and text */}
					<SidebarMenuButton
						size="lg"
						className="flex-1 cursor-pointer rounded-none border border-primary data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						onClick={() => {
							router.push("/");
						}}
					>
						<div className="flex items-center gap-2">
							<div className="flex size-7 items-center justify-center bg-black text-white">
								<BsCalendar2Event className="size-3.5" />
							</div>
							<div className="flex leading-none">
								<Image
									src="/logo/Logo.png"
									alt="Eventzflow logo"
									width={907}
									height={73}
									priority
									className="h-auto w-[156px]"
								/>
							</div>
						</div>
					</SidebarMenuButton>
					{/* Toggle button - show PanelRightOpen when expanded */}
					<Button
						variant="ghost"
						size="icon"
						className="size-7 shrink-0 cursor-pointer rounded-none"
						onClick={toggleMainSidebar}
					>
						<PanelRightOpen className="size-4" />
						<span className="sr-only">Toggle Sidebar</span>
					</Button>
				</div>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
