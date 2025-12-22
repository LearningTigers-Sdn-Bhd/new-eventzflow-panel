"use client";

import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavGroup({
	name,
	navGroup,
}: {
	name: string;
	navGroup: {
		name: string;
		url: Route;
		icon: LucideIcon | IconType;
	}[];
}) {
	const pathname = usePathname();
	return (
		<SidebarGroup className="py-0">
			<SidebarGroupLabel>{name}</SidebarGroupLabel>
			<SidebarMenu>
				{navGroup.map((item) => {
					const isActive =
						pathname === item.url || pathname.startsWith(`${item.url}/`);
					return (
						<SidebarMenuItem key={item.name}>
							<SidebarMenuButton
								asChild
								tooltip={item.name}
								className={cn(
									"rounded-none",
									isActive &&
										"group bg-stone-900 text-stone-50 hover:bg-stone-700 hover:text-stone-50",
								)}
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
		</SidebarGroup>
	);
}
