import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabDropdown } from "./tab-dropdown";
import type { TabItem } from "./tab-config";
import {
	TICKET_TAB_IDS,
	ANALYTICS_TAB_IDS,
	LOGS_TAB_IDS,
	EXHIBITOR_KIT_TAB_IDS,
	USER_MANAGEMENT_TAB_IDS,
} from "./tab-config";

interface TabNavigationDesktopProps {
	currentTab: string;
	mainTabs: TabItem[];
	ticketTabs: TabItem[];
	analyticsTabs: TabItem[];
	logsTabs: TabItem[];
	exhibitorKitTabs: TabItem[];
	userManagementTabs: TabItem[];
	onTabChange: (value: string) => void;
}

export function TabNavigationDesktop({
	currentTab,
	mainTabs,
	ticketTabs,
	analyticsTabs,
	logsTabs,
	exhibitorKitTabs,
	userManagementTabs,
	onTabChange,
}: TabNavigationDesktopProps) {
	const isGroupActive = (groupId: string, tabIds: string[]) => {
		return tabIds.includes(currentTab) || currentTab === groupId;
	};

	return (
		<div className="w-full border-y border-dashed">
			<Tabs value={currentTab} onValueChange={onTabChange}>
				<TabsList className="flex h-12 w-full rounded-none">
					{mainTabs.map((item) => {
						const IconComponent = item.icon;

						if (item.id === "tickets-group") {
							return (
								<TabDropdown
									key={item.id}
									item={item}
									isActive={isGroupActive("tickets-group", TICKET_TAB_IDS)}
									tabs={ticketTabs}
									onTabChange={onTabChange}
								/>
							);
						}

						if (item.id === "user-management-group") {
							return (
								<TabDropdown
									key={item.id}
									item={item}
									isActive={isGroupActive("user-management-group", USER_MANAGEMENT_TAB_IDS)}
									tabs={userManagementTabs}
									onTabChange={onTabChange}
								/>
							);
						}

						if (item.id === "exhibitor-kit-group") {
							return (
								<TabDropdown
									key={item.id}
									item={item}
									isActive={isGroupActive("exhibitor-kit-group", EXHIBITOR_KIT_TAB_IDS)}
									tabs={exhibitorKitTabs}
									onTabChange={onTabChange}
								/>
							);
						}

						if (item.id === "analytics-group") {
							return (
								<TabDropdown
									key={item.id}
									item={item}
									isActive={isGroupActive("analytics-group", ANALYTICS_TAB_IDS)}
									tabs={analyticsTabs}
									onTabChange={onTabChange}
								/>
							);
						}

						if (item.id === "logs-group") {
							return (
								<TabDropdown
									key={item.id}
									item={item}
									isActive={isGroupActive("logs-group", LOGS_TAB_IDS)}
									tabs={logsTabs}
									onTabChange={onTabChange}
								/>
							);
						}

						return (
							<TabsTrigger
								key={item.id}
								value={item.id}
								className="flex flex-1 items-center justify-center gap-1 rounded-none lg:gap-2"
							>
								<IconComponent className="size-5 lg:size-4" />
								<span className="hidden xl:inline">{item.label}</span>
							</TabsTrigger>
						);
					})}
				</TabsList>
			</Tabs>
		</div>
	);
}
