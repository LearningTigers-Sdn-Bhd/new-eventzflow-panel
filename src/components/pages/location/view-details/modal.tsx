"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BaseLocation } from "../columns";

interface ViewDetailsDialogProps {
	location: BaseLocation;
}

export default function ViewDetailsDialog({ location }: ViewDetailsDialogProps) {
	const staffCount = location.staffMembers?.length || 0;
	const vendorCount = location.vendors?.length || 0;
	const totalMembers = staffCount + vendorCount;

	// Get location details excluding notes
	const additionalDetails = location.locationDetails
		? Object.entries(location.locationDetails).filter(([key]) => key !== "notes")
		: [];

	return (
		<div className="flex flex-col gap-6">
			{/* Basic Info */}
			<div className="space-y-3">
				<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
					Location Information
				</h3>
				<div className="space-y-2">
					<div className="flex items-start justify-between">
						<span className="text-muted-foreground text-sm">Name:</span>
						<span className="text-right font-medium text-sm">
							{location.locationDisplayName || location.name}
						</span>
					</div>
					{location.floor && (
						<div className="flex items-start justify-between">
							<span className="text-muted-foreground text-sm">Floor:</span>
							<span className="font-medium text-sm">{location.floor}</span>
						</div>
					)}
					<div className="flex items-start justify-between">
						<span className="text-muted-foreground text-sm">Scan Limit:</span>
						<span className="font-medium text-sm">
							{location.isUnlimited ? "Unlimited" : location.scanLimit}
						</span>
					</div>
				</div>
			</div>

			<Separator />

			{/* Members Summary */}
			<div className="space-y-3">
				<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
					Assigned Members
				</h3>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">Staff:</span>
						<div className="flex items-center gap-2">
							<span className="font-medium text-sm">{staffCount}</span>
							{staffCount > 0 && (
								<Badge
									variant="outline"
									className="border-blue-500 bg-blue-50 text-blue-700 text-xs"
								>
									Staff
								</Badge>
							)}
						</div>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">Vendors:</span>
						<div className="flex items-center gap-2">
							<span className="font-medium text-sm">{vendorCount}</span>
							{vendorCount > 0 && (
								<Badge
									variant="outline"
									className="border-green-500 bg-green-50 text-green-700 text-xs"
								>
									Vendor
								</Badge>
							)}
						</div>
					</div>
					<div className="flex items-center justify-between border-t pt-1">
						<span className="font-semibold text-sm">Total Members:</span>
						<span className="font-semibold text-sm">{totalMembers}</span>
					</div>
				</div>
			</div>

			{/* Additional Details */}
			{additionalDetails.length > 0 && (
				<>
					<Separator />
					<div className="space-y-3">
						<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
							Additional Details
						</h3>
						<div className="space-y-2">
							{additionalDetails.map(([key, value]) => (
								<div key={key} className="flex items-start justify-between">
									<span className="text-muted-foreground text-sm capitalize">
										{key.replace(/_/g, " ")}:
									</span>
									<span className="text-right font-medium text-sm">{value}</span>
								</div>
							))}
						</div>
					</div>
				</>
			)}

			{/* Notes */}
			{location.locationDetails?.notes && (
				<>
					<Separator />
					<div className="space-y-3">
						<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
							Notes
						</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">
							{location.locationDetails.notes}
						</p>
					</div>
				</>
			)}
		</div>
	);
}

