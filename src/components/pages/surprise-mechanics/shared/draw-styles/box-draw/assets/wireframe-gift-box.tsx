"use client";

import { AnimatePresence, motion } from "framer-motion";

interface WireframeGiftBoxProps {
	isOpen: boolean;
	isAnimating: boolean;
}

export function WireframeGiftBox({
	isOpen,
	isAnimating,
}: WireframeGiftBoxProps) {
	// Isometric Projection Coordinates
	// Center: 200, 250
	// Width: 160, Height: 120 (approx)

	// Base Vertices
	const backBottom = { x: 200, y: 320 };
	const frontBottom = { x: 200, y: 380 }; // This is actually the lowest point, maybe too low.

	// Let's define a standard isometric cube
	// Front Face: (100, 150) -> (300, 150) -> (300, 350) -> (100, 350) -- No, that's flat.

	// ISO Vertices:
	// A: Top-Back (Center)
	// B: Top-Right
	// C: Bottom-Right
	// D: Bottom-Center (Front)
	// E: Bottom-Left
	// F: Top-Left
	// G: Center (Front-Top corner)

	// Adjusting for "Box" shape (wider than tall)
	const startX = 200;
	const startY = 300;
	const w = 90; // width spread
	const h = 50; // height spread (perspective)
	const boxH = 140; // vertical height

	// Points
	const centerBottom = { x: startX, y: startY };
	const rightBottom = { x: startX + w, y: startY - h };
	const backBottomPt = { x: startX, y: startY - 2 * h }; // Furthest back point
	const leftBottom = { x: startX - w, y: startY - h };

	const centerTop = { x: startX, y: startY - boxH };
	const rightTop = { x: startX + w, y: startY - h - boxH };
	const backTop = { x: startX, y: startY - 2 * h - boxH };
	const leftTop = { x: startX - w, y: startY - h - boxH };

	return (
		<div className="relative flex h-[500px] w-[400px] items-center justify-center">
			{/* Shake Animation Container */}
			<motion.div
				className="relative"
				style={{ transformOrigin: "50% 100%" }}
				animate={
					isAnimating
						? {
								y: [0, -25, 0], // Big Jump
								scaleY: [1, 1.05, 0.9, 1], // Stretch -> Squash -> Normal
								scaleX: [1, 0.95, 1.05, 1], // Narrow -> Wide -> Normal
								rotate: 0,
							}
						: { y: 0, scaleY: 1, scaleX: 1, rotate: 0 }
				}
				transition={{
					duration: 0.6,
					repeat: isAnimating ? Number.POSITIVE_INFINITY : 0,
					ease: "easeInOut",
					times: [0, 0.4, 0.8, 1],
				}}
			>
				<svg
					width="400"
					height="400"
					viewBox="0 0 400 400"
					className="overflow-visible"
				>
					<defs>
						<pattern
							id="grid"
							width="20"
							height="20"
							patternUnits="userSpaceOnUse"
						>
							<path
								d="M 20 0 L 0 0 0 20"
								fill="none"
								stroke="#e2e8f0"
								strokeWidth="1"
							/>
						</pattern>
					</defs>

					{/* --- INSIDE / BACK WIRES (Dashed) --- */}
					{/* Back Vertical Line */}
					<path
						d={`M${backBottomPt.x} ${backBottomPt.y} L${backTop.x} ${backTop.y}`}
						stroke="#94a3b8"
						strokeWidth="2"
						strokeDasharray="5,5"
					/>
					{/* Bottom Back-Right edge */}
					<path
						d={`M${backBottomPt.x} ${backBottomPt.y} L${rightBottom.x} ${rightBottom.y}`}
						stroke="#94a3b8"
						strokeWidth="2"
						strokeDasharray="5,5"
					/>
					{/* Bottom Back-Left edge */}
					<path
						d={`M${backBottomPt.x} ${backBottomPt.y} L${leftBottom.x} ${leftBottom.y}`}
						stroke="#94a3b8"
						strokeWidth="2"
						strokeDasharray="5,5"
					/>

					{/* --- TOP OPENING RIM (Back Edges) --- */}
					<path
						d={`M${leftTop.x} ${leftTop.y} L${backTop.x} ${backTop.y} L${rightTop.x} ${rightTop.y}`}
						fill="none"
						stroke="#334155"
						strokeWidth="2"
					/>

					{/* --- EXPLODED VIEW GUIDE LINE --- */}
					{isOpen && (
						<motion.path
							initial={{ pathLength: 0, opacity: 0 }}
							animate={{ pathLength: 1, opacity: 1 }}
							transition={{ duration: 0.5 }}
							d={`M${centerTop.x} ${centerTop.y} L${centerTop.x} ${centerTop.y - 60}`}
							stroke="#94a3b8"
							strokeWidth="1"
							strokeDasharray="4,4"
						/>
					)}

					{/* --- QUESTION MARK (Floating Inside -> Pop Out) --- */}
					<motion.text
						key="q-mark"
						x="200"
						textAnchor="middle"
						dominantBaseline="middle"
						className="fill-slate-600 font-black text-8xl"
						style={{ fontFamily: "monospace", pointerEvents: "none" }}
						initial={{ y: 230, scale: 1, rotate: 0 }}
						animate={{
							y: isOpen ? 80 : [225, 235, 225], // Pop Up vs Floating Loop
							scale: isOpen ? 1.5 : 1,
							rotate: isOpen ? [0, -10, 10, 0] : [0, -2, 2, 0], // Shake vs Gentle Wobble
						}}
						transition={
							isOpen
								? {
										y: { type: "spring", bounce: 0.5, duration: 0.8 },
										scale: { type: "spring", bounce: 0.5, duration: 0.8 },
										rotate: { duration: 0.4, type: "tween", ease: "easeInOut" },
									}
								: {
										duration: 2.5,
										repeat: Number.POSITIVE_INFINITY,
										ease: "easeInOut",
									}
						}
					>
						?
					</motion.text>

					{/* --- CONFETTI (Simple Burst Upwards) --- */}
					<AnimatePresence>
						{isOpen && (
							<>
								{[...Array(50)].map((_, i) => {
									const type = ["star", "circle", "triangle", "ribbon"][i % 4];
									const color = [
										"#FFD700",
										"#FF4081",
										"#00E676",
										"#2979FF",
										"#FF9100",
									][i % 5];

									// Simple "Explosion" physics: Start center, shoot OUT and UP
									// x: Wide scatter (-300 to +300 relative to center)
									// y: Shoot UP (-100 to -300 pixels from start)
									const endX = 200 + (Math.random() - 0.5) * 600;
									const endY = 150 - (100 + Math.random() * 200);

									const animProps = {
										x: endX,
										y: endY,
										rotate: Math.random() * 360,
										opacity: [0, 1, 1, 0], // Fade in, hold, fade out
										scale: [0, 1.2, 0.5], // Puff up then shrink
									};

									const transProps = {
										duration: 1.2 + Math.random(),
										ease: "easeOut" as const,
									};
									const initialProps = {
										x: 200,
										y: 150,
										scale: 0,
										opacity: 0,
										rotate: 0,
									};

									return (
										<motion.g
											key={i}
											initial={initialProps}
											animate={animProps}
											transition={transProps}
										>
											{type === "star" && (
												<path
													d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
													fill={color}
													transform="scale(0.6)"
												/>
											)}
											{type === "circle" && <circle r={5} fill={color} />}
											{type === "triangle" && (
												<polygon points="0,12 6,0 12,12" fill={color} />
											)}
											{type === "ribbon" && (
												<path
													d="M4 0c0 5 3 8 3 14s-3 8-3 14c3-3 5-3 8 0 0-6 3-9 3-14s-3-9-3-14c-3 3-5 3-8 0z"
													fill={color}
													transform="scale(0.5)"
												/>
											)}
										</motion.g>
									);
								})}
							</>
						)}
					</AnimatePresence>

					{/* --- FRONT FACES (Solid) --- */}
					{/* Left Face - Made more transparent */}
					<path
						d={`M${centerBottom.x} ${centerBottom.y} L${leftBottom.x} ${leftBottom.y} L${leftTop.x} ${leftTop.y} L${centerTop.x} ${centerTop.y} Z`}
						fill="rgba(255, 255, 255, 0.4)"
						stroke="#334155"
						strokeWidth="2"
					/>
					{/* Right Face */}
					<path
						d={`M${centerBottom.x} ${centerBottom.y} L${rightBottom.x} ${rightBottom.y} L${rightTop.x} ${rightTop.y} L${centerTop.x} ${centerTop.y} Z`}
						fill="rgba(255, 255, 255, 0.4)"
						stroke="#334155"
						strokeWidth="2"
					/>

					{/* --- LID (Exploded View Animation) --- */}
					<motion.g
						animate={{
							y: isOpen ? -60 : 0, // Lift straight up
							opacity: isOpen ? 0.4 : 1,
						}}
						transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
					>
						{/* Lid Top Face */}
						<path
							d={`M${centerTop.x} ${centerTop.y} L${rightTop.x} ${rightTop.y} L${backTop.x} ${backTop.y} L${leftTop.x} ${leftTop.y} Z`}
							fill="#f8fafc"
							stroke="#334155"
							strokeWidth="2"
						/>
						{/* Lid Rims (Thickness) */}
						{/* Right Rim */}
						<path
							d={`M${centerTop.x} ${centerTop.y} L${rightTop.x} ${rightTop.y} L${rightTop.x} ${rightTop.y + 10} L${centerTop.x} ${centerTop.y + 10} Z`}
							fill="#cbd5e1"
							stroke="#334155"
							strokeWidth="2"
						/>
						{/* Left Rim */}
						<path
							d={`M${centerTop.x} ${centerTop.y} L${leftTop.x} ${leftTop.y} L${leftTop.x} ${leftTop.y + 10} L${centerTop.x} ${centerTop.y + 10} Z`}
							fill="#e2e8f0"
							stroke="#334155"
							strokeWidth="2"
						/>
					</motion.g>
				</svg>
			</motion.div>
		</div>
	);
}
