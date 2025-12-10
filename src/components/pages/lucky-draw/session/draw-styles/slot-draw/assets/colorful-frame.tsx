import { gsap } from "gsap";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { create } from "zustand";

interface ColorfulFrameProps {
	children: ReactNode;
	isDrawing?: boolean;
	isCelebrating?: boolean;
}

// Animation mode type
type AnimationMode = "idle" | "drawing" | "celebration";

// Bulb state enum
enum BulbState {
	OFF = "OFF",
	DIM = "DIM",
	HALF_DIM = "HALF_DIM",
	BRIGHT = "BRIGHT",
}

// Visual properties for each bulb state
interface BulbVisuals {
	filter: string;
	boxShadow: string;
	glowOpacity: number;
}

// Map bulb state to visual properties
const getBulbVisuals = (state: BulbState): BulbVisuals => {
	const boxShadowOn = `
		0 0 20px 5px rgba(251, 191, 36, 0.9),
		0 0 40px 10px rgba(251, 191, 36, 0.6),
		0 0 60px 15px rgba(251, 191, 36, 0.3),
		inset 0 0 10px rgba(254, 243, 199, 0.9),
		inset 0 -3px 8px rgba(217, 119, 6, 0.7)
	`;
	const boxShadowOff = `
		0 0 0px 0px rgba(251, 191, 36, 0),
		0 0 0px 0px rgba(251, 191, 36, 0),
		0 0 0px 0px rgba(251, 191, 36, 0),
		inset 0 0 0px rgba(254, 243, 199, 0),
		inset 0 0 0px rgba(217, 119, 6, 0)
	`;

	switch (state) {
		case BulbState.OFF:
			return {
				filter: "grayscale(100%)",
				boxShadow: boxShadowOff,
				glowOpacity: 0,
			};
		case BulbState.DIM:
			return {
				filter: "grayscale(100%)",
				boxShadow: boxShadowOff,
				glowOpacity: 0.25,
			};
		case BulbState.HALF_DIM:
			return {
				filter: "grayscale(50%)",
				boxShadow: boxShadowOn,
				glowOpacity: 0.5,
			};
		case BulbState.BRIGHT:
			return {
				filter: "grayscale(0%)",
				boxShadow: boxShadowOn,
				glowOpacity: 1,
			};
	}
};

// Zustand store to coordinate animation state across all bulbs
interface FrameAnimationState {
	mode: AnimationMode;
	isResetting: boolean;
	resetKey: number;
	masterTimeline: gsap.core.Timeline | null;
	celebrationTimeline: gsap.core.Timeline | null;
	bulbRefs: Map<string, { bulbRef: HTMLDivElement; glowRef: HTMLDivElement }>;
	setMode: (mode: AnimationMode) => void;
	registerBulb: (
		id: string,
		bulbRef: HTMLDivElement,
		glowRef: HTMLDivElement,
	) => void;
	unregisterBulb: (id: string) => void;
	resetAllBulbs: () => void;
	setAllBulbsBright: () => void;
	startSequence: (mode: AnimationMode) => void;
}

const useFrameAnimationStore = create<FrameAnimationState>((set, get) => ({
	mode: "idle",
	isResetting: false,
	resetKey: 0,
	masterTimeline: null,
	celebrationTimeline: null,
	bulbRefs: new Map(),

	registerBulb: (id, bulbRef, glowRef) => {
		const bulbRefs = get().bulbRefs;
		bulbRefs.set(id, { bulbRef, glowRef });
		set({ bulbRefs: new Map(bulbRefs) });
	},

	unregisterBulb: (id) => {
		const bulbRefs = get().bulbRefs;
		bulbRefs.delete(id);
		set({ bulbRefs: new Map(bulbRefs) });
	},

	resetAllBulbs: () => {
		const bulbRefs = get().bulbRefs;
		const offVisuals = getBulbVisuals(BulbState.OFF);

		bulbRefs.forEach(({ bulbRef, glowRef }) => {
			gsap.set(bulbRef, {
				filter: offVisuals.filter,
				boxShadow: offVisuals.boxShadow,
			});
			gsap.set(glowRef, {
				opacity: offVisuals.glowOpacity,
			});
		});
	},

	setAllBulbsBright: () => {
		const state = get();
		const bulbRefs = state.bulbRefs;
		const brightVisuals = getBulbVisuals(BulbState.BRIGHT);

		// Kill existing celebration timeline
		if (state.celebrationTimeline) {
			state.celebrationTimeline.kill();
		}

		// Create timeline to animate all bulbs to bright simultaneously
		const timeline = gsap.timeline();

		bulbRefs.forEach(({ bulbRef, glowRef }) => {
			timeline.to(
				bulbRef,
				{
					filter: brightVisuals.filter,
					boxShadow: brightVisuals.boxShadow,
					duration: 0.3,
					ease: "power2.out",
				},
				0,
			);
			timeline.to(
				glowRef,
				{
					opacity: brightVisuals.glowOpacity,
					duration: 0.3,
					ease: "power2.out",
				},
				0,
			);
		});

		set({ celebrationTimeline: timeline });
	},

	startSequence: (mode) => {
		const state = get();

		// Kill existing master timeline
		if (state.masterTimeline) {
			state.masterTimeline.kill();
		}

		// Kill celebration timeline if switching away from celebration
		if (mode !== "celebration" && state.celebrationTimeline) {
			state.celebrationTimeline.kill();
			set({ celebrationTimeline: null });
		}

		// Reset all bulbs first (unless entering celebration mode)
		if (mode !== "celebration") {
			state.resetAllBulbs();
		}

		// Update mode
		set({ mode, isResetting: false, resetKey: state.resetKey + 1 });
	},

	setMode: (mode) => {
		get().startSequence(mode);
	},
}));

// Calculate circular sequence position (single trail)
const getCircularPosition = (bulbId: string): number => {
	const match = bulbId.match(/(\w+)-(\d+)/);
	if (!match) return 0;

	const [, position, index] = match;
	const num = Number.parseInt(index, 10);

	// Circular wave: top (left→right) → right (top→bottom) → bottom (right→left) → left (bottom→top)
	switch (position) {
		case "top":
			// Top: 1-12 → positions 0-11
			return num - 1;
		case "right":
			// Right: 1-4 → positions 12-15 (after top finishes)
			return 12 + (num - 1);
		case "bottom":
			// Bottom: 1-12 → positions 16-27 (right to left, so reverse)
			return 16 + (12 - num);
		case "left":
			// Left: 1-4 → positions 28-31 (bottom to top, so reverse)
			return 28 + (4 - num);
		default:
			return 0;
	}
};

// Calculate dual trail positions (for drawing mode)
const getDualTrailPositions = (
	bulbId: string,
): { clockwise: number; counterClockwise: number } => {
	const match = bulbId.match(/(\w+)-(\d+)/);
	if (!match) return { clockwise: 0, counterClockwise: 0 };

	const [, position, index] = match;
	const num = Number.parseInt(index, 10);

	// Trail 1 (Clockwise): top-1 → top-12 → right-1 → right-4 → bottom-12 → bottom-1 → left-4 → left-1
	// Trail 2 (Counter-clockwise): bottom-12 → bottom-1 → left-4 → left-1 → top-1 → top-12 → right-1 → right-4
	// Counter-clockwise positions: bottom(0-11, right-to-left) → left(12-15, bottom-to-top) → top(16-27, left-to-right) → right(28-31, top-to-bottom)

	let clockwise = 0;
	let counterClockwise = 0;

	switch (position) {
		case "top":
			// Clockwise: positions 0-11 (left to right)
			clockwise = num - 1;
			// Counter-clockwise: positions 16-27 (left to right: top-1=16, top-12=27)
			counterClockwise = 16 + (num - 1);
			break;
		case "right":
			// Clockwise: positions 12-15 (after top, top to bottom)
			clockwise = 12 + (num - 1);
			// Counter-clockwise: positions 28-31 (top to bottom: right-1=28, right-4=31)
			counterClockwise = 28 + (num - 1);
			break;
		case "bottom":
			// Clockwise: positions 16-27 (right to left: bottom-12=16, bottom-1=27)
			clockwise = 16 + (12 - num);
			// Counter-clockwise: positions 0-11 (right to left: bottom-12=0, bottom-1=11)
			counterClockwise = 12 - num;
			break;
		case "left":
			// Clockwise: positions 28-31 (bottom to top: left-4=28, left-1=31)
			clockwise = 28 + (4 - num);
			// Counter-clockwise: positions 12-15 (bottom to top: left-4=12, left-1=15)
			counterClockwise = 12 + (4 - num);
			break;
	}

	return { clockwise, counterClockwise };
};

// Timeline creation functions
const TOTAL_BULBS = 32;

// Create idle timeline (single circular trail)
const createIdleTimeline = (
	bulbId: string,
	setBulbState: (state: BulbState, duration?: number, ease?: string) => void,
) => {
	const stepDuration = 0.2;
	const totalCycleTime = TOTAL_BULBS * stepDuration;
	const circularPosition = getCircularPosition(bulbId);
	const delay = circularPosition * stepDuration;

	const timeline = gsap.timeline({
		repeat: -1,
		delay,
		repeatDelay: totalCycleTime - stepDuration * 3,
	});

	// State sequence: OFF → BRIGHT → HALF_DIM → DIM → OFF
	timeline
		.add(
			() => setBulbState(BulbState.BRIGHT, stepDuration * 0.3, "power2.out"),
			0,
		)
		.add(
			() =>
				setBulbState(BulbState.HALF_DIM, stepDuration * 0.5, "power1.inOut"),
			stepDuration,
		)
		.add(
			() => setBulbState(BulbState.DIM, stepDuration * 0.5, "power1.inOut"),
			stepDuration * 2,
		)
		.add(
			() => setBulbState(BulbState.OFF, stepDuration * 0.3, "power2.in"),
			stepDuration * 3,
		);

	return timeline;
};

// Create drawing trail 1 (clockwise)
const createDrawingTrail1Timeline = (
	bulbId: string,
	setBulbState: (state: BulbState, duration?: number, ease?: string) => void,
) => {
	const stepDuration = 0.08;
	const dualTrailPositions = getDualTrailPositions(bulbId);
	const delay = dualTrailPositions.clockwise * stepDuration;

	const timeline = gsap.timeline({
		delay,
	});

	// State sequence: OFF → BRIGHT → HALF_DIM → DIM → OFF
	timeline
		.add(
			() => setBulbState(BulbState.BRIGHT, stepDuration * 0.3, "power2.out"),
			0,
		)
		.add(
			() =>
				setBulbState(BulbState.HALF_DIM, stepDuration * 0.5, "power1.inOut"),
			stepDuration,
		)
		.add(
			() => setBulbState(BulbState.DIM, stepDuration * 0.5, "power1.inOut"),
			stepDuration * 2,
		)
		.add(
			() => setBulbState(BulbState.OFF, stepDuration * 0.3, "power2.in"),
			stepDuration * 3,
		);

	return timeline;
};

// Create drawing trail 2 (counter-clockwise)
const createDrawingTrail2Timeline = (
	bulbId: string,
	setBulbState: (state: BulbState, duration?: number, ease?: string) => void,
) => {
	const stepDuration = 0.08;
	const dualTrailPositions = getDualTrailPositions(bulbId);
	const delay = dualTrailPositions.counterClockwise * stepDuration;

	const timeline = gsap.timeline({
		delay,
	});

	// State sequence: OFF → BRIGHT → HALF_DIM → DIM → OFF
	timeline
		.add(
			() => setBulbState(BulbState.BRIGHT, stepDuration * 0.3, "power2.out"),
			0,
		)
		.add(
			() =>
				setBulbState(BulbState.HALF_DIM, stepDuration * 0.5, "power1.inOut"),
			stepDuration,
		)
		.add(
			() => setBulbState(BulbState.DIM, stepDuration * 0.5, "power1.inOut"),
			stepDuration * 2,
		)
		.add(
			() => setBulbState(BulbState.OFF, stepDuration * 0.3, "power2.in"),
			stepDuration * 3,
		);

	return timeline;
};

const Bulb = ({
	id,
	isDrawing,
	isCelebrating,
}: {
	id: string;
	isDrawing?: boolean;
	isCelebrating?: boolean;
}) => {
	const bulbRef = useRef<HTMLDivElement>(null);
	const glowRef = useRef<HTMLDivElement>(null);
	const timelineRef = useRef<gsap.core.Timeline | null>(null);
	const timeoutRef = useRef<number | null>(null);
	const {
		mode,
		resetKey,
		setMode,
		registerBulb,
		unregisterBulb,
		setAllBulbsBright,
	} = useFrameAnimationStore();

	// Function to set bulb state with animation
	const setBulbState = useCallback(
		(state: BulbState, duration = 0.3, ease = "none") => {
			if (!bulbRef.current || !glowRef.current) return;

			const visuals = getBulbVisuals(state);

			gsap.to(bulbRef.current, {
				filter: visuals.filter,
				boxShadow: visuals.boxShadow,
				duration,
				ease,
			});

			gsap.to(glowRef.current, {
				opacity: visuals.glowOpacity,
				duration,
				ease,
			});
		},
		[],
	);

	// Register bulb refs on mount
	useEffect(() => {
		if (!bulbRef.current || !glowRef.current) return;

		registerBulb(id, bulbRef.current, glowRef.current);

		// Reset to OFF state
		setBulbState(BulbState.OFF, 0);

		return () => {
			unregisterBulb(id);
		};
	}, [id, registerBulb, unregisterBulb, setBulbState]);

	// Effect to handle isDrawing and isCelebrating prop changes
	useEffect(() => {
		// Celebration takes priority
		if (isCelebrating) {
			setMode("celebration");
		} else {
			const newMode: AnimationMode = isDrawing ? "drawing" : "idle";
			setMode(newMode);
		}
	}, [isDrawing, isCelebrating, setMode]);

	// Effect to handle celebration mode - set all bulbs bright
	useEffect(() => {
		if (mode === "celebration") {
			setAllBulbsBright();
		}
	}, [mode, setAllBulbsBright]);

	// Effect to create and manage animations based on mode changes
	useEffect(() => {
		if (!bulbRef.current || !glowRef.current) return;

		// Clear any pending timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		// Always kill existing timeline first, regardless of mode
		// For infinite repeat timelines, we need to kill them properly
		if (timelineRef.current) {
			// Pause first to stop any active playback
			timelineRef.current.pause();
			// Kill the timeline - this stops all animations and removes from parent
			timelineRef.current.kill();
			timelineRef.current = null;
		}

		// Skip timeline creation for celebration mode (handled by store)
		// No timelines should run during celebration - ensure we don't create any
		if (mode === "celebration") {
			// Double-check: if timeout was already set, clear it
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			return;
		}

		// Small delay to allow reset to complete
		timeoutRef.current = window.setTimeout(() => {
			timeoutRef.current = null;

			// Get current mode from store to check if it changed during timeout
			const currentMode = useFrameAnimationStore.getState().mode;
			if (currentMode === "celebration") {
				return;
			}

			// Create animation timeline based on mode
			if (currentMode === "idle") {
				timelineRef.current = createIdleTimeline(id, setBulbState);
			} else if (currentMode === "drawing") {
				// Drawing mode: dual trails
				const stepDuration = 0.08;
				const totalCycleTime = TOTAL_BULBS * stepDuration;

				const masterTimeline = gsap.timeline({
					repeat: -1,
					repeatDelay: totalCycleTime - stepDuration * 3,
				});

				// Add both trails to master timeline
				masterTimeline.add(createDrawingTrail1Timeline(id, setBulbState), 0);
				masterTimeline.add(createDrawingTrail2Timeline(id, setBulbState), 0);

				timelineRef.current = masterTimeline;
			}
		}, 50);

		// Cleanup
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			if (timelineRef.current) {
				timelineRef.current.kill();
				timelineRef.current = null;
			}
		};
	}, [id, mode, setBulbState]);

	return (
		<div className="relative">
			{/* Bulb with grayscale filter */}
			<div
				ref={bulbRef}
				className="size-8 rounded-full"
				style={{
					filter: "grayscale(100%)",
					background:
						"radial-gradient(circle, #fef08a 0%, #fbbf24 50%, #d97706 100%)",
					boxShadow: `
						0 0 0px 0px rgba(251, 191, 36, 0),
						0 0 0px 0px rgba(251, 191, 36, 0),
						0 0 0px 0px rgba(251, 191, 36, 0),
						inset 0 0 0px rgba(254, 243, 199, 0),
						inset 0 0 0px rgba(217, 119, 6, 0)
					`,
				}}
			>
				{/* Inner Shine Effect */}
				<div
					className="absolute top-1.5 left-1.5 h-3 w-3 rounded-full"
					style={{
						background:
							"radial-gradient(circle, #fffbeb 0%, rgba(255, 251, 235, 0) 70%)",
					}}
				/>
			</div>

			{/* Progressive blur glow overlay with fade pulse effect */}
			<div
				ref={glowRef}
				className="pointer-events-none absolute inset-0 rounded-full opacity-0"
				style={{
					background:
						"radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, rgba(251, 191, 36, 0.4) 40%, transparent 70%)",
					filter: "blur(8px)",
				}}
			/>
		</div>
	);
};

export const ColorfulFrame = ({
	children,
	isDrawing,
	isCelebrating,
}: ColorfulFrameProps) => {
	return (
		<div className="mx-auto w-full">
			{/* FlexCol Container */}
			<div
				className="flex flex-col"
				style={{
					backfaceVisibility: "hidden",
					WebkitBackfaceVisibility: "hidden",
					transform: "translateZ(0)",
					WebkitTransform: "translateZ(0)",
				}}
			>
				{/* Top Section - h-14, grid-cols-6, gap-4 */}
				<div
					className="grid h-14 grid-cols-12 items-center"
					style={{
						background:
							"linear-gradient(135deg, #7f1d1d 0%, #991b1b 25%, #7f1d1d 50%, #991b1b 75%, #7f1d1d 100%)",
						marginBottom: "-1px",
					}}
				>
					{/* Empty first column */}
					{/* <div /> */}

					{/* 4 bulbs in the middle */}
					<div className="flex items-center justify-center">
						<Bulb
							id="top-1"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="top-2"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="top-3"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="top-4"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="top-5"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="top-6"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="top-7"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="top-8"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="top-9"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="top-10"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="top-11"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="top-12"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>

					{/* Empty last column */}
					{/* <div /> */}
				</div>

				{/* Center Section - h-full flex-1, flex-row */}
				<div className="flex h-full flex-1 flex-row">
					{/* Left Section - w-14, 3 bulbs vertically */}
					<div
						className="grid w-14 grid-cols-1"
						style={{
							background:
								"linear-gradient(135deg, #7f1d1d 0%, #991b1b 25%, #7f1d1d 50%, #991b1b 75%, #7f1d1d 100%)",
							marginRight: "-1px",
						}}
					>
						<div className="flex items-center justify-center">
							<Bulb
								id="left-1"
								isDrawing={isDrawing}
								isCelebrating={isCelebrating}
							/>
						</div>
						<div className="flex items-center justify-center">
							<Bulb
								id="left-2"
								isDrawing={isDrawing}
								isCelebrating={isCelebrating}
							/>
						</div>
						<div className="flex items-center justify-center">
							<Bulb
								id="left-3"
								isDrawing={isDrawing}
								isCelebrating={isCelebrating}
							/>
						</div>
						<div className="flex items-center justify-center">
							<Bulb
								id="left-4"
								isDrawing={isDrawing}
								isCelebrating={isCelebrating}
							/>
						</div>
					</div>

					{/* Center Content Area - w-full flex-1, border-8 */}
					<div
						className="w-full flex-1 border-8"
						style={{
							borderColor: "#7f1d1d",
							background:
								"linear-gradient(135deg, #7f1d1d 0%, #450a0a 50%, #7f1d1d 100%)",
						}}
					>
						<div className="relative h-full overflow-hidden">{children}</div>
					</div>

					{/* Right Section - w-14, 3 bulbs vertically */}
					<div
						className="grid w-14 grid-cols-1"
						style={{
							background:
								"linear-gradient(135deg, #7f1d1d 0%, #991b1b 25%, #7f1d1d 50%, #991b1b 75%, #7f1d1d 100%)",
							marginLeft: "-1px",
						}}
					>
						<div className="flex items-center justify-center">
							<Bulb
								id="right-1"
								isDrawing={isDrawing}
								isCelebrating={isCelebrating}
							/>
						</div>
						<div className="flex items-center justify-center">
							<Bulb
								id="right-2"
								isDrawing={isDrawing}
								isCelebrating={isCelebrating}
							/>
						</div>
						<div className="flex items-center justify-center">
							<Bulb
								id="right-3"
								isDrawing={isDrawing}
								isCelebrating={isCelebrating}
							/>
						</div>
						<div className="flex items-center justify-center">
							<Bulb
								id="right-4"
								isDrawing={isDrawing}
								isCelebrating={isCelebrating}
							/>
						</div>
					</div>
				</div>

				{/* Bottom Section - h-14, grid-cols-6, gap-4 */}
				<div
					className="grid h-14 grid-cols-12 items-center"
					style={{
						background:
							"linear-gradient(135deg, #7f1d1d 0%, #991b1b 25%, #7f1d1d 50%, #991b1b 75%, #7f1d1d 100%)",
						marginTop: "-1px",
					}}
				>
					{/* Empty first column */}
					{/* <div /> */}

					{/* 4 bulbs in the middle */}
					<div className="flex items-center justify-center">
						<Bulb
							id="bottom-1"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="bottom-2"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="bottom-3"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="bottom-4"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="bottom-5"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="bottom-6"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="bottom-7"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="bottom-8"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="bottom-9"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="bottom-10"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="bottom-11"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>
					<div className="flex items-center justify-center">
						<Bulb
							id="bottom-12"
							isDrawing={isDrawing}
							isCelebrating={isCelebrating}
						/>
					</div>

					{/* Empty last column */}
					{/* <div /> */}
				</div>
			</div>
		</div>
	);
};
