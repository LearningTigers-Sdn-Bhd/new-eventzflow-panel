"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, Package } from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { getEventExhibitionContractor } from "@/lib/api/event-exhibition-contractor";

interface ContractorGuidelinesViewProps {
	eventId: number;
}

export function ContractorGuidelinesView({
	eventId,
}: ContractorGuidelinesViewProps) {
	const {
		data: contractor,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event-exhibition-contractor", eventId],
		queryFn: () => getEventExhibitionContractor(eventId),
		enabled: !!eventId,
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading guidelines..."
				description="Please wait while we fetch the contractor guidelines."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load guidelines"
				description="We couldn't load the contractor guidelines. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	if (!contractor) {
		return (
			<EmptyState
				title="No contractor assigned"
				description="There is no exhibition contractor assigned to this event yet."
			/>
		);
	}

	const profile = contractor.exhibition_contractor_profile;
	const contractorUser = contractor.contractor;

	if (!profile?.guidelines_pdf_url && !profile?.standard_package_info) {
		return (
			<EmptyState
				title="No guidelines available"
				description="The contractor has not uploaded any guidelines document yet. Please check back later."
			/>
		);
	}

	return (
		<div className="space-y-4 border-t border-dashed">
			<div className="space-y-2 p-4">
				<h2 className="font-semibold text-xl">Exhibitor Guidelines</h2>
				<p className="text-muted-foreground text-sm">
					Please review the following guidelines, rules, and terms & conditions
					before ordering kits.
				</p>
			</div>

			{profile?.guidelines_pdf_url && (
				<div className="border bg-background/60 p-6">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-4">
						<div className="flex h-14 w-14 shrink-0 items-center justify-center bg-muted">
							<FileText className="h-8 w-8 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<p className="font-medium">
								{profile.guidelines_pdf_filename || "Guidelines Document"}
							</p>
							<p className="text-muted-foreground text-sm">
								Exhibitor rules, terms & conditions
							</p>
							{contractorUser && (
								<p className="text-muted-foreground text-xs">
									By <span className="font-semibold">{contractorUser.full_name}</span>
								</p>
							)}
						</div>
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

			{profile?.standard_package_info && (
				<div className="border bg-background/60 p-6">
					<div className="flex items-start gap-4 mb-4">
						<div className="flex h-14 w-14 shrink-0 items-center justify-center bg-muted">
							<Package className="h-8 w-8 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<p className="font-medium">Standard Package</p>
							<p className="text-muted-foreground text-sm">
								Included items and services in the standard package
							</p>
						</div>
					</div>
					<div className="max-h-180 overflow-y-auto border border-dashed bg-muted/30 p-4">
						<pre className="whitespace-pre-wrap break-words font-sans text-sm text-foreground">
							{profile.standard_package_info}
						</pre>
					</div>
				</div>
			)}
		</div>
	);
}
