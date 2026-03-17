import { useEffect, useRef } from "react";
import type { Wish } from "@/lib/api/wishes";
import { AnimatedWishNode } from "./animated-wish-node";
import { getGlobeTargets } from "./shape-layout";
import { getShapePathPoints } from "./shape-maps";
import {
	buildTransitionSnapshot,
	GLOBE_INTRO_DURATION_MS,
	SHAPE_SETTLE_DURATION_MS,
} from "./transition-motion";
import type { NormalizedWallSettings } from "./wall-settings";

type AnimatedWallRendererProps = {
	wishes: Wish[];
	settings: NormalizedWallSettings;
	preview?: boolean;
};

const TARGET_FORMATION_DENSITY = 150;

// Seconds for one full clockwise lap around the shape — slow, water-like flow
const LOOP_DURATION_S = 90;
const SPOTLIGHT_DURATION_MS = 5000;

function smoothstep(value: number) {
	if (value <= 0) return 0;
	if (value >= 1) return 1;
	return value * value * (3 - 2 * value);
}

const PLACEHOLDER_BLESSINGS = [
	"Blessing",
	"Love",
	"Forever",
	"Joy",
	"Unity",
	"Bliss",
	"Always",
	"Happiness",
	"Promise",
	"Harmony",
	"Eternity",
	"Devotion",
	"Tenderness",
	"Cherished",
	"Together",
	"Laughter",
	"Hearts",
	"Sacred",
	"Beloved",
	"Vows",
];

export function AnimatedWallRenderer({
	wishes,
	settings,
	preview = false,
}: AnimatedWallRendererProps) {
	const normalized = settings;

	// DOM refs for each node — the rAF loop writes directly to these
	const nodeRefs = useRef<Array<HTMLDivElement | null>>(
		Array(TARGET_FORMATION_DENSITY).fill(null),
	);
	const rafRef = useRef<number | null>(null);
	const introStartRef = useRef(0);

	// Spotlight state
	const lastWishesCountRef = useRef(wishes.length);
	const spotlightWishRef = useRef<Wish | null>(null);
	const spotlightStartRef = useRef(0);

	// The pre-computed arc-length-sampled path for the current shape
	const shapePath = useRef<Array<{ x: number; y: number }>>(
		getShapePathPoints(normalized.shape, null),
	);

	// Recompute path when shape changes
	useEffect(() => {
		shapePath.current = getShapePathPoints(normalized.shape, null);
	}, [normalized.shape]);

	// Restart the intro when content or destination changes
	useEffect(() => {
		const prevCount = lastWishesCountRef.current;
		const currentCount = wishes.length;

		if (currentCount > prevCount && prevCount > 0) {
			// A new wish was added! Trigger spotlight
			// mergeIncomingWish prepends the new wish at index 0
			spotlightWishRef.current = wishes[0] ?? null;
			spotlightStartRef.current = performance.now();
		} else {
			// Just a normal reset (or first load)
			introStartRef.current = 0;
			spotlightWishRef.current = null;
			spotlightStartRef.current = 0;
		}

		lastWishesCountRef.current = currentCount;
	}, [wishes]);

	const bodyRef = useRef<HTMLDivElement | null>(null);

	// Spotlight overlay refs — driven directly from the rAF loop
	const spotlightOverlayRef = useRef<HTMLDivElement | null>(null);
	const spotlightNameRef = useRef<HTMLSpanElement | null>(null);
	const spotlightMessageRef = useRef<HTMLParagraphElement | null>(null);

	// rAF loop owns the full intro and shape animation lifecycle.
	useEffect(() => {
		function tick(now: number) {
			const spotlightElapsed =
				spotlightStartRef.current > 0 ? now - spotlightStartRef.current : 0;

			// When the spotlight fully ends, reset the globe → shape intro so the new
			// name joins the crowd in a fresh globe spin before settling into the shape.
			// This must run BEFORE the introStart guard so introStartRef stays 0 for
			// one full tick, causing the next tick to stamp the new start time.
			if (
				spotlightWishRef.current !== null &&
				spotlightElapsed >= SPOTLIGHT_DURATION_MS
			) {
				spotlightWishRef.current = null;
				spotlightStartRef.current = 0;
				introStartRef.current = 0; // cleared here; next tick will stamp it to `now`
			}

			if (introStartRef.current === 0) {
				introStartRef.current = now;
			}

			const isSpotlightActive =
				spotlightWishRef.current && spotlightElapsed < SPOTLIGHT_DURATION_MS;

			// Sequential spotlight factors
			let globeOpacityFactor = 1; // 1 = visible, 0 = hidden
			let cardOpacityFactor = 0; // 0 = hidden, 1 = visible

			if (isSpotlightActive) {
				const fadeTime = 600;
				const cardDelay = 400;

				// Globe fades out first
				if (spotlightElapsed < fadeTime) {
					globeOpacityFactor = 1 - smoothstep(spotlightElapsed / fadeTime);
				} else if (spotlightElapsed > SPOTLIGHT_DURATION_MS - fadeTime) {
					globeOpacityFactor = smoothstep(
						(SPOTLIGHT_DURATION_MS - spotlightElapsed) / fadeTime,
					);
				} else {
					globeOpacityFactor = 0;
				}

				// Card fades in with delay
				if (spotlightElapsed < cardDelay) {
					cardOpacityFactor = 0;
				} else if (spotlightElapsed < cardDelay + fadeTime) {
					cardOpacityFactor = smoothstep(
						(spotlightElapsed - cardDelay) / fadeTime,
					);
				} else if (
					spotlightElapsed >
					SPOTLIGHT_DURATION_MS - fadeTime - cardDelay
				) {
					cardOpacityFactor = smoothstep(
						(SPOTLIGHT_DURATION_MS - spotlightElapsed - cardDelay) / fadeTime,
					);
				} else {
					cardOpacityFactor = 1;
				}
			}

			// Drive the spotlight overlay
			if (spotlightOverlayRef.current) {
				const wish = spotlightWishRef.current;
				if (wish) {
					if (spotlightNameRef.current)
						spotlightNameRef.current.textContent = wish.guest_name;
					if (spotlightMessageRef.current)
						spotlightMessageRef.current.textContent = wish.message;
				}
				spotlightOverlayRef.current.style.opacity = `${cardOpacityFactor}`;
				spotlightOverlayRef.current.style.pointerEvents = isSpotlightActive
					? "auto"
					: "none";
			}

			const elapsedMs = now - introStartRef.current;
			const elapsed = elapsedMs / 1000;
			const path = shapePath.current;
			const pathLen = path.length;
			const count = TARGET_FORMATION_DENSITY;
			const shape = normalized.shape;
			const globeTargets = getGlobeTargets(count, elapsed * 0.7);
			const transitionProgress = Math.min(
				1,
				Math.max(0, elapsedMs - GLOBE_INTRO_DURATION_MS) /
					SHAPE_SETTLE_DURATION_MS,
			);
			const flowBlend = smoothstep((transitionProgress - 0.72) / 0.28);
			const loopElapsedMs = Math.max(
				0,
				elapsedMs - GLOBE_INTRO_DURATION_MS - SHAPE_SETTLE_DURATION_MS,
			);

			// For butterfly, names stay stationary (offset = 0) so they flap with the wings
			// For other shapes, names flow like water after the settle completes
			const isButterfly = shape === "butterfly";
			const offset = isButterfly
				? 0
				: ((loopElapsedMs / 1000 / LOOP_DURATION_S) * pathLen) % pathLen;

			const nodes = nodeRefs.current;

			// Handle butterfly body animation
			if (isButterfly && bodyRef.current) {
				const flap = Math.sin(elapsed * 6);
				const flapFactor = 0.5 + 0.5 * Math.abs(flap);
				// Preserve centering translation while pulsing body width with wings
				bodyRef.current.style.transform = `translateX(-50%) translateY(-62%) scaleX(${1.0 + 0.1 * flapFactor})`;
				bodyRef.current.style.opacity = `${transitionProgress * globeOpacityFactor}`;
			} else if (bodyRef.current) {
				bodyRef.current.style.opacity = "0";
			}

			for (let i = 0; i < count; i++) {
				const el = nodes[i];
				if (!el) continue;
				const globeTarget = globeTargets[i] ?? { x: 50, y: 50, z: 0 };
				const staticIdx = Math.floor((i / count) * pathLen) % pathLen;
				const staticShapeTarget = path[staticIdx] ?? { x: 50, y: 50 };

				const rawIdx =
					((((i / count) * pathLen + offset) % pathLen) + pathLen) % pathLen;
				const idxA = Math.floor(rawIdx) % pathLen;
				const idxB = (idxA + 1) % pathLen;
				const frac = rawIdx - Math.floor(rawIdx);
				const ptA = path[idxA];
				const ptB = path[idxB];
				const flowingShapeTarget = {
					x: ptA.x + (ptB.x - ptA.x) * frac,
					y: ptA.y + (ptB.y - ptA.y) * frac,
				};
				const shapeTarget = {
					x:
						staticShapeTarget.x +
						(flowingShapeTarget.x - staticShapeTarget.x) * flowBlend,
					y:
						staticShapeTarget.y +
						(flowingShapeTarget.y - staticShapeTarget.y) * flowBlend,
				};
				const snapshot = buildTransitionSnapshot({
					elapsedMs,
					globeTarget,
					shapeTarget,
					index: i,
				});

				let x = snapshot.x;
				let y = snapshot.y;
				let scale = snapshot.scale;
				let opacity = snapshot.opacity;
				let blurValue = Math.max(
					0,
					(0.1 - snapshot.depth) * (1 - snapshot.progress) * 2.8,
				);

				// --- Dynamic Shape Deformations (Animations) ---
				if (isButterfly) {
					// Flapping: scale X relative to center 50
					const flap = Math.sin(elapsed * 6); // Slightly slower, more graceful flap
					const dx = x - 50;
					// Wings fold inward (scale X) and lift slightly (y)
					const flapFactor =
						1 - (1 - (0.5 + 0.5 * Math.abs(flap))) * snapshot.progress;
					x = 50 + dx * flapFactor;
					// Parabolic lift: wings lift more at the tips
					y = y - Math.abs(dx) * 0.15 * (1 - flapFactor) * snapshot.progress;
				} else if (shape === "heart") {
					// Heartbeat pulse
					const pulse =
						1 + 0.04 * Math.sin(elapsed * 3) ** 4 * snapshot.progress;
					x = 50 + (x - 50) * pulse;
					y = 46 + (y - 46) * pulse;
				}

				// --- Spotlight override ---
				if (isSpotlightActive) {
					// Everyone recedes and fades out completely based on globeOpacityFactor
					const bgGlobe = globeTargets[i] ?? { x: 50, y: 50, z: 0 };
					x = x + (bgGlobe.x - x) * (1 - globeOpacityFactor);
					y = y + (bgGlobe.y - y) * (1 - globeOpacityFactor);
					scale = scale * (0.8 + 0.2 * globeOpacityFactor);
					opacity = opacity * globeOpacityFactor;
					blurValue = blurValue + 3 * (1 - globeOpacityFactor);
				}

				el.style.left = `${x}%`;
				el.style.top = `${y}%`;
				el.style.opacity = `${opacity}`;
				el.style.transform = `translate(-50%, -50%) scale(${scale})`;
				el.style.zIndex = isSpotlightActive
					? "5"
					: `${10 + Math.round((snapshot.depth + 1) * 10)}`;
				el.style.filter =
					blurValue > 0 ? `blur(${blurValue.toFixed(2)}px)` : "none";
			}

			rafRef.current = requestAnimationFrame(tick);
		}

		rafRef.current = requestAnimationFrame(tick);
		return () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
		};
	}, [normalized.shape]);

	const globeTargets = getGlobeTargets(TARGET_FORMATION_DENSITY);
	const accentTintStyle = {
		backgroundColor: `${normalized.style.accentColor}1F`,
	};
	const previewStageStyle = preview
		? {
				backgroundColor: `${normalized.style.cardBackgroundColor}1A`,
				borderColor: `${normalized.style.accentColor}40`,
			}
		: undefined;
	const spotlightCardStyle = {
		background:
			"linear-gradient(180deg, rgba(255, 248, 240, 0.92) 0%, rgba(255, 252, 247, 0.98) 100%)",
		borderColor: `${normalized.style.accentColor}40`,
		color: "#2F241F",
		backdropFilter: "blur(16px)",
	};
	const spotlightAccentStyle = {
		color: normalized.style.accentColor,
	};
	const spotlightLineStyle = {
		backgroundColor: `${normalized.style.accentColor}80`,
	};
	const spotlightDiamondStyle = {
		borderColor: normalized.style.accentColor,
		backgroundColor: `${normalized.style.accentColor}26`,
	};
	const spotlightLeafStyle = {
		fill: `${normalized.style.accentColor}33`,
	};
	const spotlightBerryStyle = {
		fill: normalized.style.accentColor,
	};
	const nodeTextColor = normalized.style.accentColor;
	const nodePlaceholderColor = `${normalized.style.accentColor}59`;

	const containerClasses = preview
		? "relative w-full h-[24rem] overflow-hidden rounded-[2rem] bg-stone-50/10 border border-stone-200/50 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] backdrop-blur-sm"
		: "relative w-full flex-1 min-h-[40rem] overflow-visible";

	return (
		<div
			data-testid="animated-wall-renderer"
			data-shape={normalized.shape}
			data-density={TARGET_FORMATION_DENSITY}
			className={`flex w-full flex-col items-center ${preview ? "p-4" : "mt-0"}`}
		>
			<div className={containerClasses} style={previewStageStyle}>
				{!preview && (
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-60 mix-blend-screen">
						<div
							className="h-[80%] w-[80%] animate-pulse rounded-full blur-[100px] duration-[4000ms]"
							style={accentTintStyle}
						/>
					</div>
				)}

				{/* Stylized Butterfly Body */}
				<div
					ref={bodyRef}
					style={{
						top: "52%",
						left: "50%",
						transform: "translateX(-50%) translateY(-62%)",
					}}
					className="pointer-events-none absolute z-10 h-[300px] w-[80px] opacity-0 transition-opacity duration-500"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 40 100"
						className="h-full w-full drop-shadow-[0_0_20px_rgba(0,0,0,0.3)]"
					>
						{/* Head */}
						<circle cx="20" cy="15" r="7" fill="#222" opacity="1" />
						{/* Antennas */}
						<path
							d="M18,10 Q10,-10 0,5 M22,10 Q30,-10 40,5"
							stroke="#222"
							strokeWidth="2.5"
							fill="none"
							opacity="0.8"
						/>
						{/* Thorax */}
						<ellipse cx="20" cy="38" rx="10" ry="16" fill="#333" opacity="1" />
						{/* Abdomen */}
						<ellipse cx="20" cy="75" rx="8" ry="28" fill="#222" opacity="1" />
					</svg>
				</div>

				{/* Spotlight blessing overlay */}
				<div
					ref={spotlightOverlayRef}
					style={{ opacity: 0, pointerEvents: "none" }}
					className="pointer-events-none absolute inset-0 z-[200] flex flex-col items-center justify-center px-8"
				>
					<div
						className="relative max-w-2xl overflow-hidden rounded-[2rem] border p-16 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)]"
						style={spotlightCardStyle}
					>
						{/* Botanical Decorations - Top Left */}
						<div className="absolute -top-6 -left-6 h-32 w-32 rotate-12 opacity-40">
							<svg
								aria-hidden="true"
								viewBox="0 0 100 100"
								className="h-full w-full"
								style={spotlightLeafStyle}
							>
								<path d="M20,80 Q40,40 80,20 Q50,50 20,80" />
								<circle cx="25" cy="75" r="3" style={spotlightBerryStyle} />
								<circle cx="35" cy="65" r="2" style={spotlightBerryStyle} />
							</svg>
						</div>

						{/* Botanical Decorations - Bottom Right */}
						<div className="absolute -right-6 -bottom-6 h-32 w-32 rotate-[192deg] opacity-40">
							<svg
								aria-hidden="true"
								viewBox="0 0 100 100"
								className="h-full w-full"
								style={spotlightLeafStyle}
							>
								<path d="M20,80 Q40,40 80,20 Q50,50 20,80" />
								<circle cx="25" cy="75" r="3" style={spotlightBerryStyle} />
								<circle cx="35" cy="65" r="2" style={spotlightBerryStyle} />
							</svg>
						</div>

						<div className="relative z-10 flex flex-col items-center">
							<span
								className="mb-2 font-medium font-serif text-sm uppercase tracking-[0.2em]"
								style={spotlightAccentStyle}
							>
								A Blessing from
							</span>

							<span
								ref={spotlightNameRef}
								className="block font-light font-serif text-5xl tracking-tight sm:text-6xl"
								style={{ fontFamily: "var(--font-playfair), serif" }}
							/>

							<div className="my-8 flex items-center gap-4 opacity-40">
								<div className="h-[0.5px] w-16" style={spotlightLineStyle} />
								<div
									className="h-1.5 w-1.5 rotate-45 border bg-transparent"
									style={spotlightDiamondStyle}
								/>
								<div className="h-[0.5px] w-16" style={spotlightLineStyle} />
							</div>

							<p
								ref={spotlightMessageRef}
								className="max-w-md font-serif text-2xl italic leading-relaxed opacity-90"
							/>
						</div>
					</div>
				</div>

				{globeTargets.map((globeTarget, index) => {
					const wishesExist = wishes.length > 0;
					const label = wishesExist
						? wishes[index % wishes.length].guest_name
						: PLACEHOLDER_BLESSINGS[index % PLACEHOLDER_BLESSINGS.length];

					const isPlaceholder = !wishesExist;

					return (
						<AnimatedWishNode
							key={`node-${globeTarget.x.toFixed(3)}-${globeTarget.y.toFixed(3)}`}
							label={label}
							target={globeTarget}
							isPlaceholder={isPlaceholder}
							textColor={nodeTextColor}
							placeholderColor={nodePlaceholderColor}
							nodeRef={(el) => {
								nodeRefs.current[index] = el;
							}}
						/>
					);
				})}
			</div>
		</div>
	);
}
