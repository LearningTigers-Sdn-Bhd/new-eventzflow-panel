"use client";

import { useState } from "react";
import type { VendorProfile } from "@/lib/api/vendor-profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Mail, MapPin, Phone, StickyNote, User2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { EditVendorProfileDialog } from "./edit-vendor-profile-dialog";

interface VendorProfileCardProps {
	profile: VendorProfile;
}

export function VendorProfileCard({ profile }: VendorProfileCardProps) {
	const { user } = useAuth();
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	// Vendors can only edit their own profile
	const canEditProfile = user?.id === profile.vendor_id;

	return (
		<>
			<section className="space-y-6 border-t border-dashed">
				<div className="flex flex-col gap-3 border-b border-dashed p-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Vendor Profile
						</p>
						<h2 className="text-2xl font-semibold tracking-tight">
							{profile.vendor.full_name}
						</h2>
						<p className="text-sm text-muted-foreground">
							Marketing profile and contact information
						</p>
					</div>
					<div className="flex items-center gap-2">
						{profile.category && (
							<Badge variant="outline" className="px-2 py-0.5 text-xs font-medium">
								{profile.category}
							</Badge>
						)}
						{canEditProfile && (
							<Button size="sm" onClick={() => setIsEditDialogOpen(true)}>
								<Edit className="mr-2 h-4 w-4" />
								Edit
							</Button>
						)}
					</div>
				</div>

				<div className="grid gap-8 p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
					<div className="space-y-4">
						<div className="overflow-hidden rounded-xl border bg-muted/60">
							{profile.image_path ? (
								<img
									src={profile.image_path}
									alt={profile.vendor.full_name}
									className="h-105 w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
								/>
							) : (
								<div className="flex h-105 items-center justify-center text-xs text-muted-foreground">
									No image been added yet.
								</div>
							)}
						</div>
					</div>

					<div className="space-y-4 rounded-xl border bg-background/60 p-4">
						<div className="space-y-1 text-sm">
							<p className="text-xs font-medium uppercase text-muted-foreground">
								About
							</p>
							{profile.description ? (
								<p className="whitespace-pre-line leading-relaxed">
									{profile.description}
								</p>
							) : (
								<p className="text-sm italic text-muted-foreground/60">
									No description provided yet.
								</p>
							)}
						</div>

						<div className="space-y-3 border-t pt-4">
							<p className="text-xs font-medium uppercase text-muted-foreground">
								Contact
							</p>
							<div className="space-y-3 text-sm">
								<div className="flex items-start gap-3">
									<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs font-medium uppercase text-muted-foreground">Email</p>
										{profile.vendor.email ? (
											<p>{profile.vendor.email}</p>
										) : (
											<p className="text-sm italic text-muted-foreground/60">Not provided</p>
										)}
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs font-medium uppercase text-muted-foreground">Phone</p>
										{profile.vendor.phone ? (
											<p>{profile.vendor.phone}</p>
										) : (
											<p className="text-sm italic text-muted-foreground/60">Not provided</p>
										)}
									</div>
								</div>
								<div className="flex items-start gap-3">
									<User2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs font-medium uppercase text-muted-foreground">Person in Charge</p>
										{profile.person_in_charge ? (
											<p>{profile.person_in_charge}</p>
										) : (
											<p className="text-sm italic text-muted-foreground/60">Not provided</p>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-3 border-t pt-4">
							<p className="text-xs font-medium uppercase text-muted-foreground">
								Location &amp; Notes
							</p>
							<div className="space-y-3 text-sm">
								<div className="flex items-start gap-3">
									<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs font-medium uppercase text-muted-foreground">Address</p>
										{profile.address ? (
											<p className="whitespace-pre-line">{profile.address}</p>
										) : (
											<p className="text-sm italic text-muted-foreground/60">Not provided</p>
										)}
									</div>
								</div>
								<div className="flex items-start gap-3">
									<StickyNote className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs font-medium uppercase text-muted-foreground">Notes</p>
										{profile.notes ? (
											<p className="whitespace-pre-line">{profile.notes}</p>
										) : (
											<p className="text-sm italic text-muted-foreground/60">Not provided</p>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<EditVendorProfileDialog
				profile={profile}
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
			/>
		</>
	);
}
