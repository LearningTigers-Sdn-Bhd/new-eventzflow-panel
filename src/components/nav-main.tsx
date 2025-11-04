"use client";

import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
	navMain,
}: {
	navMain: {
		name: string;
		url: Route;
		icon: LucideIcon | IconType;
	}[];
}) {
	return (
		<SidebarGroup className="">
			<SidebarGroupLabel>Main Menu</SidebarGroupLabel>
			<SidebarMenu>
				{navMain.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton asChild className="rounded-none">
							<Link href={item.url}>
								<item.icon className="size-8" />
								<span>{item.name}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
