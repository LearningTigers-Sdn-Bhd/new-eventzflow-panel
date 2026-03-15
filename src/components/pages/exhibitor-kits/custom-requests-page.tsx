"use client";

import { useQuery } from "@tanstack/react-query";
import { FileQuestion } from "lucide-react";
import { ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventVendors } from "@/lib/api/event-vendor";
import { getExhibitorKit } from "@/lib/api/exhibitor-kit";
import { getAutoRefreshQueryOptions } from "@/lib/query/auto-refresh";
import { CustomRequestsForm } from "./custom-requests-form";

interface CustomRequestsPageProps {
	eventId: number;
	eventVendorId: number;
}

export function CustomRequestsPage({
	eventId,
	eventVendorId,
}: CustomRequestsPageProps) {
	// First get the event vendor to find the exhibitor kit ID
	const {
		data: eventVendors,
		isLoading: isLoadingVendors,
		error: vendorsError,
	} = useQuery({
		queryKey: ["events", eventId, "vendors"],
		queryFn: () => getEventVendors(eventId),
	});

	const currentVendor = eventVendors?.find((ev) => ev.id === eventVendorId);
	const exhibitorKitId = currentVendor?.exhibitor_kit?.id;

	// Then fetch the full exhibitor kit with custom requests
	const {
		data: exhibitorKit,
		isLoading: isLoadingKit,
		error: kitError,
	} = useQuery({
		queryKey: ["exhibitor-kit", eventId, exhibitorKitId],
		queryFn: () => {
			if (!exhibitorKitId) {
				throw new Error("No exhibitor kit id");
			}

			return getExhibitorKit(eventId, exhibitorKitId);
		},
		enabled: !!exhibitorKitId,
		...getAutoRefreshQueryOptions(10_000),
	});

	const isLoading = isLoadingVendors || isLoadingKit;
	const error = vendorsError || kitError;

	if (isLoading) {
		return (
			<div className="space-y-6 p-0">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-0">
				<ErrorState
					title="Failed to load custom requests"
					description="We couldn't load your custom requests. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			</div>
		);
	}

	if (!exhibitorKitId || !exhibitorKit) {
		return (
			<div className="space-y-6 p-0">
				<div className="rounded-xl border bg-background">
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<FileQuestion className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							No Exhibitor Kit Found
						</h3>
						<p className="text-muted-foreground text-sm">
							Your exhibitor kit hasn't been set up yet.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const customRequests = exhibitorKit.custom_requests || [];
	const pendingCount = customRequests.filter(
		(r) => r.status === "pending",
	).length;
	const approvedCount = customRequests.filter(
		(r) => r.status === "approved",
	).length;

	// Calculate total approved amount
	const approvedTotal = customRequests
		.filter((r) => r.status === "approved" && r.resolved_price)
		.reduce((sum, r) => sum + (r.resolved_price || 0) * r.quantity, 0);

	return (
		<div className="space-y-6 p-0">
			{/* Summary */}
			<div className="overflow-hidden border bg-background">
				<div className="grid grid-cols-2 md:grid-cols-4">
					<div className="border-r border-b p-4 md:border-b-0">
						<p className="text-muted-foreground text-xs uppercase tracking-wide">
							Total Requests
						</p>
						<p className="mt-2 border bg-muted p-2 font-semibold text-3xl tabular-nums leading-none tracking-tight">
							{customRequests.length}
						</p>
					</div>

					<div className="border-b p-4 md:border-r md:border-b-0">
						<p className="text-muted-foreground text-xs uppercase tracking-wide">
							Pending
						</p>
						<p className="mt-2 border bg-muted p-2 font-semibold text-3xl tabular-nums leading-none tracking-tight">
							{pendingCount}
						</p>
					</div>

					<div className="border-r p-4">
						<p className="text-muted-foreground text-xs uppercase tracking-wide">
							Approved
						</p>
						<p className="mt-2 border bg-muted p-2 font-semibold text-3xl tabular-nums leading-none tracking-tight">
							{approvedCount}
						</p>
					</div>

					<div className="p-4">
						<p className="text-muted-foreground text-xs uppercase tracking-wide">
							Approved Total
						</p>
						<p className="mt-2 border bg-muted p-2 font-semibold text-2xl tabular-nums leading-none tracking-tight">
							{new Intl.NumberFormat("en-MY", {
								style: "currency",
								currency: "MYR",
							}).format(approvedTotal)}
						</p>
					</div>
				</div>
			</div>

			{/* Custom Requests Form */}
			<CustomRequestsForm
				eventId={eventId}
				exhibitorKitId={exhibitorKitId}
				existingRequests={customRequests}
			/>
		</div>
	);
}
