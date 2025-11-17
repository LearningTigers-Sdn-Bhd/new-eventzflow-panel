"use client";

import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationItem {
	id: "manual-add" | "group-add";
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

interface AddVendorNavigationProps {
	activeTab: "manual-add" | "group-add";
	onTabChange: (tab: "manual-add" | "group-add") => void;
}

const navigationItems: NavigationItem[] = [
	{
		id: "manual-add",
		label: "Manual Add",
		icon: UserPlus,
	},
	{
		id: "group-add",
		label: "Group Add",
		icon: Users,
	},
];

export default function AddVendorNavigation({
	activeTab,
	onTabChange,
}: AddVendorNavigationProps) {
	return (
		<div className="sticky top-0 hidden w-full self-start md:flex md:flex-col md:gap-2">
			{navigationItems.map((item) => {
				const Icon = item.icon;
				const isActive = activeTab === item.id;

				return (
					<Button
						key={item.id}
						className="w-full justify-start"
						variant={isActive ? "secondary" : "ghost"}
						data-active={isActive}
						onClick={() => onTabChange(item.id)}
					>
						<Icon className="mr-2 size-4" />
						{item.label}
					</Button>
				);
			})}
		</div>
	);
}
