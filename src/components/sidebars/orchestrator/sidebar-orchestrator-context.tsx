"use client";

import { usePathname } from "next/navigation";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
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

	// Context swap: when a feature sidebar is active, the main app sidebar
	// auto-collapses into its icon rail so the feature sidebar owns the
	// navigation context and the content reclaims horizontal space. This is an
	// auto-collapse on *entering* the feature context, not a lock — the user
	// can still expand the main sidebar manually (toggle or Cmd/Ctrl+B) to peek
	// at global nav. On navigating back out to a normal (single-sidebar) page,
	// the main sidebar reopens — but only if we were the ones who collapsed it,
	// so a sidebar the user deliberately closed stays closed.
	// Desktop only — on tablet the main sidebar renders as an overlay sheet.
	const isDouble = layoutState === "double-sidebar";
	const wasDoubleRef = useRef(false);
	// Whether the auto-collapse (not the user) closed the main sidebar.
	const autoCollapsedRef = useRef(false);
	useEffect(() => {
		if (isTablet) {
			wasDoubleRef.current = isDouble;
			return;
		}

		let raf: number | undefined;

		if (isDouble && !wasDoubleRef.current) {
			// Entering a feature context: collapse the main sidebar if it's open,
			// and remember that we did so we can restore it on exit. Defer to just
			// after first paint (rAF) so the collapse animation doesn't compete with
			// the initial page render for the main thread — that competition is what
			// makes the entry animation stutter on a fresh load.
			if (isMainSidebarOpen) {
				autoCollapsedRef.current = true;
				raf = requestAnimationFrame(() => setMainSidebarOpen(false));
			}
		} else if (!isDouble && wasDoubleRef.current) {
			// Leaving a feature context: reopen only if we auto-collapsed it. This
			// runs on a user navigation (not initial load), so it stays synchronous.
			if (autoCollapsedRef.current) {
				autoCollapsedRef.current = false;
				setMainSidebarOpen(true);
			}
		}

		wasDoubleRef.current = isDouble;

		return () => {
			if (raf !== undefined) cancelAnimationFrame(raf);
		};
	}, [isDouble, isTablet, isMainSidebarOpen, setMainSidebarOpen]);

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
