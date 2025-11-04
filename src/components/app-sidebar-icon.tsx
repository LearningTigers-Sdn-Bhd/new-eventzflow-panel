import { useRouter } from "next/navigation";
import { BsTicketPerforatedFill } from "react-icons/bs";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebarIcon() {
	const router = useRouter();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className="rounded-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					onClick={() => {
						router.push("/");
					}}
				>
					<div className="flex aspect-square size-8 items-center justify-center rounded-none bg-sidebar-primary text-sidebar-primary-foreground">
						<BsTicketPerforatedFill className="size-4" />
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-medium">EventzFlow Panel</span>
						<span className="truncate text-xs">Saleschatalyst</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
