"use client";

import { ChevronRight } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
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
import type { MenuGroup, MenuItem } from "./resource-menu-config";

interface ResourceMenuItemProps {
	groups: MenuGroup[];
	standalone: MenuItem[];
	isActive: (route: string) => boolean;
}

export function ResourceMenuItem({
	groups,
	standalone,
	isActive,
}: ResourceMenuItemProps) {
	const router = useRouter();
	const pathname = usePathname();
	const isTablet = useIsTablet();
	const { setOpenTablet } = useSidebar();

	// Handler to close sheet and navigate
	const handleMenuItemClick = (route: string) => {
		// Close sheet on tablet first
		if (isTablet) {
			setOpenTablet(false);
		}
		// Then navigate
		router.push(`/manage-resources/${route}` as Route);
	};

	return (
		<SidebarContent className="gap-0 pt-2">
			{standalone.length > 0 && (
				<SidebarGroup className="pt-0">
					<SidebarGroupLabel>Generic Actions</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{standalone.map((item) => {
								const Icon = item.icon;
								// Use custom isActive function if provided, otherwise use default
								const itemIsActive = item.isActive
									? item.isActive(pathname, item.route)
									: isActive(item.route);
								return (
									<SidebarMenuItem key={item.route}>
										<SidebarMenuButton
											isActive={itemIsActive}
											tooltip={item.label}
											onClick={() => handleMenuItemClick(item.route)}
											className="cursor-pointer rounded-none data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
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
					<Collapsible
						key={group.id}
						defaultOpen
						className="group/collapsible pb-2"
					>
						<SidebarGroup>
							<SidebarGroupLabel asChild className="group/label rounded-none">
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
											// Use custom isActive function if provided, otherwise use default
											const itemIsActive = item.isActive
												? item.isActive(pathname, item.route)
												: isActive(item.route);
											return (
												<SidebarMenuItem key={item.route}>
													<SidebarMenuButton
														isActive={itemIsActive}
														tooltip={item.label}
														onClick={() => handleMenuItemClick(item.route)}
														className="cursor-pointer rounded-none data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
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
