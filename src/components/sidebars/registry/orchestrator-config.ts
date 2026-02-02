import type {
	NoSidebarRoute,
	OrchestratorConfig,
} from "@/components/sidebars/types";

/**
 * Routes that should render without any sidebar.
 * Migrated from auth-layout-client.tsx.
 */
export const noSidebarRoutes: NoSidebarRoute[] = [
	{ route: "/verify-email", type: "start" },
	{ route: "/help", type: "start" },
	{ route: "lucky-draw/session", type: "include" },
	{ route: "prize-roulette/session", type: "include" },
	{ route: "review-submit", type: "include" },
	{ route: "seat-ticketing/sessions/", type: "include" },
];

/**
 * Global orchestrator configuration.
 */
export const orchestratorConfig: OrchestratorConfig = {
	noSidebarRoutes,
};

/**
 * Check if a pathname matches any no-sidebar route.
 */
export function isNoSidebarRoute(pathname: string): boolean {
	return noSidebarRoutes.some(({ route, type }) =>
		type === "start" ? pathname.startsWith(route) : pathname.includes(route),
	);
}
