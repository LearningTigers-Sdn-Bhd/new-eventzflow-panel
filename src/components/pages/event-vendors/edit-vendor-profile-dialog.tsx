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
import ImageUpload from "@/components/file-upload/image-upload";

interface EditVendorProfileDialogProps {
	profile: VendorProfile;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditVendorProfileDialog({
	profile,
	open,
	onOpenChange,
}: EditVendorProfileDialogProps) {
	const [description, setDescription] = useState(profile.description || "");
	const [imagePath, setImagePath] = useState(profile.image_path || "");
	const [image, setImage] = useState<File | null>(null);
	const [removeImage, setRemoveImage] = useState(false);
	const [category, setCategory] = useState(profile.category || "");
	const [personInCharge, setPersonInCharge] = useState(profile.person_in_charge || "");
	const [address, setAddress] = useState(profile.address || "");
	const [notes, setNotes] = useState(profile.notes || "");
	const updateProfile = useUpdateVendorProfile();

	useEffect(() => {
		if (open) {
			setDescription(profile.description || "");
			setImagePath(profile.image_path || "");
			setImage(null);
			setRemoveImage(false);
			setCategory(profile.category || "");
			setPersonInCharge(profile.person_in_charge || "");
			setAddress(profile.address || "");
			setNotes(profile.notes || "");
		}
	}, [profile, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await updateProfile.mutateAsync({
				description: description || undefined,
				image: image || undefined,
				image_path: removeImage ? "" : undefined, // Explicitly set empty string to remove
				category: category || undefined,
				person_in_charge: personInCharge || undefined,
				address: address || undefined,
				notes: notes || undefined,
			});
			toast.success("Profile updated successfully");
			onOpenChange(false);
		} catch (error) {
			toast.error("Failed to update profile");
		}
	};

	const handleImageChange = (file: File | null) => {
		setImage(file);
		if (file === null && imagePath) {
			// User removed the existing image
			setRemoveImage(true);
			setImagePath("");
		} else if (file !== null) {
			// User uploaded a new image
			setRemoveImage(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[600px]">
				<DialogHeader className="p-6 pb-2">
					<DialogTitle>Edit Vendor Profile</DialogTitle>
					<DialogDescription>
						Update vendor marketing information.
					</DialogDescription>
				</DialogHeader>
				
				<div className="flex-1 overflow-y-auto p-6 pt-2">
					<form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label>Vendor Image</Label>
							<ImageUpload
								value={image || imagePath}
								onChange={handleImageChange}
								disabled={updateProfile.isPending}
							/>
						</div>
						
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Input
									id="category"
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									placeholder="e.g., Food & Beverage"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="personInCharge">Person in Charge</Label>
								<Input
									id="personInCharge"
									value={personInCharge}
									onChange={(e) => setPersonInCharge(e.target.value)}
									placeholder="Contact person name"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Enter vendor description"
								rows={4}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="address">Address</Label>
							<Textarea
								id="address"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								placeholder="Enter business address"
								rows={2}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="notes">Notes</Label>
							<Textarea
								id="notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Additional notes"
								rows={2}
							/>
						</div>
					</form>
				</div>

				<DialogFooter className="mt-auto border-t p-6 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={updateProfile.isPending}
					>
						Cancel
					</Button>
					<Button 
						type="submit" 
						form="edit-profile-form"
						disabled={updateProfile.isPending}
					>
						{updateProfile.isPending ? "Updating..." : "Update Profile"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
