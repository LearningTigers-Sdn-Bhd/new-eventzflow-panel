"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { LeadsTable } from "@/components/pages/resources/leads/index/leads-table";
import { Button } from "@/components/ui/button";
import { getResourceLeads } from "@/lib/api/resource/lead";

export default function LeadsPage() {
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(15);

	const {
		data: leadsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["resource-leads", pageIndex, pageSize],
		queryFn: () =>
			getResourceLeads({
				page: pageIndex + 1,
				perPage: pageSize,
			}),
	});

	const leads = leadsData?.data;
	const pagination = leadsData?.pagination;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading leads..."
				description="Please wait while we fetch resource leads..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load leads"
				description={
					error.message || "We couldn't load resource leads. Please try again."
				}
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	return (
		<LeadsTable
			data={leads || []}
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
		/>
	);
}
