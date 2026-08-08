import { useMemo } from "react";
import {
	getFilteredNavigation,
	getMobileNavigation,
	type UserPermissions,
	type UserRole,
} from "@/components/sidebars/app/app-menu-config";

/**
 * Hook to get memoized filtered navigation for both desktop and mobile
 * Prevents recalculation when dependencies haven't changed
 */
export function useNavigation(
	userRole?: UserRole,
	permissions?: UserPermissions,
	isPureBusinessMatchingAdmin?: boolean,
) {
	const filteredNav = useMemo(
		() =>
			getFilteredNavigation(userRole, permissions, isPureBusinessMatchingAdmin),
		[userRole, permissions, isPureBusinessMatchingAdmin],
	);

	const mobileNav = useMemo(
		() =>
			getMobileNavigation(userRole, permissions, isPureBusinessMatchingAdmin),
		[userRole, permissions, isPureBusinessMatchingAdmin],
	);

	return { filteredNav, mobileNav };
}
