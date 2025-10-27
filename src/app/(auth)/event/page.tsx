"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { getColumns } from "@/components/pages/event/columns";
import CreateEventForm from "@/components/pages/event/create-event-form";
import { DataTable } from "@/components/pages/event/data-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { getEvents } from "@/lib/api/event";

export default function EventPage() {
	const { user } = useAuth();
	const {
		data: events,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["events"],
		queryFn: getEvents,
	});

	// Get columns based on user role
	const columns = useMemo(() => getColumns(user?.role), [user?.role]);

	const { openDialog, closeDialog } = useDialog();

	const handleCreateEvent = () => {
		openDialog({
			component: CreateEventForm,
			props: {
				onClose: closeDialog,
			},
			config: {
				title: "Create New Event",
				description: "Fill in the details to create a new event",
				size: "2xl",
			},
		});
	};

	return (
		<div className="p-2">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Events</h1>
					<p className="text-muted-foreground">
						Manage your events and view their details.
					</p>
				</div>
				{user?.role === "org_owner" && (
					<Button onClick={handleCreateEvent}>Create Event</Button>
				)}
			</div>
			{isLoading ? (
				<LoadingState
					title="Loading events..."
					description="Please wait while we fetch your events..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load events"
					description="We couldn't load your events. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<DataTable
					columns={columns}
					data={events || []}
					onCreateEvent={handleCreateEvent}
				/>
			)}
		</div>
	);
}
