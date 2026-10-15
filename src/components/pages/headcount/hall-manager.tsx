"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { DoorOpen, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FieldSectionLabel } from "@/components/admin-ui/form/field-section-label";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { hallKeys, useHalls } from "@/hooks/use-event-halls";
import { deleteHall, type Hall } from "@/lib/api/event/hall";
import { AddHallButton } from "./add-hall-button";
import { HallForm } from "./hall-form";

/** The event's halls and which counter each one reads from. Add / edit / remove. */
export function HallManager({ eventId }: { eventId: string }) {
	const { data: halls, isLoading, error } = useHalls(eventId);
	const { openDialog } = useDialog();
	const queryClient = useQueryClient();
	const [toDelete, setToDelete] = useState<Hall | null>(null);

	const remove = useMutation({
		mutationFn: (hall: Hall) => deleteHall(eventId, hall.id),
		onSuccess: () => {
			toast.success("Hall removed");
			queryClient.invalidateQueries({ queryKey: hallKeys.halls(eventId) });
			queryClient.invalidateQueries({ queryKey: hallKeys.headcount(eventId) });
			setToDelete(null);
		},
		onError: (e: Error) => toast.error(`Failed to remove hall: ${e.message}`),
	});

	const columns = useMemo<ColumnDef<Hall>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Hall",
				size: 260,
				cell: ({ row }) => (
					<span className="font-medium">{row.original.name}</span>
				),
			},
			{
				accessorKey: "floor",
				header: "Level",
				size: 160,
				cell: ({ row }) => row.original.floor ?? "—",
			},
			{
				id: "counter",
				header: "People counter",
				size: 180,
				cell: ({ row }) =>
					row.original.counterVenueId ? (
						<Badge variant="secondary" className="rounded-none">
							Linked
						</Badge>
					) : (
						<span className="text-muted-foreground">Not linked</span>
					),
			},
			{
				id: "actions",
				// No sr-only text here: it is position:absolute, escapes the table's
				// scroll box and widens the whole page on phones. The buttons carry aria-labels.
				header: () => null,
				size: 100,
				cell: ({ row }) => (
					<div className="ml-auto flex items-center">
						<Button
							variant="ghost"
							size="icon"
							className="rounded-none"
							aria-label={`Edit ${row.original.name}`}
							onClick={() =>
								openDialog({
									component: HallForm,
									props: { eventId, hall: row.original },
									config: { title: `Edit ${row.original.name}`, size: "md" },
								})
							}
						>
							<Pencil className="size-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-none"
							aria-label={`Remove ${row.original.name}`}
							onClick={() => setToDelete(row.original)}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				),
			},
		],
		[eventId, openDialog],
	);

	const table = useReactTable({
		data: halls ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		// Same header as FormGroupContainer, but the table sits outside its field
		// group: that group is a size container and lets a wide table push the page sideways.
		<div className="flex w-full min-w-0 flex-col divide-y border">
			<div className="flex min-h-18 w-full items-center gap-2 p-3">
				<div className="hidden items-center gap-2 p-2 md:flex">
					<DoorOpen className="size-5 md:size-6" />
				</div>
				<FieldSectionLabel
					label="Halls"
					description="Areas of the event whose visitors are counted. Halls on the same level are totalled together."
				/>
				<div className="ml-auto shrink-0">
					<AddHallButton eventId={eventId} />
				</div>
			</div>
			<div className="min-w-0 p-3">
				{isLoading ? (
					<p className="text-muted-foreground text-sm">Loading halls...</p>
				) : error ? (
					<p className="text-destructive text-sm">Failed to load halls.</p>
				) : (
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: "No halls yet",
							desc: "Add the first hall, then link it to a counter.",
							icon: <DoorOpen />,
						}}
					/>
				)}
			</div>

			<AlertDialog
				open={toDelete !== null}
				onOpenChange={(open) => !open && setToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove {toDelete?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							The hall disappears from this event's counts. The people counter
							itself and its recorded data are not affected.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => toDelete && remove.mutate(toDelete)}
							disabled={remove.isPending}
						>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
