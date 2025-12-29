"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import {
	getEventPrintingServices,
	deleteEventPrintingService,
} from "@/lib/api/event-printing-service";
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

	if (isLoadingLinked) {
		return (
			<LoadingState
				title="Loading event printing services..."
				description="Please wait while we fetch the linked services..."
			/>
		);
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

	const columns = getColumns({ onUnlink: handleUnlink });

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 rounded-none border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
					<div className="space-y-1">
						<p className="font-medium text-sm">Printing services for this event</p>
						<p className="text-muted-foreground text-sm">
							Services are automatically linked when the contractor is assigned. Manage your catalog to add new services.
						</p>
					</div>
				</div>
				<div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row">
					<Button variant="outline" asChild className="w-full rounded-none sm:w-auto">
						<Link href={"/printing-services" as any}>
							Go to Catalog
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</div>
			<DataTable columns={columns} data={linkedServices} />
		</div>
	);
}
