import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function UserMenu() {
	const router = useRouter();
	const { user, isLoading, logout } = useAuth();

	if (isLoading) {
		return <Skeleton className="h-9 w-24" />;
	}

	if (!user) {
		return (
			<Button variant="ghost" size="sm" asChild>
				<Link href="/login">Sign In</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="lg"
					className="flex justify-between gap-3 px-2!"
				>
					<Avatar className="h-8 w-8">
						<AvatarFallback>
							{user.full_name?.charAt(0)?.toUpperCase() ||
								user.email.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="text-sm">{user.full_name || "User"}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card" side="bottom" align="end">
				<DropdownMenuLabel>
					<div className="flex min-w-48 flex-col gap-1">
						<h3 className="font-medium text-sm">My Account</h3>
						<p className="text-muted-foreground text-xs">{user.email}</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<Settings />
					Account Settings
				</DropdownMenuItem>
				<DropdownMenuItem
					className="group cursor-pointer bg-destructive text-white transition-colors hover:bg-destructive/90 hover:text-red-950"
					onClick={async () => {
						await logout();
						router.push("/");
					}}
				>
					<LogOut className="text-white transition-colors group-hover:text-red-950" />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
