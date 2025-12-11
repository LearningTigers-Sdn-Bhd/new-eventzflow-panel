"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Package, Plus, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import {
	getEventRentableItems,
	createEventRentableItem,
	deleteEventRentableItem,
} from "@/lib/api/event-rentable-item";
import { getRentableItems } from "@/lib/api/rentable-item";
import { LinkItemDialog } from "./link-item-dialog";
import { UnlinkItemDialog } from "./unlink-item-dialog";
import { DataTable } from "./table/data-table";
import { getColumns } from "./table/columns";

interface EventRentableItemClientWrapperProps {
	eventId: number;
}

export default function EventRentableItemClientWrapper({
	eventId,
}: EventRentableItemClientWrapperProps) {
	const queryClient = useQueryClient();
	const { openDialog, closeDialog } = useDialog();

	// Fetch linked items
	const {
		data: linkedItems = [],
		isLoading: isLoadingLinked,
		error: linkedError,
	} = useQuery({
		queryKey: ["event-rentable-items", eventId],
		queryFn: () => getEventRentableItems(eventId),
	});

	// Fetch available items (contractor's catalog)
	const {
		data: allItems = [],
		isLoading: isLoadingAll,
		error: allError,
	} = useQuery({
		queryKey: ["rentable-items"],
		queryFn: () => getRentableItems(),
	});

	// Link item mutation
	const linkMutation = useMutation({
		mutationFn: createEventRentableItem,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["event-rentable-items", eventId],
			});
			toast.success("Item linked to event successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to link item to event");
		},
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

	// Filter out already linked items
	const linkedItemIds = new Set(linkedItems.map((item) => item.rentableItemId));
	const availableItems = allItems.filter(
		(item) => !linkedItemIds.has(item.id) && item.status === "active",
	);

	const handleLinkItem = () => {
		openDialog({
			component: LinkItemDialog,
			props: {
				availableItems,
				onLink: (rentableItemId: number) => {
					linkMutation.mutate({
						event_id: eventId,
						rentable_item_id: rentableItemId,
					});
				},
			},
			config: {
				title: "Link Item to Event",
				description: "Select an item from your catalog to link to this event.",
				size: "lg",
			},
		});
	};

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

	const isLoading = isLoadingLinked || isLoadingAll;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading event rentable items..."
				description="Please wait while we fetch the linked items..."
			/>
		);
	}

	if (linkedError || allError) {
		return (
			<ErrorState
				title="Failed to load items"
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
						<p className="text-sm font-medium">Link rentable items to this event</p>
						<p className="text-sm text-muted-foreground">
							Link items from your catalog and configure pricing tiers. Need to create new items first?
						</p>
					</div>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
					<Button variant="outline" asChild className="w-full rounded-none sm:w-auto">
						<Link href={"/rentable-items" as any}>
							Go to Catalog
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
					<Button
						onClick={handleLinkItem}
						className="w-full rounded-none sm:w-auto"
						disabled={availableItems.length === 0}
					>
						<Plus className="mr-2 h-4 w-4" />
						Link Item
					</Button>
				</div>
			</div>
			<DataTable columns={columns} data={linkedItems} onLinkItem={handleLinkItem} availableItemsCount={availableItems.length} />
		</div>
	);
}
