import type { LucideIcon } from "lucide-react";
import type React from "react";
import type { IconType } from "react-icons";

// ============================================================================
// MENU TYPES
// ============================================================================

/**
 * A single menu item that can appear standalone or within a group.
 * The visible function uses `any` to allow feature-specific permission types
 * to be supplied without type errors.
 */
export type MenuItem = {
	route: string;
	label: string;
	description: string;
	icon: IconType | LucideIcon;
	// biome-ignore lint/suspicious/noExplicitAny: Allow feature-specific permission types
	visible?: (permissions: any, data?: any) => boolean;
	isActive?: (pathname: string, route: string) => boolean;
};

/**
 * A collapsible group of menu items.
 */
export type MenuGroup = {
	id: string;
	label: string;
	icon: IconType | LucideIcon;
	// biome-ignore lint/suspicious/noExplicitAny: Allow feature-specific permission types
	visible?: (permissions: any, data?: any) => boolean;
	tabs: MenuItem[];
};

/**
 * Complete menu configuration for a feature sidebar.
 */
export type MenuConfig = {
	standalone: MenuItem[];
	groups: MenuGroup[];
};

// ============================================================================
// FEATURE CONFIG TYPES
// ============================================================================

/**
 * Loader configuration for data fetching.
 * The provider wraps the sidebar AND page content.
 */
export type LoaderConfig = {
	/** React Context Provider component */
	provider: React.ComponentType<{ children: React.ReactNode }>;
	/** Hook to access the context data */
	// biome-ignore lint/suspicious/noExplicitAny: Allow feature-specific context types
	useContext: () => any;
};

/**
 * Header/Footer component configuration.
 */
export type ComponentConfig<P = Record<string, unknown>> = {
	component: React.ComponentType<P>;
	props?: Partial<P>;
};

/**
 * Complete feature sidebar configuration.
 * Defines everything needed to render a feature's secondary sidebar.
 */
export type FeatureConfig = {
	/** Data loader (provider + context hook) */
	loader?: LoaderConfig;
	/** Header component (e.g., event switcher) */
	header?: ComponentConfig;
	/** Menu configuration (standalone items + groups) */
	menu: MenuConfig;
	/** Footer component */
	footer?: ComponentConfig;
	/** Base path for menu item routes (e.g., "/event/123") */
	basePath?: string;
	/** Function to extract route params from pathname */
	extractParams?: (pathname: string) => Record<string, string>;
};

/**
 * Maps a URL pattern to a feature configuration.
 */
export type FeatureMatcher = {
	/** Regex pattern to match against pathname */
	matcher: RegExp;
	/** The feature config to use when matched */
	config: FeatureConfig;
	/** Optional: Function to get dynamic config based on params */
	getConfig?: (params: Record<string, string>) => FeatureConfig;
};

// ============================================================================
// ORCHESTRATOR CONFIG TYPES
// ============================================================================

/**
 * Route configuration for routes that should not show any sidebar.
 */
export type NoSidebarRoute = {
	route: string;
	type: "start" | "include";
};

/**
 * Global orchestrator configuration.
 */
export type OrchestratorConfig = {
	noSidebarRoutes: NoSidebarRoute[];
};
