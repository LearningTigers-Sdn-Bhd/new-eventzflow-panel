"use client";

/**
 * Compound Component Pattern Layout
 *
 * This is the layout will be used to use context to determine the which layout to render.
 * It will provide a consistent layout for the admin UI pages.
 * With the flexibility of CVA and ShadCN philosophies to create consistent and customizable components.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

// Breakpoint constants matching existing hooks
const MOBILE_BREAKPOINT = 768; // From use-mobile.ts
const TABLET_BREAKPOINT = 1024; // From use-tablet.ts

type ResponsiveBreakpoint = "mobile" | "tablet" | "desktop";

interface ResponsiveLayoutProps {
	children: React.ReactNode;
	breakpoint?: ResponsiveBreakpoint; // Controlled mode
	className?: string;
}

interface ResponsiveViewProps {
	children: React.ReactNode;
	className?: string;
}

interface ResponsiveContextProps {
	breakpoint: ResponsiveBreakpoint;
	mounted: boolean;
}

const ResponsiveContext = React.createContext<ResponsiveContextProps | null>(
	null,
);

function useResponsive() {
	const context = React.useContext(ResponsiveContext);
	if (!context) {
		throw new Error(
			"Responsive components must be used within ResponsiveLayout.",
		);
	}
	return context;
}

function useResponsiveBreakpoint(breakpoint?: ResponsiveBreakpoint) {
	const [currentBreakpoint, setCurrentBreakpoint] =
		React.useState<ResponsiveBreakpoint>("desktop");
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		if (breakpoint) {
			// Controlled mode takes priority
			setCurrentBreakpoint(breakpoint);
			if (!mounted) setMounted(true);
			return;
		}

		// Auto-detection mode
		const updateBreakpoint = () => {
			const width = window.innerWidth;
			let newBreakpoint: ResponsiveBreakpoint;
			if (width < MOBILE_BREAKPOINT) {
				newBreakpoint = "mobile"; // < 768px
			} else if (width < TABLET_BREAKPOINT) {
				newBreakpoint = "tablet"; // 768px - 1023px
			} else {
				newBreakpoint = "desktop"; // ≥ 1024px
			}
			setCurrentBreakpoint(newBreakpoint);
		};

		updateBreakpoint();
		setMounted(true);

		const mqlMobile = window.matchMedia(
			`(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
		);
		const mqlTablet = window.matchMedia(
			`(max-width: ${TABLET_BREAKPOINT - 1}px)`,
		);
		const onChange = () => updateBreakpoint();

		mqlMobile.addEventListener("change", onChange);
		mqlTablet.addEventListener("change", onChange);
		return () => {
			mqlMobile.removeEventListener("change", onChange);
			mqlTablet.removeEventListener("change", onChange);
		};
	}, [breakpoint, mounted]);

	return { breakpoint: currentBreakpoint, mounted };
}

function ResponsiveLayout({
	children,
	breakpoint: controlledBreakpoint,
	className,
}: ResponsiveLayoutProps) {
	const { breakpoint, mounted } = useResponsiveBreakpoint(controlledBreakpoint);

	const contextValue = React.useMemo<ResponsiveContextProps>(
		() => ({ breakpoint, mounted }),
		[breakpoint, mounted],
	);

	return (
		<ResponsiveContext.Provider value={contextValue}>
			<div data-slot="responsive-layout" className={cn(className)}>
				{children}
			</div>
		</ResponsiveContext.Provider>
	);
}

function DesktopView({ children, className }: ResponsiveViewProps) {
	const { breakpoint, mounted } = useResponsive();

	if (!mounted) {
		return null; // Prevent hydration mismatch
	}

	return breakpoint === "desktop" ? (
		<div data-slot="responsive-desktop" className={cn(className)}>
			{children}
		</div>
	) : null;
}

function TabletView({ children, className }: ResponsiveViewProps) {
	const { breakpoint, mounted } = useResponsive();

	if (!mounted) {
		return null; // Prevent hydration mismatch
	}

	return breakpoint === "tablet" ? (
		<div data-slot="responsive-tablet" className={cn(className)}>
			{children}
		</div>
	) : null;
}

function MobileView({ children, className }: ResponsiveViewProps) {
	const { breakpoint, mounted } = useResponsive();

	if (!mounted) {
		return null; // Prevent hydration mismatch
	}

	return breakpoint === "mobile" ? (
		<div data-slot="responsive-mobile" className={cn(className)}>
			{children}
		</div>
	) : null;
}

function MobileTabletView({ children, className }: ResponsiveViewProps) {
	const { breakpoint, mounted } = useResponsive();

	if (!mounted) {
		return null; // Prevent hydration mismatch
	}

	return breakpoint === "mobile" || breakpoint === "tablet" ? (
		<div data-slot="responsive-mobile-tablet" className={cn(className)}>
			{children}
		</div>
	) : null;
}

export {
	ResponsiveLayout,
	DesktopView,
	TabletView,
	MobileView,
	MobileTabletView,
	useResponsive,
};
