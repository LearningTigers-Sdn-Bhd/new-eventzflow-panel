import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePublicSeatStore } from "../stores/public-seat-store";

const CELL_SIZE = 50;
const SEAT_SPACING = 45;
const SEAT_SIZE = 36;
const SECTION_PADDING = 30;

export const useSectionBoundsNavigation = () => {
	const { sections, seats } = usePublicSeatStore(
		useShallow((state) => ({
			sections: state.sections,
			seats: state.seats,
		})),
	);

	const getSectionBounds = useCallback(
		(sectionId: number) => {
			const section = sections[sectionId];
			if (!section) return null;

			const sectionSeats = Object.values(seats).filter(
				(s) => s.event_seat_section_id === sectionId,
			);

			if (sectionSeats.length === 0) {
				// Fallback to blueprint dimensions if no seats hydrated yet
				return {
					width: (section.seat_column || 1) * CELL_SIZE,
					height: (section.seat_row || 1) * CELL_SIZE,
					minCol: 0,
					minRow: 0,
				};
			}

			let minCol = Number.POSITIVE_INFINITY;
			let maxCol = Number.NEGATIVE_INFINITY;
			let minRow = Number.POSITIVE_INFINITY;
			let maxRow = Number.NEGATIVE_INFINITY;
			for (const seat of sectionSeats) {
				minCol = Math.min(minCol, seat.col_set || 0);
				maxCol = Math.max(maxCol, seat.col_set || 0);
				minRow = Math.min(minRow, seat.row_set || 0);
				maxRow = Math.max(maxRow, seat.row_set || 0);
			}

			return {
				width:
					(maxCol - minCol) * SEAT_SPACING + SEAT_SIZE + SECTION_PADDING * 2,
				height:
					(maxRow - minRow) * SEAT_SPACING + SEAT_SIZE + SECTION_PADDING * 2,
				minCol,
				minRow,
			};
		},
		[sections, seats],
	);

	return {
		getSectionBounds,
	};
};

export const useVenueBoundsNavigation = () => {
	const sections = usePublicSeatStore((state) => state.sections);

	const getVenueBounds = useCallback(() => {
		const sectionsList = Object.values(sections);
		if (sectionsList.length === 0) return null;

		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;
		for (const section of sectionsList) {
			const x = (section.start_column || 0) * CELL_SIZE;
			const y = (section.start_row || 0) * CELL_SIZE;
			const w = (section.col_span || 1) * CELL_SIZE;
			const h = (section.row_span || 1) * CELL_SIZE;
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x + w);
			maxY = Math.max(maxY, y + h);
		}

		const PADDING = 100;
		return {
			x: minX - PADDING,
			y: minY - PADDING,
			width: maxX - minX + PADDING * 2,
			height: maxY - minY + PADDING * 2,
		};
	}, [sections]);

	return {
		getVenueBounds,
	};
};
