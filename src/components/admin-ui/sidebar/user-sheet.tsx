"use client";

import {
	BadgeCheck,
	Bell,
	CreditCard,
	LogOut,
	Monitor,
	Moon,
	Sun,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type * as React from "react";
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
import { getFilteredNavigation, type UserRole } from "./app-menu-config";

interface UserSheetProps {
	trigger: React.ReactNode;
}

export function UserSheet({ trigger }: UserSheetProps) {
	const router = useRouter();
	const { user, logout } = useAuth();
	const { theme, setTheme } = useTheme();

	const handleLogout = async () => {
		await logout();
		router.push("/");
	};

	// Get filtered navigation by user role
	const filteredNav = getFilteredNavigation(user?.role as UserRole);

	return (
		<Sheet>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
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
						{filteredNav.memberManagement.length > 0 && (
							<div className="flex flex-col gap-2">
								<h4 className="font-medium text-muted-foreground text-xs uppercase">
									Member Management
								</h4>
								<div className="flex flex-col gap-2">
									{filteredNav.memberManagement.map((item) => (
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

						{filteredNav.miscellaneous.length > 0 && (
							<div className="flex flex-col gap-2">
								<h4 className="font-medium text-muted-foreground text-xs uppercase">
									Miscellaneous
								</h4>
								<div className="flex flex-col gap-2">
									{filteredNav.miscellaneous.map((item) => (
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
	);
}
