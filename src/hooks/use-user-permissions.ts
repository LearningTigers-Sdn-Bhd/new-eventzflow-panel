import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getPermissionContext } from "@/lib/api/permission";
import { useAuth } from "./use-auth";

/**
 * Hook to check global user permissions, including resource writing permissions.
 */
export function useUserPermissions() {
	const { user, isInitialized } = useAuth();

	const { data: permissionContext, isLoading: isLoadingPermissions } = useQuery(
		{
			queryKey: ["user-permission-context", user?.id],
			queryFn: () => getPermissionContext({ userId: user?.id as number }),
			enabled: !!user && isInitialized,
			retry: false,
		},
	);

	return useMemo(() => {
		const isOrgOwner = user?.role === "org_owner";
		const isOrganizer = user?.role === "organizer";

		// Strictly follow backend response
		const hasWriterPermission =
			!!permissionContext?.resources.hasWriterPermission;
		const isOfficial = !!permissionContext?.resources.isOfficial;

		return {
			isOrgOwner,
			isOrganizer,
			isAdmin: isOrgOwner || isOrganizer,
			hasWriterPermission,
			isOfficial,
			isLoading: isLoadingPermissions,
			permissions: {
				has_writer_permission: hasWriterPermission || isOrgOwner,
				is_official: isOfficial || isOrgOwner,
			},
		};
	}, [user, permissionContext, isLoadingPermissions]);
}
