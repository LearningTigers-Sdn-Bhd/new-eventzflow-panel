"use client";

import { useState, useEffect } from "react";
import { useUpdateVendorProfile } from "@/hooks/use-vendor-profile";
import type { VendorProfile } from "@/lib/api/vendor-profile";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditVendorProfileDialogProps {
	eventId: number;
	vendorId: number;
	profile: VendorProfile;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditVendorProfileDialog({
	eventId,
	vendorId,
	profile,
	open,
	onOpenChange,
}: EditVendorProfileDialogProps) {
	const [vendorName, setVendorName] = useState(profile.vendor_name);
	const [vendorDescription, setVendorDescription] = useState(profile.vendor_description || "");
	const [imagePath, setImagePath] = useState(profile.image_path || "");
	const updateProfile = useUpdateVendorProfile();

	useEffect(() => {
		setVendorName(profile.vendor_name);
		setVendorDescription(profile.vendor_description || "");
		setImagePath(profile.image_path || "");
	}, [profile]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await updateProfile.mutateAsync({
				eventId,
				vendorId,
				data: {
					vendor_name: vendorName,
					vendor_description: vendorDescription || undefined,
					image_path: imagePath || undefined,
				},
			});
			toast.success("Profile updated successfully");
			onOpenChange(false);
		} catch (error) {
			toast.error("Failed to update profile");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Vendor Profile</DialogTitle>
					<DialogDescription>
						Update vendor marketing information.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="vendorName">Vendor Name</Label>
							<Input
								id="vendorName"
								value={vendorName}
								onChange={(e) => setVendorName(e.target.value)}
								placeholder="Enter vendor name"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="vendorDescription">Description</Label>
							<Textarea
								id="vendorDescription"
								value={vendorDescription}
								onChange={(e) => setVendorDescription(e.target.value)}
								placeholder="Enter vendor description"
								rows={3}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="imagePath">Image URL</Label>
							<Input
								id="imagePath"
								value={imagePath}
								onChange={(e) => setImagePath(e.target.value)}
								placeholder="https://example.com/image.jpg"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={updateProfile.isPending}>
							{updateProfile.isPending ? "Updating..." : "Update Profile"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
