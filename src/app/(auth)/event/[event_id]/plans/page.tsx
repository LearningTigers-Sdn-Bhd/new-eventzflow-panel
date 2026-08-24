"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Grid, Plus } from "lucide-react";
import { use } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import { PlanTable } from "@/components/pages/seating-plans/plan-table";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventById } from "@/lib/api/event";
import { createPlan, deletePlan, getPlans } from "@/lib/api/plan";

interface PageProps {
	params: Promise<{ event_id: string }>;
}

export default function PlansPage({ params }: PageProps) {
	const { event_id } = use(params);
	const queryClient = useQueryClient();
	const { data: event, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
	});

	const {
		data: plans,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["plans", event_id],
		queryFn: () => getPlans(event_id),
		enabled: event?.use_seat_ticketing === true,
	});

	const createMutation = useMutation({
		mutationFn: () =>
			createPlan(event_id, {
				name: `Seating Plan ${new Date().toLocaleString()}`,
				canvas_width: 1000,
				canvas_height: 800,
				pixels_per_unit: 20,
				public_enabled: false,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plans", event_id] });
			toast.success("Plan created successfully");
		},
		onError: (error) => {
			toast.error("Failed to create plan: " + error.message);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (planId: number) => deletePlan(planId.toString()),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plans", event_id] });
			toast.success("Plan deleted successfully");
		},
		onError: (error) => {
			toast.error("Failed to delete plan: " + error.message);
		},
	});

	useSetEventActions(
		<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
			<Button
				onClick={() => createMutation.mutate()}
				disabled={createMutation.isPending}
				className="w-full gap-2 rounded-none lg:w-auto"
			>
				<Plus className="h-4 w-4" />
				Create New Plan
			</Button>
		</div>,
	);

	if (isLoading || isLoadingEvent) {
		return (
			<LoadingState
				title="Loading Seating Plans..."
				description="Please wait while we fetch your seating plans."
			/>
		);
	}

	if (event?.use_seat_ticketing !== true) {
		return <FeatureLockedState featureName="Seat Ticketing System" />;
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load plans"
				description={
					error instanceof Error ? error.message : "An unknown error occurred"
				}
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	if (plans?.length === 0) {
		return (
			<EmptyState
				title="No seating plans found"
				description="Create your first seating plan to start placing tables and assigning guests."
				icon={<Grid />}
				height="h-auto"
				action={
					<Button
						onClick={() => createMutation.mutate()}
						disabled={createMutation.isPending}
					>
						Create New Plan
					</Button>
				}
			/>
		);
	}

	return (
		<PlanTable
			eventId={event_id}
			plans={plans || []}
			onDelete={(planId) => deleteMutation.mutate(planId)}
			isDeleting={deleteMutation.isPending}
		/>
	);
}
