"use client";

import { Car, Users } from "lucide-react";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import type { VehicleRegistration } from "@/lib/api/vehicle-registration";
import { VehicleActionsMenu } from "./vehicle-actions-menu";
import { VehicleIssuesBadge } from "./vehicle-issues-badge";

interface VehicleItemProps {
	eventId: string;
	vehicle: VehicleRegistration;
	onView?: (vehicle: VehicleRegistration) => void;
}

export function VehicleItem({ eventId, vehicle, onView }: VehicleItemProps) {
	return (
		<Item
			variant="default"
			className={`h-auto w-full flex-col items-stretch border-none px-3 py-3${onView ? "cursor-pointer" : ""}`}
			onClick={onView ? () => onView(vehicle) : undefined}
		>
			<div className="flex w-full items-start gap-2">
				<ItemMedia
					variant="image"
					className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-none border bg-blue-50 shadow-sm"
				>
					<Car className="size-4 text-blue-700" />
				</ItemMedia>
				<ItemContent className="ml-2.5 min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0 flex-1">
							<ItemTitle className="break-words font-bold text-[15px] leading-tight">
								{vehicle.plate}
							</ItemTitle>
							<ItemDescription className="mt-0.5">
								{vehicle.registrationForm.name ?? "No group"}
							</ItemDescription>
						</div>
						<div className="shrink-0 self-start pt-0.5">
							<VehicleIssuesBadge issues={vehicle.issues} />
						</div>
					</div>

					<ItemDescription className="mt-1.5 flex flex-col gap-1">
						<div className="flex items-center gap-1.5">
							<Users className="size-3.5 shrink-0 text-muted-foreground/70" />
							<span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
								{vehicle.seatsUsed}/{vehicle.capacity ?? "?"} seats
							</span>
						</div>

						{vehicle.crew.length > 0 && (
							<ul className="mt-1 space-y-0.5">
								{vehicle.crew.map((member) => (
									<li
										key={member.ticketId}
										className="break-words text-[11px] text-muted-foreground"
									>
										<span className="font-medium text-foreground">
											{member.name}
										</span>
										{member.role ? ` · ${member.role}` : ""}
										{member.ticketTypeName ? ` · ${member.ticketTypeName}` : ""}
									</li>
								))}
							</ul>
						)}

						{vehicle.issues.length > 0 && (
							<ul className="mt-1 space-y-0.5">
								{vehicle.issues.map((issue) => (
									<li
										key={`${issue.code}-${issue.ticketId ?? "car"}`}
										className="break-words text-[11px] text-amber-700"
									>
										{issue.message}
									</li>
								))}
							</ul>
						)}
					</ItemDescription>

					<div className="mt-2 flex justify-end">
						<ItemActions onClick={(e) => e.stopPropagation()}>
							<VehicleActionsMenu eventId={eventId} vehicle={vehicle} />
						</ItemActions>
					</div>
				</ItemContent>
			</div>
		</Item>
	);
}
