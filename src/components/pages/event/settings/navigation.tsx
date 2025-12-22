"use client";

import { InfoIcon, TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationItem {
	id: "event-information" | "custom-labels";
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

interface SettingsNavigationProps {
	activeTab: "event-information" | "custom-labels";
	onTabChange: (tab: "event-information" | "custom-labels") => void;
	onClose?: () => void;
}

const navigationItems: NavigationItem[] = [
	{
		id: "event-information",
		label: "Event Information",
		icon: InfoIcon,
	},
	{
		id: "custom-labels",
		label: "Custom Labels",
		icon: TagIcon,
	},
];

export default function SettingsNavigation({
	activeTab,
	onTabChange,
}: SettingsNavigationProps) {
	return (
		<div className="sticky top-0 hidden w-full self-start md:flex md:flex-col md:gap-2">
			{navigationItems.map((item) => {
				const Icon = item.icon;
				const isActive = activeTab === item.id;

				return (
					<Button
						key={item.id}
						className={cn(
							"w-full justify-start rounded-none",
							isActive && "border",
						)}
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
