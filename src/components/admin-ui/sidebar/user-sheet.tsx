"use client";

import {
	BadgeCheck,
	Bell,
	CreditCard,
	HardHat,
	Import,
	Key,
	LogOut,
	Store,
	Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

// Navigation data for menu groups
const navigationGroups = {
	memberManagement: [
		{
			name: "Team Members",
			url: "/team" as Route,
			icon: Users,
			roleAllowed: ["org_owner", "organizer"],
		},
		{
			name: "Exhibitor Contractors",
			url: "/exhibitor-contractor" as Route,
			icon: HardHat,
			roleAllowed: ["org_owner", "organizer"],
		},
		{
			name: "Vendors",
			url: "/vendor" as Route,
			icon: Store,
			roleAllowed: ["org_owner", "organizer"],
		},
	],
	miscellaneous: [
		{
			name: "API Keys",
			url: "/api" as Route,
			icon: Key,
			roleAllowed: ["org_owner", "organizer"],
		},
		{
			name: "Import Tickets",
			url: "/import" as Route,
			icon: Import,
			roleAllowed: ["org_owner"],
		},
	],
};

interface UserSheetProps {
	trigger: React.ReactNode;
}

export function UserSheet({ trigger }: UserSheetProps) {
	const router = useRouter();
	const { user, logout } = useAuth();

	const handleLogout = async () => {
		await logout();
		router.push("/");
	};

	// Filter navigation items by user role
	const filteredMemberManagement = navigationGroups.memberManagement.filter(
		(item) => item.roleAllowed.includes(user?.role || "member"),
	);
	const filteredMiscellaneous = navigationGroups.miscellaneous.filter((item) =>
		item.roleAllowed.includes(user?.role || "member"),
	);

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

					{/* Menu Section - Other Navigation Groups */}
					<div className="flex flex-col gap-4 px-2">
						{filteredMemberManagement.length > 0 && (
							<div className="flex flex-col gap-2">
								<h4 className="font-medium text-muted-foreground text-xs uppercase">
									Member Management
								</h4>
								<div className="flex flex-col gap-2">
									{filteredMemberManagement.map((item) => (
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

						{filteredMiscellaneous.length > 0 && (
							<div className="flex flex-col gap-2">
								<h4 className="font-medium text-muted-foreground text-xs uppercase">
									Miscellaneous
								</h4>
								<div className="flex flex-col gap-2">
									{filteredMiscellaneous.map((item) => (
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
