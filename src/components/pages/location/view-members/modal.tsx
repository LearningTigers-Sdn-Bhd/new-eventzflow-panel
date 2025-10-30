"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDialog } from "@/hooks/use-dialog";
import type { BaseLocation } from "../columns";

interface ViewMembersDialogProps {
	location: BaseLocation;
	onClose?: () => void;
}

export default function ViewMembersDialog({
	location,
	onClose,
}: ViewMembersDialogProps) {
	const { closeDialog } = useDialog();
	const assignedMembers = location.assignedMembers;

	return (
		<div className="flex flex-col gap-4">
			{/* Current location info */}
			<div className="rounded-md border bg-muted/50 p-3">
				<h3 className="font-semibold text-sm">{location.name}</h3>
				<p className="text-muted-foreground text-xs">
					{assignedMembers.length === 0 ? (
						<span className="text-amber-600">
							No members assigned to this location
						</span>
					) : (
						<>
							{assignedMembers.length} member
							{assignedMembers.length !== 1 ? "s" : ""} assigned
						</>
					)}
				</p>
			</div>

			{/* Members list */}
			<ScrollArea className="h-[400px] rounded-md border">
				<div className="space-y-1 p-2">
					{assignedMembers.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<p className="text-muted-foreground text-sm">
								No members assigned to this location.
							</p>
						</div>
					) : (
						assignedMembers.map((member) => (
							<div
								key={member.id}
								className="flex w-full items-center gap-3 rounded-md border bg-background p-3 hover:bg-muted/60"
							>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<p className="truncate font-medium text-sm">
											{member.name}
										</p>
										<Badge
											variant="outline"
											className="border-gray-500 bg-gray-50 text-gray-700 text-xs"
										>
											Member
										</Badge>
									</div>
									<p className="truncate text-muted-foreground text-xs">
										{member.email}
									</p>
								</div>
							</div>
						))
					)}
				</div>
			</ScrollArea>

			{/* Only a close button for the user */}
			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					onClick={() => {
						closeDialog();
						if (onClose) onClose();
					}}
				>
					Close
				</Button>
			</div>
		</div>
	);
}
