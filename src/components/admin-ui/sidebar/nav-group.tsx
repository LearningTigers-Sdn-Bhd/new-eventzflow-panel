"use client";

import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavGroup({
	name,
	navGroup,
}: {
	name: string;
	navGroup: {
		name: string;
		url: Route;
		icon: LucideIcon | IconType;
		isActive?: (pathname: string) => boolean;
	}[];
}) {
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
									<Link href={item.url}>
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
}
