"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	Building2,
	FileText,
	ImageIcon,
	Loader2,
	MapPin,
} from "lucide-react";
import ImageUpload from "@/components/file-upload/image-upload";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateVendorProfile } from "@/hooks/use-vendor-profile";
import type { VendorProfile } from "@/lib/api/vendor-profile";

const VENDOR_CATEGORIES = [
	"Food & Beverage",
	"Merchandise",
	"Services",
	"Entertainment",
	"Beauty & Wellness",
	"Travel & Transport",
	"Electronics",
	"Fashion & Apparel",
	"Health & Fitness",
	"Education",
	"Photography & Media",
	"Event Services",
	"Manufacturing",
	"Technology",
	"Automotive",
	"Real Estate",
	"Finance & Banking",
	"Others",
] as const;

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
	const [imageUrl, setImageUrl] = useState(profile.image_url || "");
	const [image, setImage] = useState<File | null>(null);
	const [removeImage, setRemoveImage] = useState(false);
	const [category, setCategory] = useState(profile.category || "");
	const [customCategory, setCustomCategory] = useState("");
	const [showCustomCategory, setShowCustomCategory] = useState(false);
	const [personInCharge, setPersonInCharge] = useState(
		profile.person_in_charge || "",
	);
	const [address, setAddress] = useState(profile.address || "");
	const [notes, setNotes] = useState(profile.notes || "");
	const [companyProfile, setCompanyProfile] = useState(
		profile.company_profile || "",
	);
	const updateProfile = useUpdateVendorProfile();

	useEffect(() => {
		if (open) {
			setDescription(profile.description || "");
			setImageUrl(profile.image_url || "");
			setImage(null);
			setRemoveImage(false);

			// Check if current category is in the list or custom
			const currentCategory = profile.category || "";
			const isPresetCategory = VENDOR_CATEGORIES.includes(currentCategory as typeof VENDOR_CATEGORIES[number]);

			if (isPresetCategory) {
				setCategory(currentCategory);
				setCustomCategory("");
				setShowCustomCategory(false);
			} else if (currentCategory) {
				setCategory("Others");
				setCustomCategory(currentCategory);
				setShowCustomCategory(true);
			} else {
				setCategory("");
				setCustomCategory("");
				setShowCustomCategory(false);
			}

			setPersonInCharge(profile.person_in_charge || "");
			setAddress(profile.address || "");
			setNotes(profile.notes || "");
			setCompanyProfile(profile.company_profile || "");
		}
	}, [profile, open]);

	const handleCategoryChange = (value: string) => {
		setCategory(value);
		if (value === "Others") {
			setShowCustomCategory(true);
		} else {
			setShowCustomCategory(false);
			setCustomCategory("");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Determine final category value
		const finalCategory = category === "Others" && customCategory
			? customCategory
			: category;

		try {
			await updateProfile.mutateAsync({
				description,
				image: image || undefined,
				remove_image: removeImage || undefined,
				category: finalCategory,
				person_in_charge: personInCharge,
				address,
				notes,
				company_profile: companyProfile,
			});
			toast.success("Profile updated successfully");
			onOpenChange(false);
		} catch (error) {
			toast.error("Failed to update profile");
		}
	};

	const handleImageChange = (file: File | null) => {
		setImage(file);
		if (file === null && imageUrl) {
			// User removed the existing image
			setRemoveImage(true);
			setImageUrl("");
		} else if (file !== null) {
			// User uploaded a new image
			setRemoveImage(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[600px] rounded-none">
				<DialogHeader className="p-6 pb-4 border-b">
					<DialogTitle>Edit Vendor Profile</DialogTitle>
					<DialogDescription>
						Update your business information and marketing details.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-6">
					<form
						id="edit-profile-form"
						onSubmit={handleSubmit}
						className="space-y-6"
					>
						{/* Business Details Section */}
						<div className="space-y-4 rounded-none border bg-background p-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<Building2 className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Business Details
								</h3>
							</div>

							<div className="space-y-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="category">Business Category</Label>
										<Select value={category} onValueChange={handleCategoryChange}>
											<SelectTrigger className="h-10 w-full rounded-none">
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
											<SelectContent className="rounded-none">
												{VENDOR_CATEGORIES.map((cat) => (
													<SelectItem key={cat} value={cat}>
														{cat}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{showCustomCategory && (
										<div className="space-y-2">
											<Label htmlFor="customCategory">Custom Category Name</Label>
											<Input
												id="customCategory"
												value={customCategory}
												onChange={(e) => setCustomCategory(e.target.value)}
												placeholder="Enter your category"
												className="rounded-none"
											/>
										</div>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="personInCharge">Person In Charge</Label>
									<Input
										id="personInCharge"
										value={personInCharge}
										onChange={(e) => setPersonInCharge(e.target.value)}
										placeholder="Contact person name"
										className="rounded-none"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">Business Information / Products / Projects / Services to be Exhibited</Label>
									<div className="relative">
										<FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Textarea
											id="description"
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="Describe the products, projects, or services you will be exhibiting..."
											rows={3}
											className="rounded-none resize-none pl-10"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Company Profile Section */}
						<div className="space-y-4 rounded-none border bg-background p-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<FileText className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Company Profile
								</h3>
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="companyProfile">Company Profile</Label>
									<Textarea
										id="companyProfile"
										value={companyProfile}
										onChange={(e) => setCompanyProfile(e.target.value)}
										placeholder="Brief description of your company, history, and expertise..."
										rows={3}
										className="rounded-none resize-none"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="address">Business Address</Label>
									<div className="relative">
										<MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Textarea
											id="address"
											value={address}
											onChange={(e) => setAddress(e.target.value)}
											placeholder="Your business address"
											rows={2}
											className="rounded-none resize-none pl-10"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="notes">Wishing to Connect With (Sector's) / Additional Notes</Label>
									<Textarea
										id="notes"
										value={notes}
										onChange={(e) => setNotes(e.target.value)}
										placeholder="Sectors or types of businesses you'd like to connect with, or any additional notes..."
										rows={2}
										className="rounded-none resize-none"
									/>
								</div>
							</div>
						</div>

						{/* Profile Image Section */}
						<div className="space-y-4 rounded-none border bg-background p-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<ImageIcon className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Profile Image
								</h3>
							</div>

							<div className="space-y-2">
								<Label>Vendor Profile Image</Label>
								<p className="text-muted-foreground text-xs">
									Upload your company logo or profile image (max 5MB)
								</p>
								<ImageUpload
									value={image || imageUrl}
									onChange={handleImageChange}
									disabled={updateProfile.isPending}
								/>
							</div>
						</div>
					</form>
				</div>

				<DialogFooter className="border-t p-6 pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={updateProfile.isPending}
						className="rounded-none"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="edit-profile-form"
						disabled={updateProfile.isPending}
						className="rounded-none"
					>
						{updateProfile.isPending ? (
							<>
								<Loader2 className="size-4 animate-spin mr-2" />
								Saving...
							</>
						) : (
							"Save Changes"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
