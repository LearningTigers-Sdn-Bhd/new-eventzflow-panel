"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDialog } from "@/hooks/use-dialog";
import { getPrintingServices } from "@/lib/api/printing-service";
import type { PrintingService } from "@/lib/api/printing-service";
import { cn } from "@/lib/utils";

interface LinkServiceDialogProps {
	linkedServiceIds: number[];
	onConfirm: (serviceIds: number[]) => void;
	isPending?: boolean;
}

export function LinkServiceDialog({
	linkedServiceIds,
	onConfirm,
	isPending = false,
}: LinkServiceDialogProps) {
	const { closeDialog } = useDialog();
	const [selectedIds, setSelectedIds] = useState<number[]>([]);

	// Fetch user's printing services
	const { data: services = [], isLoading } = useQuery({
		queryKey: ["printing-services"],
		queryFn: () => getPrintingServices(),
	});

	// Filter out already linked services
	const availableServices = services.filter(
		(service) => !linkedServiceIds.includes(service.id),
	);

	const handleToggle = (serviceId: number) => {
		setSelectedIds((prev) =>
			prev.includes(serviceId)
				? prev.filter((id) => id !== serviceId)
				: [...prev, serviceId],
		);
	};

	const handleSelectAll = () => {
		if (selectedIds.length === availableServices.length) {
			setSelectedIds([]);
		} else {
			setSelectedIds(availableServices.map((s) => s.id));
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (availableServices.length === 0) {
		return (
			<div className="space-y-4">
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<Printer className="mb-4 h-12 w-12 text-muted-foreground" />
					<p className="font-medium">No services available</p>
					<p className="text-muted-foreground text-sm">
						All your printing services are already linked to this event, or you haven't created any yet.
					</p>
				</div>
				<div className="flex justify-end border-t pt-4">
					<Button
						variant="outline"
						onClick={closeDialog}
						className="rounded-none"
					>
						Close
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between border-b pb-2">
				<p className="text-muted-foreground text-sm">
					Select printing services to link to this event
				</p>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleSelectAll}
					className="h-8 rounded-none text-xs"
				>
					{selectedIds.length === availableServices.length
						? "Deselect All"
						: "Select All"}
				</Button>
			</div>

			<div className="max-h-[300px] space-y-2 overflow-y-auto">
				{availableServices.map((service) => (
					<ServiceItem
						key={service.id}
						service={service}
						isSelected={selectedIds.includes(service.id)}
						onToggle={() => handleToggle(service.id)}
					/>
				))}
			</div>

			<div className="flex items-center justify-between border-t pt-4">
				<p className="text-muted-foreground text-sm">
					{selectedIds.length} service{selectedIds.length !== 1 ? "s" : ""} selected
				</p>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={closeDialog}
						disabled={isPending}
						className="rounded-none"
					>
						Cancel
					</Button>
					<Button
						onClick={() => onConfirm(selectedIds)}
						disabled={isPending || selectedIds.length === 0}
						className="rounded-none"
					>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Link {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
					</Button>
				</div>
			</div>
		</div>
	);
}

function ServiceItem({
	service,
	isSelected,
	onToggle,
}: {
	service: PrintingService;
	isSelected: boolean;
	onToggle: () => void;
}) {
	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onToggle}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onToggle();
				}
			}}
			className={cn(
				"flex w-full cursor-pointer items-center gap-3 rounded-none border p-3 text-left transition-colors",
				isSelected
					? "border-primary bg-primary/5"
					: "border-border hover:bg-muted/50",
			)}
		>
			<Checkbox
				checked={isSelected}
				className="rounded-none pointer-events-none"
			/>
			<div className="flex-1 min-w-0">
				<p className="font-medium text-sm truncate">{service.name}</p>
				{service.description && (
					<p className="text-muted-foreground text-xs truncate">
						{service.description}
					</p>
				)}
				<p className="text-muted-foreground text-xs">
					RM {Number(service.defaultPrice).toFixed(2)} / {service.unitOfMeasure}
				</p>
			</div>
			{isSelected && (
				<Check className="h-4 w-4 shrink-0 text-primary" />
			)}
		</div>
	);
}
