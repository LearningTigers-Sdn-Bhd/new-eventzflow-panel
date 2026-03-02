"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { getPlan } from "@/lib/api/plan";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanWorkshop } from "@/components/plan/plan-workshop";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ event_id: string; planId: string }>;
}

export default function PlanEditorWorkshopPage({ params }: PageProps) {
  const { event_id, planId } = use(params);

  const { data: initialPlan, isLoading } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => getPlan(planId),
  });

  if (isLoading) return <EditorSkeleton />;
  if (!initialPlan) return <div>Plan not found</div>;

  return <PlanWorkshop initialPlan={initialPlan} eventId={event_id} />;
}

function EditorSkeleton() {
  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading Workshop Engine...</p>
      </div>
    </div>
  );
}
