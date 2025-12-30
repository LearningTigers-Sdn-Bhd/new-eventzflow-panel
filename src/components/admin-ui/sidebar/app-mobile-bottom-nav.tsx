"use client";

import { useQuery } from "@tanstack/react-query";
import {
	BadgeCheck,
	Bell,
	CreditCard,
	List,
	LogOut,
	Monitor,
	Moon,
	Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { getContractor } from "@/lib/api/contractor";
import { cn } from "@/lib/utils";
import { getMobileNavigation, type UserRole, type UserPermissions } from "./app-menu-config";

export function AppMobileBottomNav() {
	const pathname = usePathname();
	const router = useRouter();
	const { user, logout } = useAuth();
	const { theme, setTheme } = useTheme();

	// Fetch contractor profile for exhibition_contractor users
	const isContractor = user?.role === "exhibition_contractor";
	const { data: contractor } = useQuery({
		queryKey: ["contractor", user?.id],
		queryFn: () => getContractor(user!.id),
		enabled: !!user?.id && isContractor,
	});

	// Build permissions object from contractor profile
	const permissions: UserPermissions | undefined = isContractor && contractor
		? { allow_printing_services: contractor.exhibition_contractor_profile?.allow_printing_services }
		: undefined;

	const handleLogout = async () => {
		await logout();
		router.push("/");
	};

	const mobileNav = getMobileNavigation(user?.role as UserRole, permissions);

	return (
		<nav className="fixed right-0 bottom-0 left-0 z-40 flex h-18 items-center justify-around border-accent border-t bg-background pb-[env(safe-area-inset-bottom)] md:h-20">
			{mobileNav.bottomNavItems.map((item) => {
				const isActive =
					pathname === item.url || pathname.startsWith(`${item.url}/`);
				return (
					<div
						key={item.name}
						className="flex h-full w-full items-center justify-center"
					>
						<Button
							key={item.name}
							variant="ghost"
							className={cn(
								"group h-full w-full rounded-none border-none bg-transparent shadow-none hover:bg-transparent",
								isActive &&
									"bg-accent text-accent-foreground group-hover:text-accent-foreground",
							)}
							asChild
						>
							<Link href={item.url}>
								<item.icon className="size-6 md:size-7" />
								<span className="sr-only">{item.name}</span>
							</Link>
						</Button>
					</div>
				);
			})}

			{/* More Menu Sheet Trigger */}
			<Sheet>
				<SheetTrigger asChild>
					<div className="flex h-full w-full items-center justify-center">
						<Button
							variant="ghost"
							size="icon"
							className="group rounded-none border-none bg-transparent shadow-none hover:bg-transparent group-hover:text-stone-900"
						>
							<List className="size-6 md:size-7" />
							<span className="sr-only">More Menu</span>
						</Button>
					</div>
				</SheetTrigger>
				<SheetContent side="right" className="w-[300px]">
					<div className="flex h-full flex-col justify-start gap-4">
						<SheetHeader>
							<SheetTitle>More Menu</SheetTitle>
						</SheetHeader>

						{/* Account Info Section */}
						<div className="flex flex-col gap-4 px-4">
							<div className="flex items-center gap-3">
								<Avatar className="h-12 w-12 rounded-none">
									<AvatarFallback className="rounded-none">
										{user?.full_name?.charAt(0)?.toUpperCase() ||
											user?.email.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col">
									<h3 className="font-medium text-sm">
										{user?.full_name || "User"}
									</h3>
									<p className="text-muted-foreground text-xs">{user?.email}</p>
								</div>
							</div>
						</div>
						<Separator />

						{/* Theme Toggle Section */}
						<div className="flex flex-col gap-2 px-2">
							<h4 className="font-medium text-muted-foreground text-xs uppercase">
								Appearance
							</h4>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="lg"
										className="w-full justify-start rounded-none"
									>
										{theme === "light" && <Sun className="mr-2 size-4" />}
										{theme === "dark" && <Moon className="mr-2 size-4" />}
										{theme === "system" && <Monitor className="mr-2 size-4" />}
										{theme === "light" && "Light Theme"}
										{theme === "dark" && "Dark Theme"}
										{theme === "system" && "System Theme"}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="start"
									className="w-(--radix-dropdown-menu-trigger-width) rounded-none"
								>
									<DropdownMenuItem
										className="rounded-none"
										onClick={() => setTheme("light")}
									>
										<Sun className="mr-2 size-4" />
										Light
									</DropdownMenuItem>
									<DropdownMenuItem
										className="rounded-none"
										onClick={() => setTheme("dark")}
									>
										<Moon className="mr-2 size-4" />
										Dark
									</DropdownMenuItem>
									<DropdownMenuItem
										className="rounded-none"
										onClick={() => setTheme("system")}
									>
										<Monitor className="mr-2 size-4" />
										System
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<Separator />

						{/* Menu Section - Other Navigation Groups */}
						<div className="flex flex-col gap-4 px-2">
							{mobileNav.mainMenuNotInBottomNav.length > 0 && (
								<div className="flex flex-col gap-2">
									<h4 className="font-medium text-muted-foreground text-xs uppercase">
										Main Menu
									</h4>
									<div className="flex flex-col gap-2">
										{mobileNav.mainMenuNotInBottomNav.map((item) => (
											<Button
												key={item.name}
												variant="ghost"
												size="lg"
												className="justify-start rounded-none"
												asChild
											>
												<Link href={item.url}>
													<item.icon className="mr-2 size-4" />
													{item.name}
												</Link>
											</Button>
										))}
									</div>
								</div>
							)}

							{mobileNav.memberManagement.length > 0 && (
								<div className="flex flex-col gap-2">
									<h4 className="font-medium text-muted-foreground text-xs uppercase">
										Member Management
									</h4>
									<div className="flex flex-col gap-2">
										{mobileNav.memberManagement.map((item) => (
											<Button
												key={item.name}
												variant="ghost"
												size="lg"
												className="justify-start rounded-none"
												asChild
											>
												<Link href={item.url}>
													<item.icon className="mr-2 size-4" />
													{item.name}
												</Link>
											</Button>
										))}
									</div>
								</div>
							)}

							{mobileNav.miscellaneous.length > 0 && (
								<div className="flex flex-col gap-2">
									<h4 className="font-medium text-muted-foreground text-xs uppercase">
										Miscellaneous
									</h4>
									<div className="flex flex-col gap-2">
										{mobileNav.miscellaneous.map((item) => (
											<Button
												key={item.name}
												variant="ghost"
												size="lg"
												className="justify-start rounded-none"
												asChild
											>
												<Link href={item.url}>
													<item.icon className="mr-2 size-4" />
													{item.name}
												</Link>
											</Button>
										))}
									</div>
								</div>
							)}
						</div>

						<Separator />

						{/* My Account Menu Section */}
						<div className="flex flex-col gap-2 px-2">
							<h4 className="font-medium text-muted-foreground text-xs uppercase">
								My Account
							</h4>
							<Button
								variant="ghost"
								size="lg"
								className="justify-start rounded-none"
								asChild
							>
								<Link href="/settings">
									<BadgeCheck className="mr-2 size-4" />
									Account Settings
								</Link>
							</Button>
							<Button
								variant="ghost"
								size="lg"
								className="justify-start rounded-none"
								asChild
							>
								<Link href="/settings">
									<CreditCard className="mr-2 size-4" />
									Billing Settings
								</Link>
							</Button>
							<Button
								variant="ghost"
								size="lg"
								className="justify-start rounded-none"
								asChild
							>
								<Link href="/settings">
									<Bell className="mr-2 size-4" />
									Notifications
								</Link>
							</Button>
							<Button
								variant="ghost"
								size="lg"
								className="group justify-start rounded-none bg-destructive text-white transition-colors hover:bg-destructive/90 hover:text-red-950"
								onClick={handleLogout}
							>
								<LogOut className="mr-2 size-4 text-white transition-colors group-hover:text-red-950" />
								Sign Out
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</nav>
	);
}
