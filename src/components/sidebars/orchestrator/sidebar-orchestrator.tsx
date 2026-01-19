"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { type ComponentType, useMemo } from "react";
import { AppSidebar } from "@/components/sidebars/app/app-sidebar";
import { ContentLayout } from "@/components/sidebars/app/content-layout";

import { FeatureSidebar } from "@/components/sidebars/orchestrator/feature-sidebar";
import {
	SidebarOrchestratorProvider,
	useSidebarOrchestrator,
} from "@/components/sidebars/orchestrator/sidebar-orchestrator-context";
import { getFeatureBasePath } from "@/components/sidebars/registry/feature-sidebar-registry";
import type { FeatureConfig } from "@/components/sidebars/types";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// ============================================================================
// INTERNAL ORCHESTRATOR CONTENT
// ============================================================================

interface OrchestratorContentProps {
	children: ReactNode;
}

// Helper component to handle feature sidebar context/data
function FeatureSidebarWrapper({
	featureConfig,
	leftOffset,
	basePath,
}: {
	featureConfig: FeatureConfig;
	leftOffset: string | number;
	basePath: string;
}) {
	// Use the context hook from the config to get permissions and data
	// Note: We rely on the fact that for a given featureConfig, this hook (if present)
	// behaves consistently.
	const contextData = featureConfig.loader?.useContext?.();

	// Extract permissions and data from context
	const permissions = contextData?.permissions ?? contextData;
	const data = contextData?.event ?? contextData?.data;
	const isLoading = contextData?.isLoading ?? false;

	return (
		<FeatureSidebar
			config={featureConfig}
			leftOffset={leftOffset}
			basePath={basePath}
			permissions={permissions}
			data={data}
			isLoading={isLoading}
		/>
	);
}

function OrchestratorContent({ children }: OrchestratorContentProps) {
	const pathname = usePathname();
	const {
		isMainSidebarOpen,
		setMainSidebarOpen,
		isFeatureSidebarOpen,
		setFeatureSidebarOpen,
		featureConfig,
		featureSidebarLeftOffset,
		layoutState,
	} = useSidebarOrchestrator();

	// Extract base path - prefer static config, fall back to dynamic extraction
	const basePath = useMemo(() => {
		// If feature config defines a static base path, use it
		if (featureConfig?.basePath) {
			return featureConfig.basePath;
		}
		// Otherwise, extract dynamic base path from URL (e.g., /event/[id])
		return getFeatureBasePath(pathname);
	}, [pathname, featureConfig?.basePath]);

	// Handle different layout states
	if (layoutState === "no-sidebar") {
		return (
			<div className="mx-auto flex h-svh w-full max-w-7xl flex-col">
				{children}
			</div>
		);
	}

	// Unified layout for single and double sidebar to ensure valid transitions
	// We always render the full nested structure, effectively "hiding" the inner key parts when not needed
	// reducing React tree thrashing.

	// 1. Prepare Feature Provider Wrapper
	const FeatureProvider: ComponentType<{ children: ReactNode }> =
		featureConfig?.loader?.provider ?? (({ children }) => <>{children}</>);

	return (
		<SidebarProvider
			open={isMainSidebarOpen}
			onOpenChange={setMainSidebarOpen}
			cookieName="sidebar_main_state"
			keyboardShortcut="b"
		>
			<AppSidebar />
			<SidebarInset>
				<FeatureProvider>
					<SidebarProvider
						open={isFeatureSidebarOpen}
						onOpenChange={setFeatureSidebarOpen}
						cookieName="sidebar_feature_state"
						keyboardShortcut={null}
					>
						{featureConfig && (
							<FeatureSidebarWrapper
								featureConfig={featureConfig}
								leftOffset={featureSidebarLeftOffset}
								basePath={basePath}
							/>
						)}
						<SidebarInset>
							<ContentLayout hasDoubleSidebar={!!featureConfig}>
								{children}
							</ContentLayout>
						</SidebarInset>
					</SidebarProvider>
				</FeatureProvider>
			</SidebarInset>
		</SidebarProvider>
	);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface SidebarOrchestratorProps {
	children: ReactNode;
}

/**
 * SidebarOrchestrator is the main layout component that handles:
 * - Detecting no-sidebar routes
 * - Rendering the main AppSidebar
 * - Detecting and rendering feature sidebars based on URL matching
 * - Wrapping content with feature providers for data sharing
 */
export function SidebarOrchestrator({ children }: SidebarOrchestratorProps) {
	return (
		<SidebarOrchestratorProvider>
			<OrchestratorContent>{children}</OrchestratorContent>
		</SidebarOrchestratorProvider>
	);
}
