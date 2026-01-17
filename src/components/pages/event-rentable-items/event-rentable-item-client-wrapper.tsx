"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import {
	getEventRentableItems,
	deleteEventRentableItem,
} from "@/lib/api/event-rentable-item";
import { UnlinkItemDialog } from "./unlink-item-dialog";
import { DataTable } from "./table/data-table";
import { getColumns } from "./table/columns";

interface EventRentableItemClientWrapperProps {
	eventId: number;
}

export default function EventRentableItemClientWrapper({
	eventId,
}: EventRentableItemClientWrapperProps) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const { openDialog, closeDialog } = useDialog();
	const isContractor = user?.role === "exhibition_contractor";

	// Fetch linked items
	const {
		data: linkedItems = [],
		isLoading: isLoadingLinked,
		error: linkedError,
	} = useQuery({
		queryKey: ["event-rentable-items", eventId],
		queryFn: () => getEventRentableItems(eventId),
	});

	// Unlink item mutation
	const unlinkMutation = useMutation({
		mutationFn: deleteEventRentableItem,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["event-rentable-items", eventId],
			});
			toast.success("Item unlinked from event successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to unlink item from event");
		},
	});

	const handleUnlink = (eventRentableItemId: number, itemName: string) => {
		openDialog({
			component: UnlinkItemDialog,
			props: {
				itemName,
				isPending: unlinkMutation.isPending,
				onConfirm: () => {
					unlinkMutation.mutate({
						event_id: eventId,
						id: eventRentableItemId,
					});
				},
			},
			config: {
				title: "Unlink Item",
				description: "Remove this item from the event.",
				size: "sm",
			},
		});
	};

	if (isLoadingLinked) {
		return (
			<LoadingState
				title="Loading event rentable items..."
				description="Please wait while we fetch the linked items..."
			/>
		);
	}

	if (linkedError) {
		return (
			<ErrorState
				title="Failed to load items"
				description={(linkedError as Error)?.message || "An error occurred"}
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	const columns = getColumns({ onUnlink: handleUnlink, isContractor });

	return (
		<div className="space-y-4">
			{isContractor && (
				<div className="flex flex-col gap-3 rounded-none border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
						<div className="space-y-1">
							<p className="font-medium text-sm">Rentable items for this event</p>
							<p className="text-muted-foreground text-sm">
								Items are automatically linked when the contractor is assigned. Manage your catalog to add new items.
							</p>
						</div>
					</div>
					<div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row">
						<Button variant="outline" asChild className="w-full rounded-none sm:w-auto">
							<Link href={"/rentable-items" as any}>
								Go to Catalog
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
			)}
			<DataTable columns={columns} data={linkedItems} />
		</div>
	);
}
