"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { PassBundlePageButton } from "@/components/pages/bundle-passes/page-action/button";
import { PassBundleTable } from "@/components/pages/bundle-passes/pass-bundle-table";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import {
	deletePassBundle,
	getEventPassBundles,
	type PassBundle,
} from "@/lib/api/pass-bundle";

export default function PassBundlesPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const queryClient = useQueryClient();

	useSetEventActions(
		<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
			<PassBundlePageButton eventId={event_id} />
		</div>,
	);

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["event", event_id, "bundle-passes"],
		queryFn: () => getEventPassBundles({ eventId: event_id }),
	});

	const deleteMutation = useMutation({
		mutationFn: (bundle: PassBundle) =>
			deletePassBundle({ eventId: event_id, passBundleId: bundle.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["event", event_id, "bundle-passes"],
			});
		},
	});

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading Bundle Passes..."
					description="Please wait while we fetch your Bundle Passes."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load Bundle Passes"
					description={error.message || "Please try again."}
					action={<Button onClick={() => refetch()}>Retry</Button>}
				/>
			) : (
				<PassBundleTable
					eventId={event_id}
					data={data || []}
					onDelete={(bundle) => {
						if (window.confirm(`Delete Bundle Pass "${bundle.name}"?`)) {
							deleteMutation.mutate(bundle);
						}
					}}
				/>
			)}
		</div>
	);
}
