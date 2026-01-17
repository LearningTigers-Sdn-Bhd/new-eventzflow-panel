import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { UserPermissions } from "@/components/admin-ui/sidebar/app-menu-config";
import { useAuth } from "./use-auth";
import { useUserPermissions } from "./use-user-permissions";
import { getContractor } from "@/lib/api/contractor";

/**
 * Hook to fetch contractor data and build combined permissions object
 * Combines contractor-specific permissions with resource permissions
 * Only fetches contractor data when user is an exhibition_contractor
 */
export function useContractorPermissions() {
	const { user } = useAuth();
	const { permissions: resourcePermissions } = useUserPermissions();
	const isContractor = user?.role === "exhibition_contractor";

	const { data: contractor } = useQuery({
		queryKey: ["contractor", user?.id],
		queryFn: () => {
			if (!user?.id) {
				throw new Error("User ID is required");
			}
			return getContractor(user.id);
		},
		enabled: !!user?.id && isContractor,
	});

	const permissions = useMemo<UserPermissions | undefined>(() => {
		return {
			...(isContractor && contractor
				? {
						allow_printing_services:
							contractor.exhibition_contractor_profile?.allow_printing_services,
					}
				: {}),
			...resourcePermissions,
		};
	}, [isContractor, contractor, resourcePermissions]);

	return { permissions, contractor };
}
