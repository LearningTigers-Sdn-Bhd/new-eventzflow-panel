import { useEffect, useState } from "react";

/**
 * Keeps what the operator typed in a draft and commits it to the server query
 * after a short pause, so each keystroke does not fire a request. Committing
 * also returns the list to page 1.
 */
export function useServerSearch(
	committed: string,
	onCommit: (value: string) => void,
	onPageReset: () => void,
) {
	const [draft, setDraft] = useState(committed);

	useEffect(() => {
		if (draft === committed) return;
		const timer = setTimeout(() => {
			onCommit(draft);
			onPageReset();
		}, 300);
		return () => clearTimeout(timer);
	}, [draft, committed, onCommit, onPageReset]);

	return [draft, setDraft] as const;
}
