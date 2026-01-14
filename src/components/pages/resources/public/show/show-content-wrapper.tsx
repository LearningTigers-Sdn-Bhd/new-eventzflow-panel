"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

interface ShowContentWrapperProps {
	children: ReactNode;
}

/**
 * Wrapper component that applies parallax effect to the content section
 * Header is min-h-[500px], start translateY after scrolling past header
 * After header (500px), animate from 0 to 80px over next 100px of scroll
 */
export function ShowContentWrapper({ children }: ShowContentWrapperProps) {
	const { scrollY } = useScroll();
	const translateY = useTransform(scrollY, [500, 600], [0, 80]);

	return (
		<motion.div className="w-full" style={{ translateY }}>
			{children}
		</motion.div>
	);
}
