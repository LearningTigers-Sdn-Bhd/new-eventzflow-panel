import { eventSidebarConfig } from "@/components/sidebars/features/events/event-sidebar-config";
import { resourceSidebarConfig } from "@/components/sidebars/features/resources/resource-sidebar-config";
import type {
	FeatureConfig,
	FeatureMatcher,
} from "@/components/sidebars/types";

/**
 * Registry of feature sidebars.
 * Each entry maps a URL pattern to a feature configuration.
 * Order matters - first match wins.
 */
export const featureSidebarRegistry: FeatureMatcher[] = [
	{
		// Match /event/{id} but not just /event
		matcher: /^\/event\/[^/]+/,
		config: eventSidebarConfig,
	},
	{
		// Match /manage-resources/{section} but not just /manage-resources
		matcher: /^\/manage-resources\/[^/]+/,
		config: resourceSidebarConfig,
	},
];

/**
 * Find the matching feature config for a pathname.
 * Returns the first matching config or undefined if no match.
 */
export function getFeatureConfig(pathname: string): FeatureConfig | undefined {
	for (const { matcher, config, getConfig } of featureSidebarRegistry) {
		if (matcher.test(pathname)) {
			if (getConfig) {
				// Extract params if needed
				const match = pathname.match(matcher);
				const params = match?.groups ?? {};
				return getConfig(params);
			}
			return config;
		}
	}
	return undefined;
}

/**
 * Check if a pathname matches any feature sidebar.
 */
export function hasFeatureSidebar(pathname: string): boolean {
	return featureSidebarRegistry.some(({ matcher }) => matcher.test(pathname));
}

/**
 * Get the base path for a feature from the pathname.
 * e.g. /event/123/details -> /event/123
 */
export function getFeatureBasePath(pathname: string): string {
	for (const { matcher } of featureSidebarRegistry) {
		const match = pathname.match(matcher);
		if (match) {
			return match[0];
		}
	}
	return "";
}
