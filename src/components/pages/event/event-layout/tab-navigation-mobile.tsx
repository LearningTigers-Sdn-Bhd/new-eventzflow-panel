import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { TabItem } from "./tab-config";
import {
	TICKET_TAB_IDS,
	ANALYTICS_TAB_IDS,
	LOGS_TAB_IDS,
	EXHIBITOR_KIT_TAB_IDS,
	USER_MANAGEMENT_TAB_IDS,
} from "./tab-config";

interface TabNavigationMobileProps {
	currentTab: string;
	currentTabItem: TabItem;
	mainTabs: TabItem[];
	ticketTabs: TabItem[];
	analyticsTabs: TabItem[];
	logsTabs: TabItem[];
	exhibitorKitTabs: TabItem[];
	userManagementTabs: TabItem[];
	onTabChange: (value: string) => void;
}

export function TabNavigationMobile({
	currentTab,
	currentTabItem,
	mainTabs,
	ticketTabs,
	analyticsTabs,
	logsTabs,
	exhibitorKitTabs,
	userManagementTabs,
	onTabChange,
}: TabNavigationMobileProps) {
	const getSelectValue = () => {
		if (currentTab === "tickets-group") return "tickets";
		if (currentTab === "analytics-group") return "analytics";
		if (currentTab === "logs-group") return "voucher-logs";
		if (currentTab === "exhibitor-kit-group") {
			return exhibitorKitTabs[0]?.route || "my-exhibitor-kit/my-items";
		}
		if (currentTab === "user-management-group") {
			return userManagementTabs[0]?.route || "event-staff";
		}
		return currentTab;
	};

	const renderTabItems = (tabs: TabItem[]) => {
		return tabs.map((tab) => {
			const IconComponent = tab.icon;
			return (
				<SelectItem key={tab.id} value={tab.route} className="h-10! rounded-none">
					<div className="flex items-center gap-2">
						<IconComponent className="size-4" />
						<span>{tab.label}</span>
					</div>
				</SelectItem>
			);
		});
	};

	return (
		<div className="w-full border-y border-dashed">
			<Select value={getSelectValue()} onValueChange={onTabChange}>
				<SelectTrigger className="h-12! w-full rounded-none border-none bg-accent/50 transition-colors hover:bg-accent">
					<SelectValue>
						{(() => {
							const IconComponent = currentTabItem.icon;
							return (
								<div className="flex items-center gap-2">
									<IconComponent className="size-4" />
									<span>{currentTabItem.label}</span>
								</div>
							);
						})()}
					</SelectValue>
				</SelectTrigger>
				<SelectContent className="rounded-none bg-background">
					{mainTabs.map((item) => {
						if (item.id === "tickets-group") return renderTabItems(ticketTabs);
						if (item.id === "analytics-group") return renderTabItems(analyticsTabs);
						if (item.id === "logs-group") return renderTabItems(logsTabs);
						if (item.id === "exhibitor-kit-group") return renderTabItems(exhibitorKitTabs);
						if (item.id === "user-management-group") return renderTabItems(userManagementTabs);

						const IconComponent = item.icon;
						return (
							<SelectItem key={item.id} value={item.route} className="h-10! rounded-none">
								<div className="flex items-center gap-2">
									<IconComponent className="size-4" />
									<span>{item.label}</span>
								</div>
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
}
