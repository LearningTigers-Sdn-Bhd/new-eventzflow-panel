"use client";

import { useQuery } from "@tanstack/react-query";
import { Mail, Pencil, Phone, User2 } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { getContractor } from "@/lib/api/contractor";
import { ContractorEditProfileContent } from "./contractor-edit-profile-dialog";

interface ContractorProfileViewProps {
	eventId: string;
}

export function ContractorProfileView({ eventId }: ContractorProfileViewProps) {
	const { user } = useAuth();
	const { openDialog, closeDialog } = useDialog();

	const {
		data: contractor,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["contractor", user?.id],
		queryFn: () => getContractor(user!.id),
		enabled: !!user?.id,
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading contractor profile..."
				description="Please wait while we fetch your profile information..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load profile"
				description="We couldn't load your contractor profile. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	if (!contractor) {
		return (
			<ErrorState
				title="Profile not found"
				description="Your contractor profile doesn't exist."
			/>
		);
	}

	const profile = contractor.exhibition_contractor_profile;

	const handleEditProfile = () => {
		openDialog({
			component: ContractorEditProfileContent,
			props: {
				contractor,
			},
			config: {
				title: "Edit Profile",
				description: "Update your contact details",
				size: "md",
			},
		});
	};

	return (
		<section className="space-y-6 border-t border-dashed">
			<div className="flex flex-col gap-3 border-b border-dashed p-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
						Contractor Profile
					</p>
					<h2 className="font-semibold text-2xl tracking-tight">
						{contractor.full_name}
					</h2>
					<p className="text-muted-foreground text-sm">
						Exhibition contractor profile and company information
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge
						variant="outline"
						className={`rounded-none px-2 py-0.5 font-medium text-xs capitalize ${
							contractor.status === "active"
								? "border-green-500 text-green-600"
								: "border-red-500 text-red-600"
						}`}
					>
						{contractor.status}
					</Badge>
					<Button
						variant="outline"
						size="sm"
						onClick={handleEditProfile}
						className="rounded-none"
					>
						<Pencil className="mr-2 h-4 w-4" />
						Edit Profile
					</Button>
				</div>
			</div>

			<div className="p-4">
				<div className="border bg-background/60 p-4">
					<div className="grid gap-8 md:grid-cols-2">
						<div className="space-y-3">
							<p className="font-medium text-muted-foreground text-xs uppercase">
								Account Information
							</p>
							<div className="space-y-3 text-sm">
								<div className="flex items-start gap-3">
									<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div>
										<p className="font-medium text-muted-foreground text-xs uppercase">
											Email
										</p>
										<p>{contractor.email}</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div>
										<p className="font-medium text-muted-foreground text-xs uppercase">
											Phone
										</p>
										{contractor.phone ? (
											<p>{contractor.phone}</p>
										) : (
											<p className="text-muted-foreground/60 text-sm italic">
												Not provided
											</p>
										)}
									</div>
								</div>
							</div>
						</div>

						{profile && (
							<div className="space-y-3 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-8">
								<p className="font-medium text-muted-foreground text-xs uppercase">
									Contact Details
								</p>
								<div className="space-y-3 text-sm">
									<div className="flex items-start gap-3">
										<User2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div>
											<p className="font-medium text-muted-foreground text-xs uppercase">
												Contact Person
											</p>
											<p>{profile.contact_person || "-"}</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div>
											<p className="font-medium text-muted-foreground text-xs uppercase">
												Contact Email
											</p>
											<p>{profile.contact_email || "-"}</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div>
											<p className="font-medium text-muted-foreground text-xs uppercase">
												Contact Phone
											</p>
											<p>{profile.contact_phone || "-"}</p>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
