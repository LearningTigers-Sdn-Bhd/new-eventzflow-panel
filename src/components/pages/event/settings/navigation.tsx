"use client";

import { ImageIcon, InfoIcon, Monitor, TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationItem {
	id: "event-information" | "custom-labels" | "welcome-screen" | "branding";
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

interface SettingsNavigationProps {
	activeTab: "event-information" | "custom-labels" | "welcome-screen" | "branding";
	onTabChange: (tab: "event-information" | "custom-labels" | "welcome-screen" | "branding") => void;
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
	{
		id: "welcome-screen",
		label: "Welcome Screen",
		icon: Monitor,
	},
	{
		id: "branding",
		label: "Branding",
		icon: ImageIcon,
	},
];

export default function SettingsNavigation({
	activeTab,
	onTabChange,
}: SettingsNavigationProps) {
	return (
		<div className="sticky top-0 flex w-full flex-row gap-2 overflow-x-auto self-start md:flex-col">
			{navigationItems.map((item) => {
				const Icon = item.icon;
				const isActive = activeTab === item.id;

				return (
					<Button
						key={item.id}
						className={cn(
							"shrink-0 justify-start rounded-none",
							isActive && "border",
						)}
						variant={isActive ? "secondary" : "ghost"}
						data-active={isActive}
						onClick={() => onTabChange(item.id)}
					>
						<Icon className="mr-2 size-4" />
						<span className="hidden md:inline">{item.label}</span>
						<span className="md:hidden">{item.label.split(" ")[0]}</span>
					</Button>
				);
			})}
		</div>
	);
}
