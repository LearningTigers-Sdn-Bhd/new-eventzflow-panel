"use client";

import { Layers, Plus } from "lucide-react";
import { useState } from "react";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { NumberInputLabel } from "@/components/admin-ui/form/number-input-label";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDialog } from "@/hooks/use-dialog";
import { useSeatSessionStore } from "./use-seat-session-store";

interface GroupAssignmentModalProps {
	seatIds: number[];
	sectionId: number;
}

export function GroupAssignmentModal({
	seatIds,
	sectionId,
}: GroupAssignmentModalProps) {
	const assignSeatsToGroup = useSeatSessionStore(state => state.assignSeatsToGroup);
	const addGroup = useSeatSessionStore(state => state.addGroup);
	const section = useSeatSessionStore(state => state.sections[sectionId]);
	const { closeDialog } = useDialog();

	const groups = section?.event_seat_groups || [];

	const [mode, setMode] = useState<"select" | "create">(
		groups.length > 0 ? "select" : "create",
	);
	const [selectedGroupId, setSelectedGroupId] = useState<string>(
		groups[0]?.id.toString() || "",
	);
	const [newGroupName, setNewGroupName] = useState("New Group");
	const [newGroupPrice, setNewGroupPrice] = useState(0);

	const handleAssign = () => {
		if (mode === "select" && selectedGroupId) {
			assignSeatsToGroup(seatIds, Number.parseInt(selectedGroupId, 10));
			closeDialog();
		} else if (mode === "create" && newGroupName) {
			addGroup(sectionId, { name: newGroupName, extra_price: newGroupPrice });

			// Because addGroup is synchronous in our store, we can immediately assign
			// but we need to find the ID. Our addGroup doesn't return the ID easily.
			setTimeout(() => {
				const latestGroup = useSeatSessionStore
					.getState()
					.sections[sectionId]
					?.event_seat_groups?.slice(-1)[0];

				if (latestGroup) {
					assignSeatsToGroup(seatIds, latestGroup.id);
				}
				closeDialog();
			}, 0);
		}
	};

	const handleUnassign = () => {
		assignSeatsToGroup(seatIds, null);
		closeDialog();
	};

	return (
		<div className="space-y-6 py-2">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					Targeting {seatIds.length} seat(s)
				</p>
				{groups.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setMode(mode === "select" ? "create" : "select")}
						className="h-8 text-xs gap-1"
					>
						{mode === "select" ? (
							<>
								<Plus className="h-3 w-3" /> Create New
							</>
						) : (
							<>
								<Layers className="h-3 w-3" /> Select Existing
							</>
						)}
					</Button>
				)}
			</div>

			{mode === "select" ? (
				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Select Pricing Group</Label>
						<Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
							<SelectTrigger className="rounded-none">
								<SelectValue placeholder="Choose a group..." />
							</SelectTrigger>
							<SelectContent>
								{groups.map((g) => (
									<SelectItem key={g.id} value={g.id.toString()}>
										{g.name} (+${g.extra_price})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			) : (
				<div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
					<InputLabel
						label="Group Name"
						value={newGroupName}
						onChange={setNewGroupName}
						variant="no-rounded"
						autoFocus
					/>
					<NumberInputLabel
						label="Additional Price"
						value={newGroupPrice}
						onChange={setNewGroupPrice}
						variant="no-rounded"
					/>
				</div>
			)}

			<div className="flex flex-col gap-2 pt-4">
				<Button onClick={handleAssign} className="w-full rounded-none">
					{mode === "create" ? "Create & Assign" : "Assign to Group"}
				</Button>
				<Button
					variant="outline"
					onClick={handleUnassign}
					className="w-full rounded-none text-destructive hover:text-destructive"
				>
					Remove from Group
				</Button>
				<Button
					variant="ghost"
					onClick={closeDialog}
					className="w-full rounded-none"
				>
					Cancel
				</Button>
			</div>
		</div>
	);
}
