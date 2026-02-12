"use client";

import { useEffect, useRef, useState } from "react";
import { useSeatSessionStore } from "./use-seat-session-store";

interface UseCanvasInteractionProps {
	contentWidth: number;
	contentHeight: number;
	enabled?: boolean;
}

export function useCanvasInteraction({
	contentWidth,
	contentHeight,
	enabled = true,
}: UseCanvasInteractionProps) {
	const zoom = useSeatSessionStore(state => state.zoom);
	const setZoom = useSeatSessionStore(state => state.setZoom);
	const pan = useSeatSessionStore(state => state.pan);
	const setPan = useSeatSessionStore(state => state.setPan);
	const isPanning = useSeatSessionStore(state => state.isPanning);

	const containerRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [startPan, setStartPan] = useState({ x: 0, y: 0 });
	const [isInitialized, setIsInitialized] = useState(false);

	// Center on mount/resize
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const centerCanvas = () => {
			if (contentWidth > 0 && contentHeight > 0 && container.clientWidth > 0 && container.clientHeight > 0) {
				// Only center if we haven't initialized yet or if pan is at default 0,0
				if (!isInitialized || (pan.x === 0 && pan.y === 0)) {
					const x = (container.clientWidth - contentWidth) / 2;
					const y = (container.clientHeight - contentHeight) / 2;
					setPan({ x: Math.max(0, x), y: Math.max(0, y) });
					setIsInitialized(true);
				}
			}
		};

		const observer = new ResizeObserver(() => {
			centerCanvas();
		});

		observer.observe(container);
		centerCanvas(); // Try immediately as well

		return () => observer.disconnect();
	}, [contentWidth, contentHeight, setPan, pan.x, pan.y, isInitialized]);

	// Native wheel listener for non-passive behavior (prevent browser zoom)
	useEffect(() => {
		const container = containerRef.current;
		if (!container || !enabled) return;

		const onWheel = (e: WheelEvent) => {
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault();
				const delta = e.deltaY > 0 ? -0.1 : 0.1;
				setZoom(Math.min(3, Math.max(0.2, zoom + delta)));
			} else {
				// Pan
				e.preventDefault(); // Prevent native scroll
				const deltaX = e.shiftKey && e.deltaY !== 0 ? e.deltaY : e.deltaX;
				const deltaY = e.shiftKey ? 0 : e.deltaY;
				
				setPan({
					x: pan.x - deltaX,
					y: pan.y - deltaY
				});
			}
		};

		container.addEventListener("wheel", onWheel, { passive: false });
		return () => container.removeEventListener("wheel", onWheel);
	}, [enabled, zoom, pan, setZoom, setPan]);

	const handleMouseDown = (e: React.MouseEvent) => {
		if (!enabled) return;
		
		// Allow pan if Panning mode OR Middle Click OR (Ctrl + Left Click)
		const isPanAction = isPanning || e.button === 1 || (e.button === 0 && e.ctrlKey);
		
		if (!isPanAction) return;

		e.preventDefault();
		setIsDragging(true);
		setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging || !enabled) return;

		e.preventDefault();
		const newX = e.clientX - startPan.x;
		const newY = e.clientY - startPan.y;
		setPan({ x: newX, y: newY });
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	// Keyboard support
	useEffect(() => {
		if (!enabled) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			const PAN_STEP = 20;
			// Avoid interfering if typing in inputs
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

			switch (e.key) {
				case "ArrowUp":
					setPan({ x: pan.x, y: pan.y + PAN_STEP });
					break;
				case "ArrowDown":
					setPan({ x: pan.x, y: pan.y - PAN_STEP });
					break;
				case "ArrowLeft":
					setPan({ x: pan.x + PAN_STEP, y: pan.y });
					break;
				case "ArrowRight":
					setPan({ x: pan.x - PAN_STEP, y: pan.y });
					break;
				case "+":
				case "=":
					if (e.ctrlKey || e.metaKey) {
						e.preventDefault();
						setZoom(Math.min(3, zoom + 0.1));
					}
					break;
				case "-":
					if (e.ctrlKey || e.metaKey) {
						e.preventDefault();
						setZoom(Math.max(0.2, zoom - 0.1));
					}
					break;
				case " ": // Spacebar to toggle pan mode temporarily? 
					// Common pattern: Hold space to pan. 
					// Implementing that requires keyup listener too.
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [enabled, pan, zoom, setPan, setZoom]);

	return {
		containerRef,
		isDragging,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
	};
}
