"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import MetricsDashboard from "@/components/pages/resources/leads/metrics/metrics-dashboard";
import { Button } from "@/components/ui/button";
import { useSetResourceActions } from "@/hooks/use-set-resource-actions";
import { getResourceLeadMetrics } from "@/lib/api/resource/lead/endpoints";

export default function LeadMetricsPage() {
	// No actions needed for metrics page (read-only analytics)
	const actions = useMemo(() => null, []);
	useSetResourceActions(actions);

	const {
		data: metrics,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["resource-leads-metrics"],
		queryFn: getResourceLeadMetrics,
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading metrics..."
				description="Please wait while we fetch lead analytics..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load metrics"
				description={
					error instanceof Error
						? error.message
						: "We couldn't load lead metrics. Please try again."
				}
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	if (!metrics) {
		return (
			<ErrorState
				title="No metrics data"
				description="Unable to retrieve metrics data. Please try again."
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	return <MetricsDashboard metrics={metrics} />;
}
