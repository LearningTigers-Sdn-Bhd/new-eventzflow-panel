"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState } from "react";

interface ColorfulGiftBoxProps {
	isOpen: boolean;
	isAnimating: boolean;
}

const WORDS = ["BOOM!", "WOW!", "LUCKY!", "WINNER!", "YAY!", "JACKPOT!"];

type ConfettiType = "star" | "circle" | "triangle" | "ribbon" | "gift";

interface ConfettiPiece {
	id: number;
	endX: number;
	endY: number;
	rotation: number;
	size: number;
	delay: number;
	type: ConfettiType;
}

const generateConfetti = (): ConfettiPiece[] => {
	const pieces: ConfettiPiece[] = [];
	const types: ConfettiType[] = ["star", "circle", "triangle", "ribbon", "gift", "star", "circle", "star"];
	
	for (let i = 0; i < 18; i++) {
		const angle = (i / 18) * Math.PI * 1.4 - Math.PI * 1.2; // Arc spread upward
		const distance = 100 + Math.random() * 120;
		pieces.push({
			id: i,
			endX: Math.cos(angle) * distance * (0.7 + Math.random() * 0.6),
			endY: Math.sin(angle) * distance - 30,
			rotation: Math.random() * 720 - 360,
			size: types[i % types.length] === "gift" ? 26 : 14 + Math.random() * 10,
			delay: Math.random() * 0.12,
			type: types[i % types.length],
		});
	}
	return pieces;
};

export function ColorfulGiftBox({ isOpen, isAnimating }: ColorfulGiftBoxProps) {
	const [displayWord, setDisplayWord] = useState(WORDS[0]);
	const [isShuffling, setIsShuffling] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsShuffling(true);
			let count = 0;
			const maxShuffles = 10;
			const interval = setInterval(() => {
				setDisplayWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
				count++;
				if (count >= maxShuffles) {
					clearInterval(interval);
					setIsShuffling(false);
					setDisplayWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
				}
			}, 70);
			return () => clearInterval(interval);
		}
	}, [isOpen]);

	const confetti = useMemo(() => generateConfetti(), []);

	return (
		<motion.div
			className="relative flex items-center justify-center"
			style={{ width: 320, height: 400 }}
			animate={
				isAnimating
					? {
							rotate: [0, -4, 4, -4, 4, 0, 0, 0, 0],
							x: [0, -3, 3, -3, 3, 0, 0, 0, 0],
							y: [0, 1, -1, 1, -1, -20, 0, -4, 0],
							scaleY: [1, 0.98, 1.02, 0.98, 1.02, 1.1, 0.9, 1.02, 1],
							scaleX: [1, 1.02, 0.98, 1.02, 0.98, 0.92, 1.1, 0.98, 1],
						}
					: { rotate: 0, x: 0, y: 0, scaleY: 1, scaleX: 1 }
			}
			transition={{
				duration: isAnimating ? 1.2 : 0.4,
				times: isAnimating ? [0, 0.1, 0.2, 0.3, 0.4, 0.55, 0.7, 0.85, 1] : undefined,
				repeat: isAnimating ? Number.POSITIVE_INFINITY : 0,
				ease: isAnimating ? "easeInOut" : "easeOut",
			}}
		>
			{/* Burst glow effect */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						className="pointer-events-none absolute rounded-full"
						style={{ 
							top: 120, 
							left: "50%", 
							width: 150, 
							height: 150,
							background: "radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%)",
							zIndex: 8,
						}}
						initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
						animate={{ scale: [0, 2, 2.5], opacity: [0, 0.8, 0] }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
					/>
				)}
			</AnimatePresence>

			{/* Confetti Layer */}
			<AnimatePresence>
				{isOpen && (
					<div className="pointer-events-none absolute" style={{ top: 130, left: 160, zIndex: 50 }}>
						{confetti.map((piece) => (
							<motion.div
								key={piece.id}
								className="absolute"
								initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
								animate={{ 
									x: piece.endX,
									y: piece.endY,
									scale: [0, 1.3, 1],
									opacity: [0, 1, 1, 0.9],
									rotate: piece.rotation,
								}}
								exit={{ opacity: 0, scale: 0 }}
								transition={{ 
									duration: 1.3,
									delay: piece.delay,
									ease: [0.2, 0.8, 0.2, 1],
								}}
								style={{ 
									width: piece.size, 
									height: piece.size,
									marginLeft: -piece.size / 2,
									marginTop: -piece.size / 2,
								}}
							>
								{piece.type === "star" && (
									<svg viewBox="0 0 24 24" fill="#FFD700" className="h-full w-full drop-shadow-sm">
										<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
									</svg>
								)}
								{piece.type === "circle" && (
									<div className="h-full w-full rounded-full bg-[#FFD700] shadow-sm" />
								)}
								{piece.type === "triangle" && (
									<svg viewBox="0 0 24 24" fill="#FFD700" className="h-full w-full drop-shadow-sm">
										<path d="M12 4L22 20H2L12 4z" />
									</svg>
								)}
								{piece.type === "ribbon" && (
									<svg viewBox="0 0 24 28" fill="#C41E3A" className="h-full w-full drop-shadow-sm">
										<path d="M4 0c0 5 3 8 3 14s-3 8-3 14c3-3 5-3 8 0 0-6 3-9 3-14s-3-9-3-14c-3 3-5 3-8 0z" />
									</svg>
								)}
								{piece.type === "gift" && (
									<svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-sm">
										<rect x="2" y="9" width="20" height="13" fill="white" />
										<rect x="10" y="9" width="4" height="13" fill="#C41E3A" />
										<rect x="1" y="6" width="22" height="5" fill="white" />
										<rect x="10" y="6" width="4" height="5" fill="#C41E3A" />
									</svg>
								)}
							</motion.div>
						))}
					</div>
				)}
			</AnimatePresence>

			{/* Word - pops up with bounce and slight rotation */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						className="pointer-events-none absolute"
						style={{ top: 90, left: "50%", zIndex: 10 }}
						initial={{ x: "-50%", y: 40, scale: 0, opacity: 0, rotate: -5 }}
						animate={{ 
							x: "-50%",
							y: 0,
							scale: isShuffling ? [1, 1.15, 1] : [1, 1.05, 1],
							opacity: 1,
							rotate: isShuffling ? [-3, 3, -3] : 0,
						}}
						exit={{ opacity: 0, scale: 0.5, y: 20 }}
						transition={{ 
							duration: 0.5, 
							ease: [0.34, 1.56, 0.64, 1],
							scale: { 
								duration: isShuffling ? 0.15 : 2,
								repeat: isShuffling ? Number.POSITIVE_INFINITY : Number.POSITIVE_INFINITY,
								repeatType: "reverse",
							},
							rotate: {
								duration: 0.1,
								repeat: isShuffling ? Number.POSITIVE_INFINITY : 0,
							}
						}}
					>
						<span 
							className="select-none whitespace-nowrap font-black text-4xl tracking-wide"
							style={{ 
								color: "#FFD700",
								textShadow: `
									2px 2px 0 #B71C1C, 
									-2px -2px 0 #B71C1C, 
									2px -2px 0 #B71C1C, 
									-2px 2px 0 #B71C1C,
									0 4px 8px rgba(0,0,0,0.2)
								`,
							}}
						>
							{displayWord}
						</span>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Suspense Element - Question Mark */}
			<AnimatePresence>
				{isAnimating && !isOpen && (
					<motion.div
						className="pointer-events-none absolute select-none font-black"
						style={{ 
							top: 175, 
							left: "50%", 
							x: "-50%",
							zIndex: 40,
							color: "#FFD700",
							fontSize: "5rem",
							lineHeight: 1,
							textShadow: "0 2px 0 #B71C1C, 0 4px 12px rgba(0,0,0,0.3)"
						}}
						initial={{ opacity: 0, scale: 0.5 }}
						animate={{ 
							opacity: 1, 
							scale: [1, 1.2, 1],
							rotate: [0, -10, 10, 0]
						}}
						exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
						transition={{ 
							duration: 0.8, 
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut"
						}}
					>
						?
					</motion.div>
				)}
			</AnimatePresence>

			{/* Lid + Bow */}
			<motion.div
				className="absolute"
				style={{ top: 60, left: 0, zIndex: 20 }}
				animate={{ y: isOpen ? -80 : 0 }}
				transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
			>
				{/* Bow */}
				<svg width="320" height="80" viewBox="0 0 320 80" className="-top-10 absolute left-0">
					{/* Gold Bow */}
					<ellipse cx="120" cy="40" rx="32" ry="34" fill="#FFC107" />
					<ellipse cx="200" cy="40" rx="32" ry="34" fill="#FFC107" />
					<ellipse cx="160" cy="50" rx="20" ry="22" fill="#FFA000" />
				</svg>
				{/* Lid - Red box with Gold ribbon */}
				<svg width="320" height="55" viewBox="0 0 320 55" className="relative" style={{ top: 30 }}>
					<rect x="20" y="0" width="280" height="55" fill="#EF5350" />
					<rect x="130" y="0" width="60" height="55" fill="#FFD54F" />
				</svg>
			</motion.div>

			{/* Box Body - rounded only at bottom */}
			<div className="absolute" style={{ top: 145, left: 0, zIndex: 5 }}>
				<svg width="320" height="180" viewBox="0 0 320 180">
					<path 
						d="M30 0 H290 V166 Q290 170 286 170 H34 Q30 170 30 166 Z" 
						fill="#D32F2F" 
					/>
					<rect x="130" y="0" width="60" height="170" fill="#FFD54F" />
				</svg>
			</div>

			{/* Shadow */}
			<motion.div
				className="absolute rounded-full bg-black/15 blur-xl"
				style={{ bottom: 15, left: "50%", width: 200, height: 24, x: "-50%" }}
				animate={{
					scaleX: isOpen ? 1.1 : 1,
					opacity: isOpen ? 0.1 : 0.15,
				}}
				transition={{ duration: 0.4 }}
			/>
		</motion.div>
	);
}
