import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { BsTicketPerforatedFill } from "react-icons/bs";
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
								<BsTicketPerforatedFill className="size-4" />
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
						className="flex-1 cursor-pointer rounded-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						onClick={() => {
							router.push("/");
						}}
					>
						<div className="flex aspect-square size-8 items-center justify-center rounded-none bg-sidebar-primary text-sidebar-primary-foreground">
							<BsTicketPerforatedFill className="size-4" />
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">EventzFlow Panel</span>
							<span className="truncate text-xs">Saleschatalyst</span>
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
