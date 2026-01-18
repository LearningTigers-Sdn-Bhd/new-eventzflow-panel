import type { FeatureConfig, MenuConfig } from "@/components/sidebars/types";
import { resourceMenuConfig } from "./resource-menu-config";
import { ResourceMenuHeader } from "./resource-menu-header";
import {
	ResourceSidebarProvider,
	useResourceSidebarContext,
} from "./resource-sidebar-provider";

/**
 * Resource Sidebar Configuration
 *
 * Assembles all components needed for the resource feature sidebar:
 * - Provider for data fetching (permissions)
 * - Header component (title and description)
 * - Menu configuration (standalone items + groups)
 */
export const resourceSidebarConfig: FeatureConfig = {
	loader: {
		provider: ResourceSidebarProvider,
		useContext: useResourceSidebarContext,
	},
	header: {
		component: ResourceMenuHeader,
	},
	menu: resourceMenuConfig as unknown as MenuConfig,
};
