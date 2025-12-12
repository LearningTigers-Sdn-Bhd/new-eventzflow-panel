import { useMemo } from "react";
import type { TabItem } from "./tab-config";
import {
	TICKET_TAB_IDS,
	ANALYTICS_TAB_IDS,
	LOGS_TAB_IDS,
	EXHIBITOR_KIT_TAB_IDS,
	USER_MANAGEMENT_TAB_IDS,
} from "./tab-config";

type EventPermissions = {
	isExhibitionContractor: boolean;
};

export function useCurrentTab(
	pathname: string,
	visibleTabs: TabItem[],
	eventId: string,
	permissions: EventPermissions,
) {
	const currentTab = useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);
		const eventIdIndex = segments.findIndex((s) => s === eventId);

		if (eventIdIndex !== -1) {
			const remainingPath = segments.slice(eventIdIndex + 1).join("/");
			const matchedTab = visibleTabs.find((tab) => remainingPath.startsWith(tab.route));
			if (matchedTab) {
				return matchedTab.id;
			}
		}

		// Check for grouped tabs
		for (let i = segments.length - 1; i >= 0; i--) {
			const segment = segments[i];
			if (TICKET_TAB_IDS.includes(segment)) return "tickets-group";
			if (ANALYTICS_TAB_IDS.includes(segment)) return "analytics-group";
			if (LOGS_TAB_IDS.includes(segment)) return "logs-group";
			if (EXHIBITOR_KIT_TAB_IDS.includes(segment)) return "exhibitor-kit-group";
			if (USER_MANAGEMENT_TAB_IDS.includes(segment) && !permissions.isExhibitionContractor) {
				return "user-management-group";
			}
			if (visibleTabs.some((tab) => tab.route === segment)) {
				return segment;
			}
		}

		return visibleTabs[0]?.route ?? "location";
	}, [pathname, visibleTabs, eventId, permissions.isExhibitionContractor]);

	const currentTabItem = useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);
		const eventIdIndex = segments.findIndex((s) => s === eventId);

		if (eventIdIndex !== -1) {
			const remainingPath = segments.slice(eventIdIndex + 1).join("/");
			const matchedTab = visibleTabs.find((tab) => remainingPath.startsWith(tab.route));
			if (matchedTab) return matchedTab;
		}

		for (let i = segments.length - 1; i >= 0; i--) {
			const segment = segments[i];
			if (
				TICKET_TAB_IDS.includes(segment) ||
				ANALYTICS_TAB_IDS.includes(segment) ||
				LOGS_TAB_IDS.includes(segment) ||
				EXHIBITOR_KIT_TAB_IDS.includes(segment) ||
				USER_MANAGEMENT_TAB_IDS.includes(segment)
			) {
				return visibleTabs.find((item) => item.route === segment) || visibleTabs[0];
			}
		}

		return (
			visibleTabs.find((item) => item.id === currentTab) ||
			visibleTabs.find((item) => item.route === currentTab) ||
			visibleTabs[0]
		);
	}, [currentTab, visibleTabs, pathname, eventId]);

	return { currentTab, currentTabItem };
}
