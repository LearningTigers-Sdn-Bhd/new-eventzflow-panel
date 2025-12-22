import { useMemo } from "react";
import { ChartBar, Logs, Package, Users } from "lucide-react";
import { HiTicket } from "react-icons/hi2";
import type { TabItem } from "./tab-config";
import {
	TICKET_TAB_IDS,
	ANALYTICS_TAB_IDS,
	LOGS_TAB_IDS,
	EXHIBITOR_KIT_TAB_IDS,
	USER_MANAGEMENT_TAB_IDS,
} from "./tab-config";

export function useTabGrouping(visibleTabs: TabItem[]) {
	const ticketTabs = useMemo(
		() => visibleTabs.filter((tab) => TICKET_TAB_IDS.includes(tab.id)),
		[visibleTabs],
	);

	const analyticsTabs = useMemo(
		() => visibleTabs.filter((tab) => ANALYTICS_TAB_IDS.includes(tab.id)),
		[visibleTabs],
	);

	const logsTabs = useMemo(
		() => visibleTabs.filter((tab) => LOGS_TAB_IDS.includes(tab.id)),
		[visibleTabs],
	);

	const exhibitorKitTabs = useMemo(
		() => visibleTabs.filter((tab) => EXHIBITOR_KIT_TAB_IDS.includes(tab.id)),
		[visibleTabs],
	);

	const userManagementTabs = useMemo(
		() => visibleTabs.filter((tab) => USER_MANAGEMENT_TAB_IDS.includes(tab.id)),
		[visibleTabs],
	);

	const mainTabs = useMemo(() => {
		const filtered = visibleTabs.filter(
			(tab) =>
				!TICKET_TAB_IDS.includes(tab.id) &&
				!ANALYTICS_TAB_IDS.includes(tab.id) &&
				!LOGS_TAB_IDS.includes(tab.id) &&
				!EXHIBITOR_KIT_TAB_IDS.includes(tab.id) &&
				!USER_MANAGEMENT_TAB_IDS.includes(tab.id),
		);

		const result = [...filtered];
		const locationIndex = result.findIndex((tab) => tab.id === "location");
		const vendorProfileIndex = result.findIndex((tab) => tab.id === "vendor-profile");
		let insertIndex = locationIndex !== -1 ? locationIndex + 1 : 0;

		// Add tickets group
		if (ticketTabs.length > 0) {
			result.splice(insertIndex++, 0, {
				id: "tickets-group",
				label: "Tickets",
				title: "Ticket Management",
				description: "Manage tickets, pending transactions, and scan logs",
				icon: HiTicket,
				route: "tickets",
			});
		}

		// Add exhibitor kit group AFTER vendor-profile if it exists
		if (exhibitorKitTabs.length > 0) {
			// Find vendor-profile position after previous insertions
			const currentVendorProfileIndex = result.findIndex((tab) => tab.id === "vendor-profile");
			const exhibitorKitInsertIndex = currentVendorProfileIndex !== -1 
				? currentVendorProfileIndex + 1 
				: insertIndex;
			
			result.splice(exhibitorKitInsertIndex, 0, {
				id: "exhibitor-kit-group",
				label: "Exhibitor Kit",
				title: "Exhibitor Kit",
				description: "View your items and order more for your booth",
				icon: Package,
				route: exhibitorKitTabs[0]?.route || "my-items",
			});
			insertIndex = exhibitorKitInsertIndex + 1;
		}

		// Add user management group
		if (userManagementTabs.length > 0) {
			result.splice(insertIndex, 0, {
				id: "user-management-group",
				label: "User Management",
				title: "User Management",
				description: "Manage event staff and vendors",
				icon: Users,
				route: userManagementTabs[0]?.route || "event-staff",
			});
		}

		// Add analytics group at the end
		if (analyticsTabs.length > 0) {
			result.push({
				id: "analytics-group",
				label: "Analytics",
				title: "Analytics & Insights",
				description: "View ticket analytics, voucher insights, and mall live feed",
				icon: ChartBar,
				route: "analytics",
			});
		}

		// Add logs group at the end
		if (logsTabs.length > 0) {
			result.push({
				id: "logs-group",
				label: "Logs",
				title: "Activity Logs",
				description: "View voucher redemption, stamp logs, and export logs",
				icon: Logs,
				route: "voucher-logs",
			});
		}

		return result;
	}, [visibleTabs, ticketTabs, analyticsTabs, logsTabs, exhibitorKitTabs, userManagementTabs]);

	return {
		mainTabs,
		ticketTabs,
		analyticsTabs,
		logsTabs,
		exhibitorKitTabs,
		userManagementTabs,
	};
}
