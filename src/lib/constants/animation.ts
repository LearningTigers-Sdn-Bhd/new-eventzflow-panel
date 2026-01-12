import type { Easing } from "framer-motion";

/**
 * Smooth easing curve for animations
 * Based on cubic-bezier timing function for natural, organic motion
 */
export const SMOOTH_EASE: Easing = [0.25, 0.46, 0.45, 0.94];

/**
 * Common animation durations (in seconds)
 */
export const DURATION = {
	fast: 0.2,
	normal: 0.5,
	slow: 0.8,
	slower: 1.5,
} as const;

/**
 * Common animation variants for reuse
 */
export const fadeInUp = {
	initial: { opacity: 0, y: 30 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 30 },
} as const;

export const fadeIn = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
} as const;

export const scaleIn = {
	initial: { opacity: 0, scale: 0.95 },
	animate: { opacity: 1, scale: 1 },
	exit: { opacity: 0, scale: 0.95 },
} as const;
