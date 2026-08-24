"use client";

import { Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/api/plan";

interface PlanDeleteDialogProps {
	plan: Plan;
	onDelete: (planId: number) => void;
	isDeleting: boolean;
}

export function PlanDeleteDialog({
	plan,
	onDelete,
	isDeleting,
}: PlanDeleteDialogProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="destructive"
					size="sm"
					className="rounded-none"
					disabled={isDeleting}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="rounded-none">
				<AlertDialogHeader>
					<AlertDialogTitle>Delete "{plan.name}"?</AlertDialogTitle>
					<AlertDialogDescription>
						This permanently removes the plan's tables, guest assignments, and
						layout. This cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => onDelete(plan.id)}
						className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						Delete Plan
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
