"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { RiCalendarEventFill } from "react-icons/ri";
import { ErrorState, LoadingState } from "@/components/data-state";
import { getColumns } from "@/components/pages/event/columns";
import CreateEventForm from "@/components/pages/event/create-event-form";
import { DataTable } from "@/components/pages/event/data-table";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { getEvents } from "@/lib/api/event";

type EventFilter = "active" | "archived" | "all";

export default function EventPage() {
	const { user } = useAuth();
	const [eventFilter, setEventFilter] = useState<EventFilter>("active");

	// Build query options based on filter
	const queryOptions = useMemo(() => {
		if (eventFilter === "all") {
			return { full: true };
		}
		if (eventFilter === "archived") {
			return { archived: true };
		}
		return undefined; // Default: active events only
	}, [eventFilter]);

	const {
		data: events,
		isLoading,
		error,
	} = useQuery({
		// Use eventFilter directly in queryKey for better serialization and caching
		queryKey: ["events", eventFilter],
		queryFn: () => getEvents(queryOptions),
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
		<div className="p-0">
			{/* Header */}
			{/* <div className="flex w-full flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between md:gap-1">
						<div className="px-2 md:px-4">
							<IconTitle
								icon={List}
								title="All Events Overview"
								description="Quick view of all your events and their performance"
							/>
						</div>
						<div className="w-full px-0 md:w-auto md:px-4">
							<EventSwitcher
								currentEventId={selectedEventId}
								onEventChange={setSelectedEventId}
								initialEvents={events}
							/>
						</div>
					</div> */}
			<div className="page-header">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={RiCalendarEventFill}
						title="Events"
						description="Manage your events and view their details."
					/>
				</div>
				{(user?.role === "org_owner" || user?.role === "organizer") && (
					<div className="w-full px-0 md:w-auto md:px-4">
						<Button
							onClick={handleCreateEvent}
							className="w-full rounded-none border"
						>
							Create Event
						</Button>
					</div>
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
					eventFilter={eventFilter}
					onEventFilterChange={setEventFilter}
				/>
			)}
		</div>
	);
}
