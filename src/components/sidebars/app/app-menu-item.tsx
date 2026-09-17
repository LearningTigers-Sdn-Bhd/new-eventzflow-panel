"use client";

import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import type { IconType } from "react-icons";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppMenuItemProps {
	name: string;
	navGroup: {
		name: string;
		url: Route;
		icon: LucideIcon | IconType;
		isActive?: (pathname: string) => boolean;
		openInNewTab?: boolean;
	}[];
}

export const AppMenuItem = React.memo(function AppMenuItem({
	name,
	navGroup,
}: AppMenuItemProps) {
	const pathname = usePathname();
	return (
		<SidebarGroup className="group-data-[collapsible=icon]:border-sidebar-border group-data-[collapsible=icon]:border-t group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:first:border-t-0">
			<SidebarGroupLabel>{name}</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu className="group-data-[collapsible=icon]:items-center">
					{navGroup.map((item) => {
						const isActive = item.isActive
							? item.isActive(pathname)
							: pathname === item.url || pathname.startsWith(`${item.url}/`);
						return (
							<SidebarMenuItem
								key={item.name}
								className={
									isActive
										? "group-data-[collapsible=icon]:before:absolute group-data-[collapsible=icon]:before:top-1 group-data-[collapsible=icon]:before:bottom-1 group-data-[collapsible=icon]:before:left-0 group-data-[collapsible=icon]:before:w-[2px] group-data-[collapsible=icon]:before:bg-primary group-data-[collapsible=icon]:before:content-['']"
										: undefined
								}
							>
								<SidebarMenuButton
									asChild
									tooltip={item.name}
									className="rounded-none data-[active=true]:bg-primary data-[active=true]:text-primary-foreground group-data-[collapsible=icon]:mx-auto data-[active=true]:group-data-[collapsible=icon]:bg-sidebar-accent data-[active=true]:group-data-[collapsible=icon]:text-sidebar-accent-foreground"
									isActive={isActive}
								>
									<Link
										href={item.url}
										target={item.openInNewTab ? "_blank" : undefined}
										rel={item.openInNewTab ? "noopener noreferrer" : undefined}
									>
										<item.icon className="size-8 group-data-[collapsible=icon]:size-5" />
										<span>{item.name}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
});
