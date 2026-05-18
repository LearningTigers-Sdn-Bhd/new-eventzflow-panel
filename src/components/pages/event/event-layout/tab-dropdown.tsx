import { ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TabItem } from "./tab-config";

interface TabDropdownProps {
	item: TabItem;
	isActive: boolean;
	tabs: TabItem[];
	onTabChange: (route: string) => void;
}

export function TabDropdown({
	item,
	isActive,
	tabs,
	onTabChange,
}: TabDropdownProps) {
	const IconComponent = item.icon;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={cn(
						"inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1 whitespace-nowrap border border-transparent px-2 py-1 font-medium text-foreground text-sm lg:gap-1.5",
						"focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
						"dark:text-muted-foreground",
						isActive &&
							"bg-background shadow-sm dark:border-input dark:bg-input/30 dark:text-foreground",
					)}
				>
					<IconComponent className="size-5 lg:size-4" />
					<span className="hidden xl:inline">{item.label}</span>
					<ChevronDown className="ml-0.5 size-3 opacity-50" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="min-w-[200px]">
				{tabs.map((tab) => {
					const TabIcon = tab.icon;
					return (
						<DropdownMenuItem
							key={tab.id}
							onClick={() => onTabChange(tab.route)}
							className="cursor-pointer"
						>
							<TabIcon className="mr-2 size-4" />
							<span>{tab.label}</span>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
