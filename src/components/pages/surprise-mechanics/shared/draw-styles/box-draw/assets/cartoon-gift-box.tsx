"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState } from "react";

interface CartoonGiftBoxProps {
	isOpen: boolean;
	isAnimating: boolean;
}

const COMIC_WORDS = ["BOOM!", "WOW!", "WINNER!", "JACKPOT!", "YAY!", "YES!"];

export function CartoonGiftBox({ isOpen, isAnimating }: CartoonGiftBoxProps) {
	const [word, setWord] = useState("");
	
	// Pick a new word every time the box opens
	useEffect(() => {
		if (isOpen) {
			setWord(COMIC_WORDS[Math.floor(Math.random() * COMIC_WORDS.length)]);
		}
	}, [isOpen]);

	return (
		<div className="relative flex h-[550px] w-[400px] items-center justify-center">
			{/* Shared SVG Defs for Comic Patterns */}
			<svg width="0" height="0" className="absolute">
				<defs>
					<pattern id="comic-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
						<circle cx="2" cy="2" r="1.5" fill="black" opacity="0.1" />
					</pattern>
					<mask id="dots-mask">
						<rect x="0" y="0" width="100%" height="100%" fill="white" />
						<rect x="0" y="0" width="100%" height="100%" fill="url(#comic-dots)" />
					</mask>
				</defs>
			</svg>

			{/* Motion Container for the Box */}
			<motion.div
				className="relative z-10 origin-bottom"
				animate={
					isAnimating
						? {
								rotate: [0, -3, 3, -5, 5, 0],
								y: [0, 0, 0, 0, -15, 0],
								scaleY: [1, 1, 1, 0.92, 1.08, 1],
								scaleX: [1, 1, 1, 1.04, 0.96, 1],
						  }
						: { rotate: 0, y: 0, scaleY: 1, scaleX: 1 }
				}
				transition={{
					duration: 0.8,
					repeat: isAnimating ? Number.POSITIVE_INFINITY : 0,
					ease: "easeInOut",
					times: [0, 0.2, 0.4, 0.6, 0.8, 1]
				}}
			>
				{/* Lid Layer - Rectangular & Boxy */}
				<motion.div
					className="absolute left-0 z-20 w-full origin-center"
					style={{ top: -35, left: 0 }}
					animate={{
						y: isOpen ? -180 : 0,
						rotate: isOpen ? -20 : 0,
						x: isOpen ? -40 : 0,
					}}
					transition={{ duration: 0.4, type: "spring", stiffness: 120, damping: 15 }}
				>
					<svg width="400" height="140" viewBox="0 0 400 140" className="overflow-visible">
						{/* Bow */}
						<path
							d="M200 50 C200 50 150 -10 120 30 C100 55 130 80 200 65 C270 80 300 55 280 30 C250 -10 200 50 200 50"
							fill="#FFEB3B"
							stroke="black"
							strokeWidth="5"
						/>
						<circle cx="200" cy="65" r="22" fill="#FFC107" stroke="black" strokeWidth="5" />
						
						{/* Lid Shape - Rectangle (Narrower Overhang) */}
						<rect x="50" y="50" width="300" height="70" fill="#00BCD4" stroke="black" strokeWidth="5" />
						
						{/* Lid Highlight */}
						<rect x="70" y="60" width="260" height="20" fill="white" opacity="0.3" />

						{/* Ribbon on Lid - Aligned with Body */}
						<rect x="185" y="50" width="30" height="70" fill="#FFEB3B" stroke="black" strokeWidth="5" />
					</svg>
				</motion.div>

				{/* Box Body Layer - Straight Rectangle */}
				<div className="relative top-[20px] left-[15px] z-10">
					<svg width="370" height="260" viewBox="0 0 370 260" className="overflow-visible">
						{/* Main Body - Masked for dots */}
						<mask id="body-mask">
							<rect x="50" y="0" width="270" height="240" fill="white" />
						</mask>

						{/* Main Body Shape */}
						<rect 
							x="50" y="0" width="270" height="240" 
							fill="#26C6DA" 
							stroke="black" 
							strokeWidth="5" 
							filter="url(#body-shadow)"
						/>
						
						{/* Halftone Dot Overlay */}
						<rect x="0" y="0" width="370" height="260" fill="url(#comic-dots)" className="pointer-events-none opacity-20 mix-blend-multiply" mask="url(#body-mask)" />

						{/* Ribbon on Body - Aligned with Lid */}
						<rect x="170" y="0" width="30" height="240" fill="#FFEB3B" stroke="black" strokeWidth="5" />
						
						{/* Side Highlight (Straight bar) */}
						<rect x="70" y="20" width="20" height="200" fill="white" opacity="0.4" />
					</svg>

					{/* Reveal Word - Pops out when open */}
					<AnimatePresence>
						{isOpen && (
							<motion.div
								className="-translate-x-1/2 absolute top-[100px] left-[185px] z-0"
								style={{ rotate: -5 }}
								initial={{ scale: 0, opacity: 0 }}
								animate={{ 
									scale: 1, 
									opacity: 1,
									rotate: [-5, 5, -5, 5],
								}}
								transition={{ 
									type: "spring",
									duration: 0.6,
									rotate: { repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }
								}}
							>
								{/* Jagged Burst Background */}
								<svg width="280" height="220" viewBox="0 0 200 200" className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2">
									<path 
										d="M100 10 L120 60 L170 50 L140 90 L190 120 L140 140 L160 190 L110 160 L90 200 L70 150 L20 180 L50 130 L10 100 L60 80 L30 30 L80 50 Z" 
										fill="#FFFFFF" 
										stroke="black" 
										strokeWidth="4"
									/>
								</svg>
								<div 
									className="relative min-w-[200px] text-center font-black text-5xl text-[#D50000] italic leading-tight"
									style={{ 
										fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', sans-serif",
										textShadow: "2px 2px 0px #000",
										WebkitTextStroke: "1.5px black",
									}}
								>
									{word}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</motion.div>

			{/* Explosion Effects behind */}
			<AnimatePresence>
				{isOpen && (
					<motion.div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
						{/* Comic Burst Background */}
						<motion.svg
							viewBox="0 0 500 500"
							className="absolute h-[700px] w-[700px]"
							initial={{ scale: 0, opacity: 0, rotate: -45 }}
							animate={{ scale: 1, opacity: 1, rotate: 0 }}
							exit={{ opacity: 0 }}
						>
							<path
								d="M250 50 L280 180 L400 150 L320 250 L450 350 L300 320 L250 450 L200 320 L50 350 L180 250 L100 150 L220 180 Z"
								fill="#FFEB3B"
								stroke="black"
								strokeWidth="5"
							/>
							<path
								d="M250 80 L270 190 L370 170 L300 250 L400 330 L280 300 L250 400 L220 300 L100 330 L200 250 L130 170 L230 190 Z"
								fill="#FF4081"
								stroke="black"
								strokeWidth="3"
								transform="rotate(22.5 250 250)"
								opacity="0.7"
							/>
						</motion.svg>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
