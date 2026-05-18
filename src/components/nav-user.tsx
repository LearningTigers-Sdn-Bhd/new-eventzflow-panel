import {
	BadgeCheck,
	Bell,
	ChevronsUpDown,
	CreditCard,
	LogOut,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "./ui/skeleton";

export function NavUser() {
	const isMobile = useIsMobile();
	const router = useRouter();
	const { user, isLoading, logout } = useAuth();

	if (isLoading) {
		return <Skeleton className="h-9 w-24" />;
	}

	if (!user) {
		return null;
	}

	const canManagePaymentDetails = [
		"org_owner",
		"organizer",
		"exhibition_contractor",
	].includes(user.role);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="rounded-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-none">
								<AvatarFallback className="rounded-none">
									{user.full_name?.charAt(0) ||
										user.email.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{user.full_name || "User"}
								</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-none"
						side={isMobile ? "bottom" : "top"}
						align="start"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-none">
									<AvatarFallback className="rounded-none">
										{user.full_name?.charAt(0) ||
											user.email.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{user.full_name || "User"}
									</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								className="cursor-pointer rounded-none"
								onClick={() => router.push("/settings" as Route)}
							>
								<BadgeCheck />
								Account Settings
							</DropdownMenuItem>
							{canManagePaymentDetails && (
								<DropdownMenuItem
									className="cursor-pointer rounded-none"
									onClick={() =>
										router.push("/settings#payment-details" as Route)
									}
								>
									<CreditCard />
									Payment Details
								</DropdownMenuItem>
							)}
							<DropdownMenuItem className="rounded-none">
								<Bell />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="group cursor-pointer rounded-none bg-destructive text-white transition-colors hover:bg-destructive/90 hover:text-red-950"
							onClick={async () => {
								await logout();
								router.push("/");
							}}
						>
							<LogOut className="text-white transition-colors group-hover:text-red-950" />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
