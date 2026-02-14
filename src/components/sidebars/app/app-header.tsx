import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
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

	// Collapsed state: Show icon only with toggle button below
	if (isCollapsed) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="flex flex-col items-center gap-2">
						{/* Icon-only home button */}
						<SidebarMenuButton
							size="lg"
							className="size-8 cursor-pointer rounded-none"
							onClick={() => {
								router.push("/");
							}}
							tooltip="Home"
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-none bg-sidebar-primary text-sidebar-primary-foreground">
								<BsCalendar2Event className="size-4" />
							</div>
							<span className="sr-only">Home</span>
						</SidebarMenuButton>
					</div>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<div className="flex flex-col items-center gap-2">
						<SidebarMenuButton
							size="lg"
							className="cursor-pointer rounded-none"
							onClick={toggleMainSidebar}
							tooltip="Toggle Sidebar"
							asChild
						>
							<Button
								variant="ghost"
								size="icon"
								className="size-8 cursor-pointer rounded-none"
							>
								<PanelLeftOpen className="size-4" />
							</Button>
						</SidebarMenuButton>
					</div>
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
						className="flex-1 cursor-pointer border border-primary rounded-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
