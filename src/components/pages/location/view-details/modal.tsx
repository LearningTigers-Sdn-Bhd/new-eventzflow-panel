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
				<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
					Location Information
				</h3>
				<div className="space-y-2">
					<div className="flex justify-between items-start">
						<span className="text-sm text-muted-foreground">Name:</span>
						<span className="text-sm font-medium text-right">
							{location.locationDisplayName || location.name}
						</span>
					</div>
					{location.floor && (
						<div className="flex justify-between items-start">
							<span className="text-sm text-muted-foreground">Floor:</span>
							<span className="text-sm font-medium">{location.floor}</span>
						</div>
					)}
					<div className="flex justify-between items-start">
						<span className="text-sm text-muted-foreground">Scan Limit:</span>
						<span className="text-sm font-medium">
							{location.isUnlimited ? "Unlimited" : location.scanLimit}
						</span>
					</div>
				</div>
			</div>

			<Separator />

			{/* Members Summary */}
			<div className="space-y-3">
				<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
					Assigned Members
				</h3>
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<span className="text-sm text-muted-foreground">Staff:</span>
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">{staffCount}</span>
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
					<div className="flex justify-between items-center">
						<span className="text-sm text-muted-foreground">Vendors:</span>
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">{vendorCount}</span>
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
					<div className="flex justify-between items-center pt-1 border-t">
						<span className="text-sm font-semibold">Total Members:</span>
						<span className="text-sm font-semibold">{totalMembers}</span>
					</div>
				</div>
			</div>

			{/* Additional Details */}
			{additionalDetails.length > 0 && (
				<>
					<Separator />
					<div className="space-y-3">
						<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
							Additional Details
						</h3>
						<div className="space-y-2">
							{additionalDetails.map(([key, value]) => (
								<div key={key} className="flex justify-between items-start">
									<span className="text-sm text-muted-foreground capitalize">
										{key.replace(/_/g, " ")}:
									</span>
									<span className="text-sm font-medium text-right">{value}</span>
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
						<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
							Notes
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{location.locationDetails.notes}
						</p>
					</div>
				</>
			)}
		</div>
	);
}

