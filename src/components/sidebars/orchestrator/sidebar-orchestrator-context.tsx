"use client";

import { usePathname } from "next/navigation";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
} from "react";
import { getFeatureConfig } from "@/components/sidebars/registry/feature-sidebar-registry";
import { isNoSidebarRoute } from "@/components/sidebars/registry/orchestrator-config";
import type { FeatureConfig } from "@/components/sidebars/types";
import { useIsTablet } from "@/hooks/use-tablet";
import { useSidebarStore } from "@/stores/sidebar-store";

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface SidebarOrchestratorContextValue {
	// Layout state
	layoutState: "no-sidebar" | "single-sidebar" | "double-sidebar";

	// Main sidebar state
	isMainSidebarOpen: boolean;
	toggleMainSidebar: () => void;
	setMainSidebarOpen: (open: boolean) => void;

	// Feature sidebar state
	isFeatureSidebarOpen: boolean;
	toggleFeatureSidebar: () => void;
	setFeatureSidebarOpen: (open: boolean) => void;

	// Feature config
	featureConfig: FeatureConfig | undefined;

	// Calculated values
	featureSidebarLeftOffset: string | number;
}

// ============================================================================
// CONTEXT
// ============================================================================

const SidebarOrchestratorContext =
	createContext<SidebarOrchestratorContextValue | null>(null);

// ============================================================================
// HOOK
// ============================================================================

export function useSidebarOrchestrator() {
	const context = useContext(SidebarOrchestratorContext);
	if (!context) {
		throw new Error(
			"useSidebarOrchestrator must be used within a SidebarOrchestratorProvider",
		);
	}
	return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface SidebarOrchestratorProviderProps {
	children: ReactNode;
}

export function SidebarOrchestratorProvider({
	children,
}: SidebarOrchestratorProviderProps) {
	const pathname = usePathname();
	const isTablet = useIsTablet();

	// Get sidebar state from Zustand store
	const {
		isMainSidebarOpen,
		isEventSidebarOpen: isFeatureSidebarOpen,
		setMainSidebarOpen,
		setEventSidebarOpen: setFeatureSidebarOpen,
		toggleMainSidebar,
	} = useSidebarStore();

	// Toggle feature sidebar
	const toggleFeatureSidebar = useCallback(() => {
		setFeatureSidebarOpen(!isFeatureSidebarOpen);
	}, [isFeatureSidebarOpen, setFeatureSidebarOpen]);

	// Check if current route has a feature sidebar
	const featureConfig = useMemo(() => {
		return getFeatureConfig(pathname);
	}, [pathname]);

	// Determine layout state
	const layoutState = useMemo(() => {
		if (isNoSidebarRoute(pathname)) {
			return "no-sidebar" as const;
		}
		if (featureConfig) {
			return "double-sidebar" as const;
		}
		return "single-sidebar" as const;
	}, [pathname, featureConfig]);

	// Calculate left offset for feature sidebar
	const featureSidebarLeftOffset = useMemo(() => {
		if (isTablet) return 0;
		return isMainSidebarOpen ? "16rem" : "3rem";
	}, [isMainSidebarOpen, isTablet]);

	const value = useMemo<SidebarOrchestratorContextValue>(
		() => ({
			layoutState,
			isMainSidebarOpen,
			toggleMainSidebar,
			setMainSidebarOpen,
			isFeatureSidebarOpen,
			toggleFeatureSidebar,
			setFeatureSidebarOpen,
			featureConfig,
			featureSidebarLeftOffset,
		}),
		[
			layoutState,
			isMainSidebarOpen,
			toggleMainSidebar,
			setMainSidebarOpen,
			isFeatureSidebarOpen,
			toggleFeatureSidebar,
			setFeatureSidebarOpen,
			featureConfig,
			featureSidebarLeftOffset,
		],
	);

	return (
		<SidebarOrchestratorContext.Provider value={value}>
			{children}
		</SidebarOrchestratorContext.Provider>
	);
}
