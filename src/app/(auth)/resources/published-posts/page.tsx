"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { PublishedPostsTable } from "@/components/pages/resources/published-posts/published-posts-table";
import { Button } from "@/components/ui/button";
import { getResourcesOwner } from "@/lib/api/resource";

export default function PublishedPostsPage() {
	const router = useRouter();
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	const {
		data: postsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["resources-owner", pageIndex, pageSize],
		queryFn: () =>
			getResourcesOwner({
				status: "published",
				page: pageIndex + 1,
				perPage: pageSize,
			}),
	});

	const posts = postsData?.data;
	const pagination = postsData?.pagination;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading resources..."
				description="Please wait while we fetch all resource posts..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load resources"
				description={
					error.message ||
					"We couldn't load resource posts. Please try again."
				}
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	return (
		<PublishedPostsTable
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
				onRowClick: (row) => router.push(`/resources/posts/${row.slug}`),
			}}
		/>
	);
}
