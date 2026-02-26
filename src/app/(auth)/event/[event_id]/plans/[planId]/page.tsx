"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { getPlan } from "@/lib/api/plan";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanEditorContent } from "@/components/plan/plan-editor";

interface PageProps {
  params: Promise<{ event_id: string; planId: string }>;
}

export default function PlanEditorPage({ params }: PageProps) {
  const { event_id, planId } = use(params);

  const { data: initialPlan, isLoading } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => getPlan(planId),
  });

  if (isLoading) return <EditorSkeleton />;
  if (!initialPlan) return <div>Plan not found</div>;

  return <PlanEditorContent initialPlan={initialPlan} eventId={event_id} />;
}

function EditorSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-12 w-full" />
      <div className="flex gap-4 h-[600px]">
        <Skeleton className="w-80 h-full" />
        <Skeleton className="flex-1 h-full" />
        <Skeleton className="w-64 h-full" />
      </div>
    </div>
  );
}
