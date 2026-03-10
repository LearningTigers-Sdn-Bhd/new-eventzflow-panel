"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, Users, LayoutDashboard } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
              <CardTitle className="truncate">{plan.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <LayoutDashboard className="h-3.5 w-3.5" />
                {plan.tables_count || 0} Tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Users className="h-3.5 w-3.5" />
                    Assigned
                  </span>
                  <span className="font-bold">
                    {plan.assigned_guests_count || 0} / {plan.total_capacity || 0}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                  <div 
                    className="bg-primary h-full transition-all duration-500 ease-out" 
                    style={{ 
                      width: `${Math.min(100, ((plan.assigned_guests_count || 0) / (plan.total_capacity || 1)) * 100)}%` 
                    }} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-slate-50/50 py-3">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/event/${event_id}/plans/${plan.id}`} target="_blank">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Plan
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        This action cannot be undone. Deleting the seating plan <strong>"{plan.name}"</strong> will permanently remove:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm font-medium">
                        <li>All plan objects (tables, stages, labels, etc.)</li>
                        <li>All guest-to-table assignments associated with this plan</li>
                        <li>Seating plan layout and background images</li>
                      </ul>
                      <p className="text-destructive font-semibold">
                        All attached data inside this seating plan will be lost forever.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteMutation.mutate(plan.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Plan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
