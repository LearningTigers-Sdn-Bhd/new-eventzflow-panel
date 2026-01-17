"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { Participant } from "@/stores/lucky-draw-store";
import type { Prize } from "../draw-styles/type";

/**
 * Complete draw context value that contains all draw-related data
 * This eliminates the need to pass props through multiple component layers
 */
interface DrawContextValue {
	// ============================================
	// Draw Configuration
	// ============================================
	drawStyle: "wheel" | "slot" | "box" | null;
	drawTheme: "wireframe" | "colorful" | "cartoon";

	// ============================================
	// Draw Data
	// ============================================
	participants?: Participant[];
	prizes?: Prize[];
	mode: "participants" | "prizes";

	// ============================================
	// Draw State
	// ============================================
	isDrawing: boolean;
	isCelebrating: boolean;
	drawResetKey: number;

	// ============================================
	// Callbacks
	// ============================================
	onDrawComplete: (winner: Participant | Prize) => void | Promise<void>;
	onDraw?: () => void;

	// ============================================
	// Lucky-Draw Specific (Optional)
	// ============================================
	useGifts?: boolean;
	hasAvailableGift?: boolean;

	// ============================================
	// Loading States
	// ============================================
	isLoading?: boolean;
}

/**
 * Draw Context
 * Provides draw-related data to all child components
 */
const DrawContext = createContext<DrawContextValue | undefined>(undefined);

/**
 * Draw Provider Props
 */
interface DrawProviderProps {
	value: DrawContextValue;
	children: ReactNode;
}

/**
 * Draw Provider Component
 * Wraps components that need access to draw context
 *
 * Usage:
 * ```tsx
 * <DrawProvider value={drawContextValue}>
 *   <DrawComponent />
 * </DrawProvider>
 * ```
 */
export function DrawProvider({ value, children }: DrawProviderProps) {
	// Memoize context value to prevent unnecessary re-renders
	const memoizedValue = useMemo(() => value, [value]);

	return (
		<DrawContext.Provider value={memoizedValue}>
			{children}
		</DrawContext.Provider>
	);
}

/**
 * Hook to access draw context
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const {
 *     drawStyle,
 *     drawTheme,
 *     participants,
 *     prizes,
 *     mode,
 *     isDrawing,
 *     // ... all context values
 *   } = useDrawContext();
 *
 *   // Use values directly, no props needed!
 * }
 * ```
 *
 * @throws Error if used outside DrawProvider
 */
export function useDrawContext(): DrawContextValue {
	const context = useContext(DrawContext);

	if (!context) {
		throw new Error(
			"useDrawContext must be used within DrawProvider. " +
				"Make sure to wrap your component tree with <DrawProvider>.",
		);
	}

	return context;
}

/**
 * Optional: Hook with fallback for backward compatibility
 * This allows components to work with or without context
 *
 * Usage:
 * ```tsx
 * function MyComponent(props?: Partial<DrawContextValue>) {
 *   const context = useDrawContextOptional();
 *   const config = { ...context, ...props }; // Props override context
 * }
 * ```
 */
export function useDrawContextOptional(): DrawContextValue | undefined {
	return useContext(DrawContext);
}
