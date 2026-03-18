"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, Plus } from "lucide-react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { getEventById } from "@/lib/api/event";
import {
	createEventPrintingService,
	deleteEventPrintingService,
	getEventPrintingServices,
} from "@/lib/api/event-printing-service";
import {
	isExhibitorManagementEnabled,
	shouldLoadExhibitorManagementData,
} from "../event/exhibitor-management-access";
import { LinkServiceDialog } from "./link-service-dialog";
import { getColumns } from "./table/columns";
import { DataTable } from "./table/data-table";
import { UnlinkServiceDialog } from "./unlink-service-dialog";

interface EventPrintingServiceClientWrapperProps {
	eventId: number;
}

export default function EventPrintingServiceClientWrapper({
	eventId,
}: EventPrintingServiceClientWrapperProps) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const { openDialog, closeDialog } = useDialog();
	const isContractor = user?.role === "exhibition_contractor";
	const isOrgOwner = user?.role === "org_owner";

	// Fetch event details to check allow_contractor_printing_services flag
	const { data: eventDetails, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId.toString()),
	});
	const shouldLoadLinkedServices = shouldLoadExhibitorManagementData(
		user?.role,
		eventDetails,
	);

	// Fetch linked services
	const {
		data: linkedServices = [],
		isLoading: isLoadingLinked,
		error: linkedError,
	} = useQuery({
		queryKey: ["event-printing-services", eventId],
		queryFn: () => getEventPrintingServices(eventId),
		enabled: shouldLoadLinkedServices,
	});

	// Link service mutation
	const linkMutation = useMutation({
		mutationFn: createEventPrintingService,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["event-printing-services", eventId],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to link service to event");
		},
	});

	// Unlink service mutation
	const unlinkMutation = useMutation({
		mutationFn: deleteEventPrintingService,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["event-printing-services", eventId],
			});
			toast.success("Service unlinked from event successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to unlink service from event");
		},
	});

	const handleLinkServices = async (serviceIds: number[]) => {
		try {
			// Link all selected services
			await Promise.all(
				serviceIds.map((printingServiceId) =>
					linkMutation.mutateAsync({
						event_id: eventId,
						printing_service_id: printingServiceId,
					}),
				),
			);
			toast.success(
				`${serviceIds.length} service${serviceIds.length > 1 ? "s" : ""} linked successfully`,
			);
			closeDialog();
		} catch {
			// Error already handled in mutation
		}
	};

	const handleOpenLinkDialog = () => {
		const linkedServiceIds = linkedServices
			.map((s) => s.printingServiceId)
			.filter((id): id is number => id !== undefined);

		openDialog({
			component: LinkServiceDialog,
			props: {
				linkedServiceIds,
				isPending: linkMutation.isPending,
				onConfirm: handleLinkServices,
			},
			config: {
				title: "Link Printing Services",
				description: "Select printing services to link to this event.",
				size: "md",
			},
		});
	};

	const handleUnlink = (
		eventPrintingServiceId: number,
		serviceName: string,
	) => {
		openDialog({
			component: UnlinkServiceDialog,
			props: {
				serviceName,
				isPending: unlinkMutation.isPending,
				onConfirm: () => {
					unlinkMutation.mutate({
						event_id: eventId,
						id: eventPrintingServiceId,
					});
				},
			},
			config: {
				title: "Unlink Service",
				description: "Remove this service from the event.",
				size: "sm",
			},
		});
	};

	if (isLoadingEvent || (shouldLoadLinkedServices && isLoadingLinked)) {
		return (
			<LoadingState
				title="Loading event printing services..."
				description="Please wait while we fetch the linked services..."
			/>
		);
	}

	if (
		!isLoadingEvent &&
		!isExhibitorManagementEnabled(user?.role, eventDetails)
	) {
		return <FeatureLockedState isEventVendor={user?.role === "vendor"} />;
	}

	if (linkedError) {
		return (
			<ErrorState
				title="Failed to load services"
				description={(linkedError as Error)?.message || "An error occurred"}
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	// Check if contractor printing is enabled
	const allowContractorPrinting =
		eventDetails?.allow_contractor_printing_services ?? false;

	const columns = getColumns({
		onUnlink: handleUnlink,
		isContractor,
		currentUserId: user?.id,
	});

	return (
		<div className="space-y-4">
			{isContractor && (
				<div className="flex flex-col gap-3 rounded-none border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
						<div className="space-y-1">
							<p className="font-medium text-sm">
								Printing services for this event
							</p>
							<p className="text-muted-foreground text-sm">
								Services are automatically linked when the contractor is
								assigned. Manage your catalog to add new services.
							</p>
						</div>
					</div>
				</div>
			)}
			{isOrgOwner && (
				<div className="flex flex-col gap-3 rounded-none border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
						<div className="space-y-1">
							<p className="font-medium text-sm">
								{allowContractorPrinting
									? "Contractor printing services"
									: "Your printing services for this event"}
							</p>
							<p className="text-muted-foreground text-sm">
								{allowContractorPrinting
									? "Contractor printing is enabled. Exhibitors will order from contractor services. You can view linked services below."
									: "Contractor printing is disabled. You can add your own printing services to this event."}
							</p>
						</div>
					</div>
					{!allowContractorPrinting && (
						<div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row">
							<Button
								variant="default"
								onClick={handleOpenLinkDialog}
								className="w-full rounded-none sm:w-auto"
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Printing Service
							</Button>
						</div>
					)}
				</div>
			)}
			<DataTable columns={columns} data={linkedServices} />
		</div>
	);
}
