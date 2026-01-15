"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { CreatePostButton } from "@/components/pages/resources/posts/page-action/create-post-button";
import { PostTable } from "@/components/pages/resources/posts/post-table";
import { Button } from "@/components/ui/button";
import { useSetResourceActions } from "@/hooks/use-set-resource-actions";
import { getResources } from "@/lib/api/resource";

type PostFilter =
	| "published"
	| "draft"
	| "pending_review"
	| "rejected"
	| "archived"
	| "all";

export default function PostsPage() {
	const router = useRouter();
	const [filter, setFilter] = useState<PostFilter>("all");
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	const actions = useMemo(() => <CreatePostButton />, []);
	useSetResourceActions(actions);

	const {
		data: postsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["resources", filter, pageIndex, pageSize],
		queryFn: () =>
			getResources({
				status: filter === "all" ? undefined : filter,
				page: pageIndex + 1,
				perPage: pageSize,
			}),
	});

	const posts = postsData?.data;
	const pagination = postsData?.pagination;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading posts..."
				description="Please wait while we fetch resource posts..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load posts"
				description={
					error.message || "We couldn't load resource posts. Please try again."
				}
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	return (
		<PostTable
			data={posts || []}
			filter={filter}
			onFilterChange={(newFilter) => {
				setFilter(newFilter);
				setPageIndex(0); // Reset to first page on filter change
			}}
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
