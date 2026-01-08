"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { MediaTypeTable } from "@/components/pages/resources/manage/media-type/media-type-table";
import { CreateMediaTypeButton } from "@/components/pages/resources/manage/media-type/page-action/create-media-type-button";
import { Button } from "@/components/ui/button";
import { useSetResourceActions } from "@/hooks/use-set-resource-actions";
import { getResourceMediaTypes } from "@/lib/api/resource/media-type";

type MediaTypeFilter = "active" | "archived" | "all";

export default function MediaTypePage() {
	const [filter, setFilter] = useState<MediaTypeFilter>("active");
	const actions = useMemo(() => <CreateMediaTypeButton />, []);
	useSetResourceActions(actions);

	const {
		data: mediaTypesData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["resource-media-types", filter],
		queryFn: () => getResourceMediaTypes({ filter }),
	});

	const mediaTypes = mediaTypesData?.data;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading media types..."
				description="Please wait while we fetch resource media types..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load media types"
				description={
					error.message ||
					"We couldn't load resource media types. Please try again."
				}
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	return (
		<MediaTypeTable
			data={mediaTypes || []}
			filter={filter}
			onFilterChange={setFilter}
		/>
	);
}
