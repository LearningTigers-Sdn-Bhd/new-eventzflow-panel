"use client";

import { useQuery } from "@tanstack/react-query";
import { HardHat, Plus, Phone, Mail, User } from "lucide-react";
import { ErrorState, LoadingState, EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDialog } from "@/hooks/use-dialog";
import { getEventExhibitionContractor } from "@/lib/api/event-exhibition-contractor";
import { getContractors } from "@/lib/api/contractor";
import { AssignContractorDialog } from "./assign-contractor-dialog";

interface ExhibitorContractorViewProps {
	eventId: string;
}

export function ExhibitorContractorView({ eventId }: ExhibitorContractorViewProps) {
	const { openDialog, closeDialog } = useDialog();

	// Fetch the assigned contractor for this event
	const {
		data: eventContractor,
		isLoading: isLoadingEventContractor,
		error: eventContractorError,
	} = useQuery({
		queryKey: ["event", eventId, "exhibition-contractor"],
		queryFn: () => getEventExhibitionContractor(Number(eventId)),
	});

	// Fetch all contractors to get the details
	const {
		data: allContractors,
		isLoading: isLoadingContractors,
	} = useQuery({
		queryKey: ["contractors"],
		queryFn: () => getContractors(),
	});

	// Find the assigned contractor details
	const assignedContractor = allContractors?.find(
		(c) => c.exhibition_contractor_profile?.id === eventContractor?.exhibition_contractor_profile_id
	);

	const isLoading = isLoadingEventContractor || isLoadingContractors;

	const handleAssignContractor = () => {
		openDialog({
			component: AssignContractorDialog,
			props: {
				eventId: Number(eventId),
				onClose: closeDialog,
			},
			config: {
				title: "Assign Exhibitor Contractor",
				description: "Select an exhibitor contractor to assign to this event.",
				size: "lg",
			},
		});
	};

	if (isLoading) {
		return (
			<LoadingState
				title="Loading exhibitor contractor..."
				description="Please wait while we fetch the assigned contractor..."
			/>
		);
	}

	if (eventContractorError) {
		return (
			<ErrorState
				title="Failed to load exhibitor contractor"
				description="We couldn't load the exhibitor contractor information. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	// No contractor assigned
	if (!eventContractor || !assignedContractor) {
		return (
			<div className="p-4 border-t border-dashed">
				<EmptyState
					icon={<HardHat className="h-12 w-12" />}
					title="No Exhibitor Contractor Assigned"
					description="Assign an exhibitor contractor to manage booth setups and exhibitor services for this event."
					action={
						<Button onClick={handleAssignContractor} className="rounded-none">
							<Plus className="mr-2 h-4 w-4" />
							Assign Contractor
						</Button>
					}
				/>
			</div>
		);
	}

	const profile = assignedContractor.exhibition_contractor_profile;

	return (
		<div className="space-y-6 p-4 border-t border-dashed">
			{/* Contractor Card */}
			<Card className="rounded-none border-dashed">
				<CardHeader className="pb-4">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-none bg-primary/10">
								<HardHat className="h-6 w-6 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg">
									{profile?.company_name || assignedContractor.full_name}
								</CardTitle>
								<CardDescription>
									Exhibitor Contractor
								</CardDescription>
							</div>
						</div>
						<Badge 
							variant="outline" 
							className={`rounded-none ${
								assignedContractor.status === "active" 
									? "border-green-500 text-green-500" 
									: "border-gray-500 text-gray-500"
							}`}
						>
							{assignedContractor.status}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Contact Information */}
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{profile?.contact_person && (
							<div className="flex items-center gap-3 rounded-none border border-dashed p-3">
								<User className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-xs text-muted-foreground">Contact Person</p>
									<p className="text-sm font-medium">{profile.contact_person}</p>
								</div>
							</div>
						)}
						
						<div className="flex items-center gap-3 rounded-none border border-dashed p-3">
							<Mail className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">Email</p>
								<p className="text-sm font-medium">{profile?.contact_email || assignedContractor.email}</p>
							</div>
						</div>

						<div className="flex items-center gap-3 rounded-none border border-dashed p-3">
							<Phone className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">Phone</p>
								<p className="text-sm font-medium">{profile?.contact_phone || assignedContractor.phone || "-"}</p>
							</div>
						</div>
					</div>

				</CardContent>
			</Card>
		</div>
	);
}

