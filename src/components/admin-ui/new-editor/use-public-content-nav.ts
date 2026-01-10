"use client";

import { useCallback, useState } from "react";

export interface UsePublicContentNavReturn {
	isNavVisible: boolean;
	toggleNav: () => void;
	showNav: () => void;
	hideNav: () => void;
}

export function usePublicContentNav(
	defaultVisible = true,
): UsePublicContentNavReturn {
	const [isNavVisible, setIsNavVisible] = useState(defaultVisible);

	const toggleNav = useCallback(() => {
		setIsNavVisible((prev) => !prev);
	}, []);

	const showNav = useCallback(() => {
		setIsNavVisible(true);
	}, []);

	const hideNav = useCallback(() => {
		setIsNavVisible(false);
	}, []);

	return {
		isNavVisible,
		toggleNav,
		showNav,
		hideNav,
	};
}
