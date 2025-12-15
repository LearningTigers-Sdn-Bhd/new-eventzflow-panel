"use client";

import { ChevronRight } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useIsTablet } from "@/hooks/use-tablet";
import type { MenuGroup, MenuItem } from "./event-menu-config";

interface EventMenuItemProps {
	eventId: string;
	groups: MenuGroup[];
	standalone: MenuItem[];
	isActive: (route: string) => boolean;
}

export function EventMenuItem({
	eventId,
	groups,
	standalone,
	isActive,
}: EventMenuItemProps) {
	const router = useRouter();
	const isTablet = useIsTablet();
	const { setOpenTablet } = useSidebar();

	// Handler to close sheet and navigate
	const handleMenuItemClick = (route: string) => {
		// Close sheet on tablet first
		if (isTablet) {
			setOpenTablet(false);
		}
		// Then navigate
		router.push(`/event/${eventId}/${route}` as Route);
	};

	return (
		<SidebarContent>
			{standalone.length > 0 && (
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{standalone.map((item) => {
								const Icon = item.icon;
								return (
									<SidebarMenuItem key={item.route}>
										<SidebarMenuButton
											isActive={isActive(item.route)}
											tooltip={item.label}
											onClick={() => handleMenuItemClick(item.route)}
										>
											<Icon />
											<span>{item.label}</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			)}

			{groups.map((group) => {
				if (group.tabs.length === 0) return null;

				return (
					<Collapsible key={group.id} defaultOpen className="group/collapsible">
						<SidebarGroup>
							<SidebarGroupLabel
								asChild
								className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
							>
								<CollapsibleTrigger>
									{group.label}
									<ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
								</CollapsibleTrigger>
							</SidebarGroupLabel>
							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{group.tabs.map((item) => {
											const Icon = item.icon;
											return (
												<SidebarMenuItem key={item.route}>
													<SidebarMenuButton
														isActive={isActive(item.route)}
														tooltip={item.label}
														onClick={() => handleMenuItemClick(item.route)}
													>
														<Icon />
														<span>{item.label}</span>
													</SidebarMenuButton>
												</SidebarMenuItem>
											);
										})}
									</SidebarMenu>
								</SidebarGroupContent>
							</CollapsibleContent>
						</SidebarGroup>
					</Collapsible>
				);
			})}
		</SidebarContent>
	);
}
