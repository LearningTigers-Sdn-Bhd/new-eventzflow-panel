"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
	usePublicSeatActions,
	usePublicSeatHydrationState,
	usePublicSeatSectionState,
	usePublicSeatSelectedState,
} from "../../hooks/use-public-seat-reservation";

const VenueCanvas = dynamic(
	() => import("./venue-canvas").then((module) => module.VenueCanvas),
	{ ssr: false },
);

const SectionCanvas = dynamic(
	() => import("./section-canvas").then((module) => module.SectionCanvas),
	{ ssr: false },
);

export default function SeatReservationCanvasWrapper() {
	const { sections, activeSectionId, setActiveSection } =
		usePublicSeatSectionState();
	const { seats, hydratingSectionIds, hydratedSectionIds, error } =
		usePublicSeatHydrationState();
	const { selectedSeatIds } = usePublicSeatSelectedState();
	const { hydrateSection, toggleSeat } = usePublicSeatActions();

	const containerRef = useRef<HTMLDivElement>(null);
	const transitionTimeoutRef = useRef<number | null>(null);
	const transitionFrameRef = useRef<number | null>(null);
	const transitionTokenRef = useRef(0);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [isTransitioning, setIsTransitioning] = useState(false);

	// Centralized Dimension Tracking
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const observer = new ResizeObserver((entries) => {
			if (entries[0]) {
				const { width, height } = entries[0].contentRect;
				setDimensions({ width, height });
			}
		});
		observer.observe(container);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const token = ++transitionTokenRef.current;

		if (transitionFrameRef.current !== null) {
			cancelAnimationFrame(transitionFrameRef.current);
			transitionFrameRef.current = null;
		}

		if (transitionTimeoutRef.current !== null) {
			window.clearTimeout(transitionTimeoutRef.current);
			transitionTimeoutRef.current = null;
		}

		if (!activeSectionId || hydratedSectionIds.has(activeSectionId)) {
			setIsTransitioning(false);
			return;
		}

		setIsTransitioning(true);
		void hydrateSection(activeSectionId)
			.then(() => {
				if (transitionTokenRef.current !== token) return;

				transitionFrameRef.current = requestAnimationFrame(() => {
					transitionTimeoutRef.current = window.setTimeout(() => {
						if (transitionTokenRef.current === token) {
							setIsTransitioning(false);
						}
						transitionTimeoutRef.current = null;
					}, 100);
				});
			})
			.catch(() => {
				if (transitionTokenRef.current === token) {
					setIsTransitioning(false);
				}
			});

		return () => {
			if (transitionFrameRef.current !== null) {
				cancelAnimationFrame(transitionFrameRef.current);
				transitionFrameRef.current = null;
			}

			if (transitionTimeoutRef.current !== null) {
				window.clearTimeout(transitionTimeoutRef.current);
				transitionTimeoutRef.current = null;
			}
		};
	}, [activeSectionId, hydrateSection, hydratedSectionIds]);

	const isHydrating = activeSectionId
		? hydratingSectionIds.has(activeSectionId)
		: false;
	const isDataReady = activeSectionId
		? hydratedSectionIds.has(activeSectionId)
		: false;
	const showLoader = isHydrating || isTransitioning;
	const showError =
		!!activeSectionId &&
		!isHydrating &&
		!isTransitioning &&
		!isDataReady &&
		!!error;

	const retryHydration = () => {
		if (!activeSectionId) return;

		const token = ++transitionTokenRef.current;
		setIsTransitioning(true);
		void hydrateSection(activeSectionId).finally(() => {
			if (transitionTokenRef.current === token) {
				setIsTransitioning(false);
			}
		});
	};

	return (
		<div
			ref={containerRef}
			className="relative h-full w-full overflow-hidden bg-slate-100"
		>
			{/* Venue Canvas (Always mounted but hidden when section is ready to avoid dual stage overhead) */}
			{!activeSectionId && (
				<VenueCanvas
					sections={sections}
					activeSectionId={activeSectionId}
					onSelectSection={setActiveSection}
					dimensions={dimensions}
				/>
			)}

			{/* Section Canvas */}
			{activeSectionId &&
				sections[activeSectionId] &&
				isDataReady &&
				!isTransitioning && (
					<div className="fade-in absolute inset-0 z-10 animate-in duration-500">
						<SectionCanvas
							section={sections[activeSectionId]}
							seats={seats}
							selectedSeatIds={selectedSeatIds}
							toggleSeat={toggleSeat}
							onZoomOut={() => setActiveSection(null)}
							dimensions={dimensions}
						/>
					</div>
				)}

			{/* Smooth Loader Overlay */}
			{showLoader && (
				<div className="fade-in absolute inset-0 z-20 flex animate-in flex-col items-center justify-center bg-slate-100/80 backdrop-blur-md duration-300">
					<div className="flex flex-col items-center gap-4">
						<div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-green" />
						<div className="flex flex-col items-center gap-1">
							<span className="font-black text-slate-900 text-sm uppercase tracking-[0.2em]">
								Preparing Venue
							</span>
							<span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">
								{activeSectionId
									? sections[activeSectionId]?.name
									: "Loading..."}
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Hydration Error Overlay */}
			{showError && (
				<div className="fade-in absolute inset-0 z-20 flex animate-in items-center justify-center bg-slate-100/90 backdrop-blur-sm duration-300">
					<div className="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-lg border border-red-200 bg-white p-6 text-center shadow-lg">
						<p className="font-black text-slate-900 text-sm uppercase tracking-wide">
							Failed to load seats
						</p>
						<p className="font-semibold text-slate-500 text-xs">{error}</p>
						<button
							type="button"
							onClick={retryHydration}
							className="rounded-md bg-brand-green px-4 py-2 font-black text-white text-xs uppercase tracking-wide transition hover:bg-brand-green/90"
						>
							Retry
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
