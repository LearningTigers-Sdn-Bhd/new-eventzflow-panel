"use client";

import { useState } from "react";
import { Search, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDialog } from "@/hooks/use-dialog";
import type { PrintingService } from "@/lib/api/printing-service";

interface LinkServiceDialogProps {
	availableServices: PrintingService[];
	onLink: (printingServiceId: number) => void;
}

export function LinkServiceDialog({
	availableServices,
	onLink,
}: LinkServiceDialogProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const { closeDialog } = useDialog();

	const filteredServices = availableServices.filter(
		(service) =>
			service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			service.itemCategory?.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleLink = (serviceId: number) => {
		onLink(serviceId);
	};

	return (
		<div className="space-y-4">
			<div className="relative">
				<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search services..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="h-9 rounded-none pl-9"
				/>
			</div>

			<div className="max-h-[400px] space-y-2 overflow-y-auto">
				{filteredServices.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<Printer className="mb-2 h-8 w-8 text-muted-foreground" />
						<p className="text-muted-foreground text-sm">
							{searchQuery
								? "No services found matching your search"
								: "No available services to link"}
						</p>
					</div>
				) : (
					filteredServices.map((service) => (
						<div
							key={service.id}
							className="flex items-start justify-between gap-4 rounded-none border p-4"
						>
							<div className="flex-1 space-y-1">
								<div className="flex items-center gap-2">
									<h4 className="font-medium">{service.name}</h4>
									{service.itemCategory && (
										<Badge variant="outline" className="rounded-none">
											{service.itemCategory.name}
										</Badge>
									)}
								</div>
								{service.description && (
									<p className="text-muted-foreground text-sm">
										{service.description}
									</p>
								)}
								<div className="flex items-center gap-4 text-muted-foreground text-xs">
									<span>Unit: {service.unitOfMeasure}</span>
									<span>Default Price: RM {Number(service.defaultPrice).toFixed(2)}</span>
								</div>
							</div>
							<Button
								size="sm"
								onClick={() => handleLink(service.id)}
								className="shrink-0 rounded-none"
							>
								Link
							</Button>
						</div>
					))
				)}
			</div>

			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					variant="outline"
					onClick={closeDialog}
					className="rounded-none"
				>
					Cancel
				</Button>
			</div>
		</div>
	);
}
