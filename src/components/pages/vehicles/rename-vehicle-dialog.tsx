"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialog } from "@/hooks/use-dialog";
import {
	updateVehicle,
	type VehicleRegistration,
} from "@/lib/api/vehicle-registration";
import { queryClient } from "@/utils/rest-api";

interface RenameVehicleDialogProps {
	eventId: string;
	vehicle: VehicleRegistration;
}

export function RenameVehicleDialog({
	eventId,
	vehicle,
}: RenameVehicleDialogProps) {
	const { closeDialog } = useDialog();
	const [plate, setPlate] = useState(vehicle.plate);

	const renameMutation = useMutation({
		mutationFn: updateVehicle,
		onSuccess: (updated) => {
			toast.success(`Vehicle renamed to ${updated.plate}.`);
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "vehicle-registrations"],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to rename vehicle");
		},
	});

	const handleSubmit = () => {
		if (!plate.trim()) {
			toast.error("Enter a plate number");
			return;
		}
		renameMutation.mutate({
			eventId,
			vehicleRegistrationId: vehicle.id,
			plate: plate.trim(),
		});
	};

	return (
		<div className="space-y-4">
			<p className="text-muted-foreground text-sm">
				Rename the plate for this vehicle. Crew tickets carrying the plate in
				their registration details are updated automatically.
			</p>
			<div className="space-y-2">
				<Label htmlFor="vehicle-plate">Plate number</Label>
				<Input
					id="vehicle-plate"
					className="rounded-none"
					value={plate}
					onChange={(e) => setPlate(e.target.value.toUpperCase())}
					placeholder="e.g. SAA1234"
					disabled={renameMutation.isPending}
					autoFocus
					onKeyDown={(e) => {
						if (e.key === "Enter") handleSubmit();
					}}
				/>
			</div>
			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					className="rounded-none"
					onClick={closeDialog}
					disabled={renameMutation.isPending}
				>
					Cancel
				</Button>
				<Button
					className="rounded-none"
					onClick={handleSubmit}
					disabled={renameMutation.isPending}
				>
					{renameMutation.isPending ? "Renaming..." : "Rename"}
				</Button>
			</div>
		</div>
	);
}
