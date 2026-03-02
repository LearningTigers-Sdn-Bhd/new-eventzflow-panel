"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPlans, createPlan, deletePlan } from "@/lib/api/plan";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/data-state";

interface PageProps {
  params: Promise<{ event_id: string }>;
}

export default function PlansPage({ params }: PageProps) {
  const { event_id } = use(params);
  const queryClient = useQueryClient();

  const { data: plans, isLoading, error, refetch } = useQuery({
    queryKey: ["plans", event_id],
    queryFn: () => getPlans(event_id),
  });

  const createMutation = useMutation({
    mutationFn: () => createPlan(event_id, { 
      name: `Seating Plan ${new Date().toLocaleString()}`,
      canvas_width: 1000,
      canvas_height: 800,
      pixels_per_unit: 20,
      public_enabled: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans", event_id] });
      toast.success("Plan created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create plan: " + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (planId: number) => deletePlan(planId.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans", event_id] });
      toast.success("Plan deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete plan: " + error.message);
    }
  });

  if (isLoading) {
    return <PlansSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load plans"
        description={error instanceof Error ? error.message : "An unknown error occurred"}
        action={<Button onClick={() => refetch()}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans?.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {plan.canvas_width}x{plan.canvas_height} units
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Pixels per unit: {plan.pixels_per_unit}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/event/${event_id}/plans/${plan.id}`} target="_blank">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Plan
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => {
                  if (confirm("Are you sure you want to delete this plan?")) {
                    deleteMutation.mutate(plan.id);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {plans?.length === 0 && (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            No plans found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function PlansSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
