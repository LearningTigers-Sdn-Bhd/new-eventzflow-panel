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
		<SidebarGroup>
			<SidebarGroupLabel>{name}</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{navGroup.map((item) => {
						const isActive = item.isActive
							? item.isActive(pathname)
							: pathname === item.url || pathname.startsWith(`${item.url}/`);
						return (
							<SidebarMenuItem key={item.name}>
								<SidebarMenuButton
									asChild
									tooltip={item.name}
									className="rounded-none data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
									isActive={isActive}
								>
									<Link
										href={item.url}
										target={item.openInNewTab ? "_blank" : undefined}
										rel={item.openInNewTab ? "noopener noreferrer" : undefined}
									>
										<item.icon className="size-8" />
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
