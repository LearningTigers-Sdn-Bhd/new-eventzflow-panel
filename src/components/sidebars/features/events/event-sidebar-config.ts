import type { FeatureConfig, MenuConfig } from "@/components/sidebars/types";
import { eventMenuConfig } from "./event-menu-config";
import { EventMenuHeader } from "./event-menu-header";
import {
	EventSidebarProvider,
	useEventSidebarContext,
} from "./event-sidebar-provider";

/**
 * Event Sidebar Configuration
 *
 * Assembles all components needed for the event feature sidebar:
 * - Provider for data fetching (events, permissions)
 * - Header component (event switcher dropdown)
 * - Menu configuration (standalone items + groups)
 */
export const eventSidebarConfig: FeatureConfig = {
	loader: {
		provider: EventSidebarProvider,
		useContext: useEventSidebarContext,
	},
	header: {
		component: EventMenuHeader,
	},
	menu: eventMenuConfig as unknown as MenuConfig,
};
