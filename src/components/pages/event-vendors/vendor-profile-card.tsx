"use client";

import { useState } from "react";
import type { VendorProfile } from "@/lib/api/vendor-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { EditVendorProfileDialog } from "./edit-vendor-profile-dialog";

interface VendorProfileCardProps {
	eventId: number;
	vendorId: number;
	profile: VendorProfile;
}

export function VendorProfileCard({ eventId, vendorId, profile }: VendorProfileCardProps) {
	const { user } = useAuth();
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	// Vendors can only edit their own profile
	const canEditProfile = user?.id === profile.vendor_id;

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Profile Information</CardTitle>
							<CardDescription>Vendor marketing content</CardDescription>
						</div>
						{canEditProfile && (
							<Button size="sm" onClick={() => setIsEditDialogOpen(true)}>
								<Edit className="mr-2 h-4 w-4" />
								Edit
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{profile.image_path && (
						<div>
							<img
								src={profile.image_path}
								alt={profile.vendor_name}
								className="h-48 w-full rounded-lg object-cover"
							/>
						</div>
					)}
					<div>
						<p className="text-sm font-medium text-muted-foreground">Vendor Name</p>
						<p className="text-lg font-semibold">{profile.vendor_name}</p>
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground">Description</p>
						<p className="text-sm">{profile.vendor_description || "No description"}</p>
					</div>
				</CardContent>
			</Card>

			<EditVendorProfileDialog
				eventId={eventId}
				vendorId={vendorId}
				profile={profile}
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
			/>
		</>
	);
}
