import { useMemo } from "react";
import {
	getFilteredNavigation,
	getMobileNavigation,
	type UserPermissions,
	type UserRole,
} from "@/components/admin-ui/sidebar/app-menu-config";

/**
 * Hook to get memoized filtered navigation for both desktop and mobile
 * Prevents recalculation when dependencies haven't changed
 */
export function useNavigation(
	userRole?: UserRole,
	permissions?: UserPermissions,
) {
	const filteredNav = useMemo(
		() => getFilteredNavigation(userRole, permissions),
		[userRole, permissions],
	);

	const mobileNav = useMemo(
		() => getMobileNavigation(userRole, permissions),
		[userRole, permissions],
	);

	return { filteredNav, mobileNav };
}
