"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { PermissionsPageButton } from "@/components/pages/resources/manage/permissions/page-action/create-permission-button";
import { PermissionsTable } from "@/components/pages/resources/manage/permissions/permissions-table";
import { columns } from "@/components/pages/resources/manage/permissions/permissions-table-columns";
import { Button } from "@/components/ui/button";
import { useSetResourceActions } from "@/hooks/use-set-resource-actions";
import { getResourcePermissions } from "@/lib/api/resource/permission";

export default function PermissionsPage() {
	const actions = useMemo(() => <PermissionsPageButton />, []);
	useSetResourceActions(actions);

	const {
		data: permissionsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["resource-permissions"],
		queryFn: () => getResourcePermissions(),
	});

	const permissions = permissionsData?.data;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading permissions..."
				description="Please wait while we fetch permissions..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load permissions"
				description={
					error.message || "We couldn't load permissions. Please try again."
				}
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	return (
		<div className="w-full">
			<PermissionsTable data={permissions || []} columns={columns} />
		</div>
	);
}
