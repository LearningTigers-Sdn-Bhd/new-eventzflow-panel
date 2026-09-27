"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { VehicleGroupField } from "@/components/pages/tickets/page-action/vehicle-group-field";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import {
	moveVehicleGroup,
	type VehicleRegistration,
} from "@/lib/api/vehicle-registration";
import { queryClient } from "@/utils/rest-api";

interface MoveVehicleGroupDialogProps {
	eventId: string;
	vehicle: VehicleRegistration;
}

export function MoveVehicleGroupDialog({
	eventId,
	vehicle,
}: MoveVehicleGroupDialogProps) {
	const { closeDialog } = useDialog();
	const [formId, setFormId] = useState<number>(
		vehicle.registrationForm.id ?? 0,
	);

	const moveMutation = useMutation({
		mutationFn: moveVehicleGroup,
		onSuccess: () => {
			toast.success(`Moved ${vehicle.plate} to the new group.`);
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "vehicle-registrations"],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "pending-tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to move vehicle group");
		},
	});

	const handleSubmit = () => {
		if (!formId) {
			toast.error("Choose a vehicle group");
			return;
		}
		moveMutation.mutate({
			eventId,
			vehicleRegistrationId: vehicle.id,
			registrationFormId: formId,
		});
	};

	return (
		<div className="space-y-4">
			<p className="text-muted-foreground text-sm">
				Move <span className="font-semibold">{vehicle.plate}</span> to another
				vehicle group. Only a car with a single active person can move.
			</p>
			<VehicleGroupField
				eventId={eventId}
				value={formId}
				onChange={setFormId}
				disabled={moveMutation.isPending}
			/>
			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					className="rounded-none"
					onClick={closeDialog}
					disabled={moveMutation.isPending}
				>
					Cancel
				</Button>
				<Button
					className="rounded-none"
					onClick={handleSubmit}
					disabled={moveMutation.isPending}
				>
					{moveMutation.isPending ? "Moving..." : "Move group"}
				</Button>
			</div>
		</div>
	);
}
