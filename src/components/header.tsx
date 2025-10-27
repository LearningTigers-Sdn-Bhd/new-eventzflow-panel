"use client";
import Link from "next/link";
import { useMemo } from "react";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/use-auth";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const { isAuthenticated } = useAuth();

	const links = [
		{ to: "/", label: "Home", authOnly: false },
		{ to: "/dashboard", label: "Dashboard", authOnly: true },
	] as const;

	// Filter links based on authentication status
	const visibleLinks = useMemo(
		() => links.filter((link) => !link.authOnly || isAuthenticated),
		[isAuthenticated, links.filter],
	);

	return (
		<header className="w-full border-b px-4 py-2">
			<div className="flex w-full items-center justify-between">
				<NavigationMenu viewport={false}>
					<NavigationMenuList>
						{visibleLinks.map(({ to, label }) => (
							<NavigationMenuItem key={to}>
								<NavigationMenuLink
									asChild
									className={navigationMenuTriggerStyle()}
								>
									<Link href={to}>{label}</Link>
								</NavigationMenuLink>
							</NavigationMenuItem>
						))}
					</NavigationMenuList>
				</NavigationMenu>
				<div className="flex items-center gap-1">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
