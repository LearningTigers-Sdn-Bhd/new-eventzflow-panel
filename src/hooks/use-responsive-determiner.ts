import * as React from "react";
import { useIsMobile } from "./use-mobile";
import { useIsTablet } from "./use-tablet";

export function useResponsiveDeterminer() {
	const isMobile = useIsMobile();
	const isTablet = useIsTablet();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	return {
		isMobile: mounted && isMobile,
		isTablet: mounted && isTablet,
		isDesktop: mounted && !isMobile && !isTablet,
		mounted,
	};
}
