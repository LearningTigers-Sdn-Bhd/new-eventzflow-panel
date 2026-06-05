"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { use } from "react";
import { PlanWorkshop } from "@/components/plan/plan-workshop";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlan } from "@/lib/api/plan";

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
		<div className="fixed inset-0 flex items-center justify-center bg-slate-50">
			<div className="flex flex-col items-center gap-4">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="animate-pulse font-medium text-slate-500 text-sm">
					Loading Workshop Engine...
				</p>
			</div>
		</div>
	);
}
