/** biome-ignore-all lint/a11y/noStaticElementInteractions: skip */
import {
	createContext,
	type MouseEvent,
	type RefObject,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { useSeatSessionStore } from "../store/use-seat-session-store";

interface CanvasContextType {
	containerRef: RefObject<HTMLDivElement | null>;
	isDragging: boolean;
	handleMouseDown: (e: MouseEvent) => void;
	handleMouseMove: (e: MouseEvent) => void;
	handleMouseUp: () => void;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export function useCanvas() {
	const context = useContext(CanvasContext);
	if (!context) {
		throw new Error("useCanvas must be used within a CanvasProvider");
	}
	return context;
}

interface CanvasProviderProps {
	children: React.ReactNode;
	contentWidth: number;
	contentHeight: number;
	enabled?: boolean;
	venueId?: number; // Add venueId to track changes
}

export function CanvasProvider({
	children,
	contentWidth,
	contentHeight,
	enabled = true,
	venueId,
}: CanvasProviderProps) {
	const zoom = useSeatSessionStore((state) => state.zoom);
	const setZoom = useSeatSessionStore((state) => state.setZoom);
	const pan = useSeatSessionStore((state) => state.pan);
	const setPan = useSeatSessionStore((state) => state.setPan);
	const isPanning = useSeatSessionStore((state) => state.isPanning);

	const containerRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [startPan, setStartPan] = useState({ x: 0, y: 0 });
	const initializedVenueIdRef = useRef<number | null>(null);

	// Center and fit on mount/resize
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const centerCanvas = () => {
			const container = containerRef.current;
			if (
				!container ||
				contentWidth <= 0 ||
				contentHeight <= 0 ||
				container.clientWidth <= 0 ||
				container.clientHeight <= 0
			)
				return;

			// If venue changed or not yet initialized for this venue
			if (initializedVenueIdRef.current !== venueId) {
				// Calculate scale to fit with a small margin
				const scaleX = (container.clientWidth - 60) / contentWidth;
				const scaleY = (container.clientHeight - 60) / contentHeight;
				const fitZoom = Math.min(scaleX, scaleY);

				setZoom(fitZoom);

				const scaledWidth = contentWidth * fitZoom;
				const scaledHeight = contentHeight * fitZoom;
				const x = (container.clientWidth - scaledWidth) / 2;
				const y = (container.clientHeight - scaledHeight) / 2;

				setPan({ x, y });

				// Mark as initialized for this specific venue
				if (venueId) {
					initializedVenueIdRef.current = venueId;
				}
			}
		};

		const observer = new ResizeObserver(() => centerCanvas());
		observer.observe(container);

		centerCanvas();

		return () => observer.disconnect();
	}, [contentWidth, contentHeight, setPan, setZoom, venueId]);

	// Wheel Listener
	useEffect(() => {
		const container = containerRef.current;
		if (!container || !enabled) return;

		const onWheel = (e: WheelEvent) => {
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault();
				const delta = e.deltaY > 0 ? -0.1 : 0.1;
				setZoom(Math.min(3, Math.max(0.2, zoom + delta)));
			} else {
				e.preventDefault();
				const deltaX = e.shiftKey && e.deltaY !== 0 ? e.deltaY : e.deltaX;
				const deltaY = e.shiftKey ? 0 : e.deltaY;
				setPan({
					x: pan.x - deltaX,
					y: pan.y - deltaY,
				});
			}
		};

		container.addEventListener("wheel", onWheel, { passive: false });
		return () => container.removeEventListener("wheel", onWheel);
	}, [enabled, zoom, pan, setZoom, setPan]);

	// Mouse Handlers
	const handleMouseDown = (e: MouseEvent) => {
		if (!enabled) return;
		const isPanAction =
			isPanning || e.button === 1 || (e.button === 0 && e.ctrlKey);
		if (!isPanAction) return;

		e.preventDefault();
		setIsDragging(true);
		setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging || !enabled) return;
		e.preventDefault();
		setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
	};

	const handleMouseUp = () => setIsDragging(false);

	// Keyboard Listener
	useEffect(() => {
		if (!enabled) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			const PAN_STEP = 20;
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			)
				return;

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
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [enabled, pan, zoom, setPan, setZoom]);

	return (
		<CanvasContext.Provider
			value={{
				containerRef,
				isDragging,
				handleMouseDown,
				handleMouseMove,
				handleMouseUp,
			}}
		>
			<div
				ref={containerRef}
				className="relative h-full w-full select-none overflow-hidden bg-slate-100"
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
			>
				{children}
			</div>
		</CanvasContext.Provider>
	);
}
