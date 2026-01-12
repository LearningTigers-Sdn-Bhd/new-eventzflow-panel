"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { CreateTopicsButton } from "@/components/pages/resources/manage/topics/page-action/create-topics-button";
import { TopicsTable } from "@/components/pages/resources/manage/topics/topics-table";
import { Button } from "@/components/ui/button";
import { useSetResourceActions } from "@/hooks/use-set-resource-actions";
import { getResourceTopics } from "@/lib/api/resource/topic";

type TopicFilter = "active" | "archived" | "all";

export default function TopicsPage() {
	const [filter, setFilter] = useState<TopicFilter>("active");
	const actions = useMemo(() => <CreateTopicsButton />, []);
	useSetResourceActions(actions);

	const {
		data: topicsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["resource-topics", filter],
		queryFn: () => getResourceTopics({ filter }),
	});

	const topics = topicsData?.data;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading topics..."
				description="Please wait while we fetch resource topics..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load topics"
				description={
					error.message || "We couldn't load resource topics. Please try again."
				}
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	return (
		<TopicsTable
			data={topics || []}
			filter={filter}
			onFilterChange={setFilter}
		/>
	);
}
