"use client";

import { FileQuestion, InfoIcon, Package, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export type ManageKitsTab = "exhibitor-info" | "rentable-items" | "printing-services" | "custom-requests";

interface NavigationItem {
	id: ManageKitsTab;
	label: string;
	shortLabel: string;
	icon: React.ComponentType<{ className?: string }>;
}

interface ManageKitsNavigationProps {
	activeTab: ManageKitsTab;
	onTabChange: (tab: ManageKitsTab) => void;
	showPrintingServices?: boolean;
	itemsCount?: number;
	printingsCount?: number;
	customRequestsCount?: number;
}

export function ManageKitsNavigation({
	activeTab,
	onTabChange,
	showPrintingServices = true,
	itemsCount = 0,
	printingsCount = 0,
	customRequestsCount = 0,
}: ManageKitsNavigationProps) {
	const navigationItems: NavigationItem[] = [
		{
			id: "exhibitor-info",
			label: "Exhibitor Info",
			shortLabel: "Exhibitor Info",
			icon: InfoIcon,
		},
		{
			id: "rentable-items",
			label: `Rentable Items${itemsCount > 0 ? ` (${itemsCount})` : ""}`,
			shortLabel: `Items${itemsCount > 0 ? ` (${itemsCount})` : ""}`,
			icon: Package,
		},
		...(showPrintingServices
			? [
					{
						id: "printing-services" as ManageKitsTab,
						label: `Printing Services${printingsCount > 0 ? ` (${printingsCount})` : ""}`,
						shortLabel: `Printing${printingsCount > 0 ? ` (${printingsCount})` : ""}`,
						icon: Printer,
					},
				]
			: []),
		// HIDDEN: Custom Requests feature temporarily disabled
		// {
		// 	id: "custom-requests",
		// 	label: `Custom Requests${customRequestsCount > 0 ? ` (${customRequestsCount})` : ""}`,
		// 	shortLabel: `Requests${customRequestsCount > 0 ? ` (${customRequestsCount})` : ""}`,
		// 	icon: FileQuestion,
		// },
	];

	const activeItem = navigationItems.find((item) => item.id === activeTab);

	return (
		<>
			{/* Mobile: Dropdown */}
			<div className="md:hidden w-full">
				<Select value={activeTab} onValueChange={(value) => onTabChange(value as ManageKitsTab)}>
					<SelectTrigger className="w-full rounded-none">
						<SelectValue>
							{activeItem && (
								<div className="flex items-center gap-2">
									<activeItem.icon className="h-4 w-4" />
									<span>{activeItem.shortLabel}</span>
								</div>
							)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent className="rounded-none">
						{navigationItems.map((item) => {
							const Icon = item.icon;
							return (
								<SelectItem key={item.id} value={item.id} className="rounded-none">
									<div className="flex items-center gap-2">
										<Icon className="h-4 w-4" />
										<span>{item.shortLabel}</span>
									</div>
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
			</div>

			{/* Desktop: Sidebar */}
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
		</>
	);
}
