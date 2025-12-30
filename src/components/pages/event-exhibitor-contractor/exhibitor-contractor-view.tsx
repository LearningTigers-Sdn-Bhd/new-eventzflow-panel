"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, HardHat, Mail, Phone, Plus, User } from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useDialog } from "@/hooks/use-dialog";
import { getContractors } from "@/lib/api/contractor";
import { getEventExhibitionContractor } from "@/lib/api/event-exhibition-contractor";
import { AssignContractorDialog } from "./assign-contractor-dialog";

interface ExhibitorContractorViewProps {
	eventId: string;
}

export function ExhibitorContractorView({
	eventId,
}: ExhibitorContractorViewProps) {
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
	const { data: allContractors, isLoading: isLoadingContractors } = useQuery({
		queryKey: ["contractors"],
		queryFn: () => getContractors(),
	});

	// Find the assigned contractor details
	const assignedContractor = allContractors?.find(
		(c) =>
			c.exhibition_contractor_profile?.id ===
			eventContractor?.exhibition_contractor_profile_id,
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
			<div className="border-t border-dashed p-4">
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
		<div className="space-y-6 border-t border-dashed p-4">
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
									{assignedContractor.full_name}
								</CardTitle>
								<CardDescription>Exhibitor Contractor</CardDescription>
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
									<p className="text-muted-foreground text-xs">
										Contact Person
									</p>
									<p className="font-medium text-sm">
										{profile.contact_person}
									</p>
								</div>
							</div>
						)}

						<div className="flex items-center gap-3 rounded-none border border-dashed p-3">
							<Mail className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-xs">Email</p>
								<p className="font-medium text-sm">
									{profile?.contact_email || assignedContractor.email}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 rounded-none border border-dashed p-3">
							<Phone className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-xs">Phone</p>
								<p className="font-medium text-sm">
									{profile?.contact_phone || assignedContractor.phone || "-"}
								</p>
							</div>
						</div>
					</div>

					{/* Exhibitor Guidelines */}
					{profile?.guidelines_pdf_url && (
						<div className="border-t border-dashed pt-4">
							<p className="mb-3 font-semibold text-sm">
								Exhibitor Guidelines
							</p>
							<div className="flex items-center gap-4 border border-dashed p-4">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center bg-muted">
									<FileText className="h-6 w-6 text-muted-foreground" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-sm truncate">
										{profile.guidelines_pdf_filename || "Guidelines Document"}
									</p>
									<p className="text-muted-foreground text-xs">
										Exhibitor rules, terms & conditions
									</p>
								</div>
								<a
									href={profile.guidelines_pdf_url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
								>
									<ExternalLink className="h-4 w-4" />
									View PDF
								</a>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
