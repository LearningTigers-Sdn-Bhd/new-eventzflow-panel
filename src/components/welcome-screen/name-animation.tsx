"use client";

import { AnimatePresence, motion, type Transition } from "framer-motion";
import { useEffect, useState } from "react";
import type { AnimationType } from "@/lib/api/check-in-display/types";

interface NameAnimationProps {
	name: string;
	animationType: AnimationType;
	fontFamily: string;
	fontSize: number;
	isBold?: boolean;
	nameColor?: string;
}

interface AnimationVariants {
	initial: Record<string, number>;
	animate: Record<string, number>;
	exit: Record<string, number>;
	transition: Transition;
}

/**
 * Animated name display component for the welcome screen
 * Supports multiple animation types: fade_in, slide_up, zoom_in, bounce, typewriter, no_animation
 */
export function NameAnimation({
	name,
	animationType,
	fontFamily,
	fontSize,
	isBold = false,
	nameColor = "#FFFFFF",
}: NameAnimationProps) {
	const [displayedText, setDisplayedText] = useState("");

	// Typewriter effect
	useEffect(() => {
		if (animationType !== "typewriter") {
			setDisplayedText(name);
			return;
		}

		setDisplayedText("");
		let currentIndex = 0;
		const interval = setInterval(() => {
			if (currentIndex <= name.length) {
				setDisplayedText(name.slice(0, currentIndex));
				currentIndex++;
			} else {
				clearInterval(interval);
			}
		}, 80);

		return () => clearInterval(interval);
	}, [name, animationType]);

	const getAnimationVariants = (): AnimationVariants => {
		switch (animationType) {
			case "fade_in":
				return {
					initial: { opacity: 0 },
					animate: { opacity: 1 },
					exit: { opacity: 0 },
					transition: { duration: 0.8, ease: "easeOut" } as Transition,
				};
			case "slide_up":
				return {
					initial: { opacity: 0, y: 100 },
					animate: { opacity: 1, y: 0 },
					exit: { opacity: 0, y: -50 },
					transition: { duration: 0.6, ease: "easeOut" } as Transition,
				};
			case "zoom_in":
				return {
					initial: { opacity: 0, scale: 0.3 },
					animate: { opacity: 1, scale: 1 },
					exit: { opacity: 0, scale: 1.2 },
					transition: { duration: 0.5, ease: "easeOut" } as Transition,
				};
			case "bounce":
				return {
					initial: { opacity: 0, scale: 0.3, y: -50 },
					animate: { opacity: 1, scale: 1, y: 0 },
					exit: { opacity: 0, scale: 0.8 },
					transition: {
						type: "spring",
						stiffness: 300,
						damping: 15,
					} as Transition,
				};
			case "typewriter":
			case "no_animation":
			default:
				return {
					initial: { opacity: 1 },
					animate: { opacity: 1 },
					exit: { opacity: 0 },
					transition: { duration: 0.2 } as Transition,
				};
		}
	};

	const variants = getAnimationVariants();
	const textToDisplay = animationType === "typewriter" ? displayedText : name;

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={name}
				initial={variants.initial}
				animate={variants.animate}
				exit={variants.exit}
				transition={variants.transition}
				className="mx-auto text-center"
				style={{
					fontFamily,
					fontSize: `${fontSize}px`,
					lineHeight: 1.2,
					fontWeight: isBold ? "bold" : "normal",
					color: nameColor,
					maxWidth: "90vw",
					whiteSpace: "normal",
					overflowWrap: "anywhere",
					wordBreak: "break-word",
				}}
			>
				{textToDisplay}
				{animationType === "typewriter" &&
					displayedText.length < name.length && (
						<span className="animate-pulse">|</span>
					)}
			</motion.div>
		</AnimatePresence>
	);
}
