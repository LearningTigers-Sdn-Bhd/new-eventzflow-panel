"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddVisitorDialog } from "../add-visitor-dialog";

interface VisitorsPageButtonProps {
	eventId: number;
}

export function VisitorsPageButton({ eventId }: VisitorsPageButtonProps) {
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

	return (
		<>
			<div className="flex w-full items-center gap-2 lg:w-auto">
				<Button
					onClick={() => setIsAddDialogOpen(true)}
					className="w-full rounded-none lg:w-auto"
				>
					<Plus className="mr-2 h-4 w-4" />
					Add Visitor
				</Button>
			</div>

			<AddVisitorDialog
				eventId={eventId}
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
			/>
		</>
	);
}
