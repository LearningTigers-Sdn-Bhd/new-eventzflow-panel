"use client";

import { AlertTriangle, Car, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { VehicleRegistration } from "@/lib/api/vehicle-registration";
import { VehicleIssuesBadge } from "./vehicle-issues-badge";

interface VehicleDetailSheetProps {
	vehicle: VehicleRegistration | null;
	onOpenChange: (open: boolean) => void;
}

export function VehicleDetailSheet({
	vehicle,
	onOpenChange,
}: VehicleDetailSheetProps) {
	return (
		<Sheet open={Boolean(vehicle)} onOpenChange={onOpenChange}>
			<SheetContent className="w-full gap-0 p-0 sm:max-w-xl">
				<SheetHeader className="shrink-0 border-b">
					<SheetTitle className="flex items-center gap-2 text-lg">
						<Car className="size-5" />
						{vehicle?.plate ?? "Vehicle details"}
					</SheetTitle>
					<SheetDescription>
						{vehicle?.registrationForm.name ?? "No group"}
					</SheetDescription>
				</SheetHeader>
				{vehicle && (
					<div className="flex-1 space-y-6 overflow-y-auto p-4">
						{/* Summary */}
						<div className="flex flex-wrap items-center gap-2">
							<Badge
								variant="outline"
								className="gap-1 rounded-none font-medium"
							>
								<Users className="size-3" />
								{vehicle.seatsUsed}/{vehicle.capacity ?? "?"} seats
							</Badge>
							<VehicleIssuesBadge issues={vehicle.issues} />
						</div>

						{/* Crew */}
						<section className="space-y-2">
							<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
								Crew ({vehicle.crew.length})
							</h3>
							{vehicle.crew.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									No crew assigned to this vehicle.
								</p>
							) : (
								<ul className="divide-y rounded-none border">
									{vehicle.crew.map((member) => (
										<li
											key={member.ticketId}
											className="flex flex-col gap-0.5 px-3 py-2.5"
										>
											<span className="font-medium text-sm">{member.name}</span>
											<span className="text-muted-foreground text-xs">
												{[member.role, member.ticketTypeName]
													.filter(Boolean)
													.join(" · ")}
											</span>
										</li>
									))}
								</ul>
							)}
						</section>

						{/* Issues */}
						<section className="space-y-2">
							<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
								Issues ({vehicle.issues.length})
							</h3>
							{vehicle.issues.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									No issues detected for this vehicle.
								</p>
							) : (
								<ul className="space-y-2">
									{vehicle.issues.map((issue) => (
										<li
											key={`${issue.code}-${issue.ticketId ?? "vehicle"}`}
											className="flex items-start gap-2 rounded-none border border-amber-200 bg-amber-50 px-3 py-2.5"
										>
											<AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
											<span className="text-amber-800 text-sm leading-snug">
												{issue.message}
											</span>
										</li>
									))}
								</ul>
							)}
						</section>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
