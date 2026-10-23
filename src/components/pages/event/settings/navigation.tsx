"use client";

import {
	BellRing,
	CreditCard,
	ImageIcon,
	InfoIcon,
	Mail,
	Monitor,
	SlidersHorizontal,
	TagIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { canAccessPosterSettings } from "./access";

export type SettingsTab =
	| "event-information"
	| "event-features"
	| "email-settings"
	| "event-reminder"
	| "custom-labels"
	| "exhibitor-labels"
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
		id: "event-features",
		label: "Event Features",
		icon: SlidersHorizontal,
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
		id: "exhibitor-labels",
		label: "Exhibitor Fields",
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
	const activeTabRef = useRef<HTMLButtonElement | null>(null);

	const visibleNavigationItems = navigationItems.filter((item) => {
		if (item.id === "poster") {
			return canAccessPosterSettings();
		}

		return true;
	});

	useEffect(() => {
		if (activeTabRef.current) {
			activeTabRef.current.scrollIntoView({
				behavior: "smooth",
				inline: "center",
				block: "nearest",
			});
		}
	}, [activeTab]);

	return (
		<>
			{/* Mobile: Sticky horizontal scrolling pill bar */}
			<div className="sticky top-0 z-20 -mx-4 flex w-[calc(100%+2rem)] items-center gap-1.5 overflow-x-auto border-b bg-background/95 px-4 py-2.5 backdrop-blur-md scrollbar-hide md:hidden">
				{visibleNavigationItems.map((item) => {
					const Icon = item.icon;
					const isActive = activeTab === item.id;

					return (
						<button
							key={item.id}
							ref={isActive ? activeTabRef : null}
							type="button"
							onClick={() => onTabChange(item.id)}
							className={cn(
								"flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
								isActive
									? "bg-primary text-primary-foreground shadow-xs"
									: "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							<Icon className="h-3.5 w-3.5 shrink-0" />
							<span className="whitespace-nowrap">{item.label}</span>
						</button>
					);
				})}
			</div>

			{/* Desktop: Sticky vertical sidebar */}
			<div className="sticky top-0 hidden w-full flex-col gap-1 self-start md:flex">
				{visibleNavigationItems.map((item) => {
					const Icon = item.icon;
					const isActive = activeTab === item.id;

					return (
						<Button
							key={item.id}
							className={cn(
								"w-full justify-start rounded-md",
								isActive && "border font-medium shadow-xs",
							)}
							variant={isActive ? "secondary" : "ghost"}
							data-active={isActive}
							onClick={() => onTabChange(item.id)}
						>
							<Icon className="mr-2 size-4 shrink-0" />
							<span className="truncate">{item.label}</span>
						</Button>
					);
				})}
			</div>
		</>
	);
}
