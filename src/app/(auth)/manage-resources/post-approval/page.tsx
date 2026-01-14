"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { PostApprovalTable } from "@/components/pages/resources/post-approval/post-approval-table";
import { Button } from "@/components/ui/button";
import { getApprovalResources } from "@/lib/api/resource";

export default function PostApprovalPage() {
	const router = useRouter();
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	const {
		data: postsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["resources-approval", pageIndex, pageSize],
		queryFn: () =>
			getApprovalResources({ page: pageIndex + 1, perPage: pageSize }),
	});

	const posts = postsData?.data;
	const pagination = postsData?.pagination;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading approval queue..."
				description="Please wait while we fetch pending resource posts..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load approval queue"
				description={
					error.message ||
					"We couldn't load resource posts. Please try again."
				}
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	return (
		<PostApprovalTable
			data={posts || []}
			pagination={
				pagination
					? {
							pageIndex: pagination.current_page - 1,
							pageSize: pagination.per_page,
							totalCount: pagination.total_count,
						}
					: undefined
			}
			onPaginationChange={(newPageIndex, newPageSize) => {
				setPageIndex(newPageIndex);
				setPageSize(newPageSize);
			}}
			clickableRowConfig={{
				isEnabled: true,
				onRowClick: (row) => router.push(`/manage-resources/posts/${row.slug}`),
			}}
		/>
	);
}