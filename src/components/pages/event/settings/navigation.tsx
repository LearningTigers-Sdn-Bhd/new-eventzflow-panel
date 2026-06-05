"use client";

import {
	BellRing,
	CreditCard,
	ImageIcon,
	InfoIcon,
	Mail,
	Monitor,
	TagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { canAccessPosterSettings } from "./access";

export type SettingsTab =
	| "event-information"
	| "email-settings"
	| "event-reminder"
	| "custom-labels"
	| "welcome-screen"
	| "poster"
	| "payment-gateway";

interface NavigationItem {
	id: SettingsTab;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

interface SettingsNavigationProps {
	activeTab: SettingsTab;
	onTabChange: (tab: SettingsTab) => void;
	onClose?: () => void;
}

const navigationItems: NavigationItem[] = [
	{
		id: "event-information",
		label: "Event Information",
		icon: InfoIcon,
	},
	{
		id: "email-settings",
		label: "Email Settings",
		icon: Mail,
	},
	{
		id: "event-reminder",
		label: "Event Reminder",
		icon: BellRing,
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
		id: "poster",
		label: "Poster",
		icon: ImageIcon,
	},
	{
		id: "payment-gateway",
		label: "Payment Gateway",
		icon: CreditCard,
	},
];

export default function SettingsNavigation({
	activeTab,
	onTabChange,
}: SettingsNavigationProps) {
	const visibleNavigationItems = navigationItems.filter((item) => {
		if (item.id === "poster") {
			return canAccessPosterSettings();
		}

		return true;
	});

	return (
		<div className="sticky top-0 flex w-full flex-row gap-2 self-start overflow-x-auto md:flex-col">
			{visibleNavigationItems.map((item) => {
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
