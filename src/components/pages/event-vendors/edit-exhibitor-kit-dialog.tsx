"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExhibitorKit } from "@/lib/api/exhibitor-kit";
import type { ExhibitorKit } from "@/lib/api/exhibitor-kit";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
	Building2,
	FileText,
	MapPin,
	User,
	Loader2,
} from "lucide-react";

interface EditExhibitorKitDialogProps {
	eventId: number;
	kit: ExhibitorKit;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditExhibitorKitDialog({
	eventId,
	kit,
	open,
	onOpenChange,
}: EditExhibitorKitDialogProps) {
	const queryClient = useQueryClient();

	// Booth information
	const [boothDimensions, setBoothDimensions] = useState(kit.booth_dimensions || "");
	const [sideWallLeftRequired, setSideWallLeftRequired] = useState(kit.side_wall_left_required || false);
	const [sideWallRightRequired, setSideWallRightRequired] = useState(kit.side_wall_right_required || false);
	const [nameOnFascia, setNameOnFascia] = useState(kit.name_on_fascia || "");
	const [fasciaUpgradeRequired, setFasciaUpgradeRequired] = useState(kit.fascia_upgrade_required || false);

	// Company information
	const [companyAddress, setCompanyAddress] = useState(kit.company_address || "");

	// PIC information
	const [picFullName, setPicFullName] = useState(kit.pic_full_name || "");
	const [picContactNumber, setPicContactNumber] = useState(kit.pic_contact_number || "");
	const [picEmailAddress, setPicEmailAddress] = useState(kit.pic_email_address || "");

	// Other
	const [specialRequirements, setSpecialRequirements] = useState(kit.special_requirements || "");
	const [digitalBrochureLink, setDigitalBrochureLink] = useState(kit.digital_brochure_link || "");

	// Reset form when dialog opens
	useEffect(() => {
		if (open) {
			setBoothDimensions(kit.booth_dimensions || "");
			setSideWallLeftRequired(kit.side_wall_left_required || false);
			setSideWallRightRequired(kit.side_wall_right_required || false);
			setNameOnFascia(kit.name_on_fascia || "");
			setFasciaUpgradeRequired(kit.fascia_upgrade_required || false);
			setCompanyAddress(kit.company_address || "");
			setPicFullName(kit.pic_full_name || "");
			setPicContactNumber(kit.pic_contact_number || "");
			setPicEmailAddress(kit.pic_email_address || "");
			setSpecialRequirements(kit.special_requirements || "");
			setDigitalBrochureLink(kit.digital_brochure_link || "");
		}
	}, [kit, open]);

	const updateMutation = useMutation({
		mutationFn: (data: Parameters<typeof updateExhibitorKit>[2]) =>
			updateExhibitorKit(eventId, kit.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["event", String(eventId), "vendors"] });
			toast.success("Exhibitor kit updated successfully");
			onOpenChange(false);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update exhibitor kit");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		updateMutation.mutate({
			booth_dimensions: boothDimensions || undefined,
			side_wall_left_required: sideWallLeftRequired,
			side_wall_right_required: sideWallRightRequired,
			name_on_fascia: nameOnFascia || undefined,
			fascia_upgrade_required: fasciaUpgradeRequired,
			company_address: companyAddress || undefined,
			pic_full_name: picFullName || undefined,
			pic_contact_number: picContactNumber || undefined,
			pic_email_address: picEmailAddress || undefined,
			special_requirements: specialRequirements || undefined,
			digital_brochure_link: digitalBrochureLink || undefined,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[600px] rounded-none">
				<DialogHeader className="p-6 pb-4 border-b">
					<DialogTitle>Edit Exhibitor Kit</DialogTitle>
					<DialogDescription>
						Update your booth setup and contact information.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-6">
					<form id="edit-kit-form" onSubmit={handleSubmit} className="space-y-6">
						{/* Booth Information Section */}
						<div className="space-y-4 rounded-none border bg-background p-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<Building2 className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Booth Setup
								</h3>
							</div>

							<div className="space-y-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="boothDimensions">Booth Dimensions</Label>
										<Input
											id="boothDimensions"
											value={boothDimensions}
											onChange={(e) => setBoothDimensions(e.target.value)}
											placeholder="e.g., 3m x 3m"
											className="rounded-none"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="nameOnFascia">Name on Fascia</Label>
										<Input
											id="nameOnFascia"
											value={nameOnFascia}
											onChange={(e) => setNameOnFascia(e.target.value)}
											placeholder="Company name on booth"
											maxLength={25}
											className="rounded-none"
										/>
										<p className="text-xs text-muted-foreground">
											{nameOnFascia.length}/25 characters
										</p>
									</div>
								</div>

								{/* Toggle Options */}
								<div className="space-y-3 border-t pt-4">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="sideWallLeft" className="font-medium cursor-pointer">
												Left Side Wall
											</Label>
											<p className="text-xs text-muted-foreground">
												Request a panel on the left side
											</p>
										</div>
										<Switch
											id="sideWallLeft"
											checked={sideWallLeftRequired}
											onCheckedChange={setSideWallLeftRequired}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="sideWallRight" className="font-medium cursor-pointer">
												Right Side Wall
											</Label>
											<p className="text-xs text-muted-foreground">
												Request a panel on the right side
											</p>
										</div>
										<Switch
											id="sideWallRight"
											checked={sideWallRightRequired}
											onCheckedChange={setSideWallRightRequired}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="fasciaUpgrade" className="font-medium cursor-pointer">
												Fascia Upgrade
											</Label>
											<p className="text-xs text-muted-foreground">
												Upgrade to premium fascia signage
											</p>
										</div>
										<Switch
											id="fasciaUpgrade"
											checked={fasciaUpgradeRequired}
											onCheckedChange={setFasciaUpgradeRequired}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Company Address Section */}
						<div className="space-y-4 rounded-none border bg-background p-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<MapPin className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Company Address
								</h3>
							</div>

							<Textarea
								id="companyAddress"
								value={companyAddress}
								onChange={(e) => setCompanyAddress(e.target.value)}
								placeholder="Enter your full company address..."
								rows={3}
								className="rounded-none resize-none"
							/>
						</div>

						{/* Person In Charge Section */}
						<div className="space-y-4 rounded-none border bg-background p-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<User className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Person In Charge
								</h3>
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="picFullName">Full Name</Label>
									<Input
										id="picFullName"
										value={picFullName}
										onChange={(e) => setPicFullName(e.target.value)}
										placeholder="Contact person name"
										className="rounded-none"
									/>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="picContactNumber">Contact Number</Label>
										<Input
											id="picContactNumber"
											value={picContactNumber}
											onChange={(e) => setPicContactNumber(e.target.value)}
											placeholder="+60 12-345 6789"
											className="rounded-none"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="picEmailAddress">Email Address</Label>
										<Input
											id="picEmailAddress"
											type="email"
											value={picEmailAddress}
											onChange={(e) => setPicEmailAddress(e.target.value)}
											placeholder="contact@company.com"
											className="rounded-none"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Additional Information Section */}
						<div className="space-y-4 rounded-none border bg-background p-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<FileText className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Additional Information
								</h3>
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="digitalBrochureLink">Digital Brochure Link</Label>
									<Input
										id="digitalBrochureLink"
										type="url"
										value={digitalBrochureLink}
										onChange={(e) => setDigitalBrochureLink(e.target.value)}
										placeholder="https://example.com/brochure.pdf"
										className="rounded-none"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="specialRequirements">Special Requirements</Label>
									<Textarea
										id="specialRequirements"
										value={specialRequirements}
										onChange={(e) => setSpecialRequirements(e.target.value)}
										placeholder="Any special requirements or notes..."
										rows={3}
										className="rounded-none resize-none"
									/>
								</div>
							</div>
						</div>
					</form>
				</div>

				<DialogFooter className="border-t p-6 pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={updateMutation.isPending}
						className="rounded-none"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="edit-kit-form"
						disabled={updateMutation.isPending}
						className="rounded-none"
					>
						{updateMutation.isPending ? (
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
