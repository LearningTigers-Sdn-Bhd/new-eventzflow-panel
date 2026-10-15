"use client";

import { Edit, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Plan } from "@/lib/api/plan";
import { PlanCreatedAt } from "./plan-created-at";
import { PlanDeleteDialog } from "./plan-delete-dialog";

interface PlanItemProps {
	plan: Plan;
	eventId: string;
	onDelete: (planId: number) => void;
	isDeleting: boolean;
}

export function PlanItem({
	plan,
	eventId,
	onDelete,
	isDeleting,
}: PlanItemProps) {
	const assigned = plan.assigned_guests_count || 0;
	const capacity = plan.total_capacity || 0;

	return (
		<Card className="rounded-none border-dashed">
			<CardHeader className="space-y-1.5">
				<CardTitle className="truncate font-medium text-base">
					{plan.name}
				</CardTitle>
				<PlanCreatedAt createdAt={plan.created_at} variant="inline" />
				<Badge variant="outline" className="w-fit gap-1.5 rounded-none">
					<LayoutDashboard className="h-3.5 w-3.5" />
					{plan.tables_count || 0} Tables
				</Badge>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center justify-between text-sm">
					<span className="flex items-center gap-1.5 font-medium text-muted-foreground">
						<Users className="h-3.5 w-3.5" />
						Assigned
					</span>
					<span className="font-medium">
						{assigned} / {capacity}
					</span>
				</div>
				<div className="h-1.5 w-full overflow-hidden bg-muted">
					<div
						className="h-full bg-primary transition-all duration-500 ease-out"
						style={{
							width: `${Math.min(100, (assigned / (capacity || 1)) * 100)}%`,
						}}
					/>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between gap-2 border-t pt-3">
				<Button variant="outline" size="sm" className="rounded-none" asChild>
					<Link href={`/event/${eventId}/plans/${plan.id}`} target="_blank">
						<Edit className="mr-2 h-4 w-4" />
						Edit Plan
					</Link>
				</Button>
				<PlanDeleteDialog
					plan={plan}
					onDelete={onDelete}
					isDeleting={isDeleting}
				/>
			</CardFooter>
		</Card>
	);
}
