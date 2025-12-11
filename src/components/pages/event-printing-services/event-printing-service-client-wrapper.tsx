"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import {
	getEventPrintingServices,
	createEventPrintingService,
	deleteEventPrintingService,
	type EventPrintingService,
	type CreateEventPrintingServiceRequest,
	type DeleteEventPrintingServiceRequest,
} from "@/lib/api/event-printing-service";
import { getPrintingServices } from "@/lib/api/printing-service";
import { LinkServiceDialog } from "./link-service-dialog";
import { UnlinkServiceDialog } from "./unlink-service-dialog";
import { DataTable } from "./table/data-table";
import { getColumns } from "./table/columns";

interface EventPrintingServiceClientWrapperProps {
	eventId: number;
}

export default function EventPrintingServiceClientWrapper({
	eventId,
}: EventPrintingServiceClientWrapperProps) {
	const queryClient = useQueryClient();
	const { openDialog, closeDialog } = useDialog();

	// Fetch linked services
	const {
		data: linkedServices = [],
		isLoading: isLoadingLinked,
		error: linkedError,
	} = useQuery({
		queryKey: ["event-printing-services", eventId],
		queryFn: () => getEventPrintingServices(eventId),
	});

	// Fetch available services (contractor's catalog)
	const {
		data: allServices = [],
		isLoading: isLoadingAll,
		error: allError,
	} = useQuery({
		queryKey: ["printing-services"],
		queryFn: () => getPrintingServices(),
	});

	// Link service mutation
	const linkMutation = useMutation({
		mutationFn: createEventPrintingService,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["event-printing-services", eventId],
			});
			toast.success("Service linked to event successfully");
			closeDialog();
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

	// Filter out already linked services
	const linkedServiceIds = new Set(linkedServices.map((s) => s.printingServiceId));
	const availableServices = allServices.filter(
		(service) => !linkedServiceIds.has(service.id) && service.status === "active",
	);

	const handleLinkService = () => {
		openDialog({
			component: LinkServiceDialog,
			props: {
				availableServices,
				onLink: (printingServiceId: number) => {
					linkMutation.mutate({
						event_id: eventId,
						printing_service_id: printingServiceId,
					});
				},
			},
			config: {
				title: "Link Service to Event",
				description: "Select a printing service from your catalog to link to this event.",
				size: "lg",
			},
		});
	};

	const handleUnlink = (eventPrintingServiceId: number, serviceName: string) => {
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

	const isLoading = isLoadingLinked || isLoadingAll;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading event printing services..."
				description="Please wait while we fetch the linked services..."
			/>
		);
	}

	if (linkedError || allError) {
		return (
			<ErrorState
				title="Failed to load services"
				description={(linkedError as Error)?.message || (allError as Error)?.message || "An error occurred"}
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	const columns = getColumns({ onUnlink: handleUnlink });

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 rounded-none border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
					<div className="space-y-1">
						<p className="text-sm font-medium">Link printing services to this event</p>
						<p className="text-sm text-muted-foreground">
							Link services from your catalog and configure pricing tiers. Need to create new services first?
						</p>
					</div>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
					<Button variant="outline" asChild className="w-full rounded-none sm:w-auto">
						<Link href={"/printing-services" as any}>
							Go to Catalog
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
					<Button
						onClick={handleLinkService}
						className="w-full rounded-none sm:w-auto"
						disabled={availableServices.length === 0}
					>
						<Plus className="mr-2 h-4 w-4" />
						Link Service
					</Button>
				</div>
			</div>
			<DataTable columns={columns} data={linkedServices} onLinkService={handleLinkService} availableServicesCount={availableServices.length} />
		</div>
	);
}
