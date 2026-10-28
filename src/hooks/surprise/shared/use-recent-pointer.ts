"use client";

import { useEffect, useState } from "react";

/**
 * True while the mouse moved in the last `ms`. Stage controls use it to stay
 * invisible to a crowd watching a mirrored screen until the operator reaches for them.
 */
export function useRecentPointer(ms = 3000) {
	const [active, setActive] = useState(false);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		const onMove = () => {
			setActive(true);
			clearTimeout(timer);
			timer = setTimeout(() => setActive(false), ms);
		};
		window.addEventListener("mousemove", onMove);
		return () => {
			window.removeEventListener("mousemove", onMove);
			clearTimeout(timer);
		};
	}, [ms]);

	return active;
}
