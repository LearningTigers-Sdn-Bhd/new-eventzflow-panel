"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { RiCalendarEventFill } from "react-icons/ri";
import { IconTitle } from "@/components/admin-ui/icon-heading";
import { ErrorState, LoadingState } from "@/components/data-state";
import CreateEventForm from "@/components/pages/event/create-event-form";
import { DataTable } from "@/components/pages/event/event-table";
import type { Event } from "@/components/pages/event/event-table-columns";
import { getColumns } from "@/components/pages/event/event-table-columns";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { getEvents } from "@/lib/api/event";

type EventFilter = "active" | "archived" | "all";

export default function EventPage() {
	const { user } = useAuth();
	const router = useRouter();
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
				size: "full",
			},
		});
	};

	return (
		<div className="p-0">
			<div className="page-header">
				<div className="w-full px-0 lg:px-4">
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
							className="w-full rounded-none border py-6 md:py-0"
						>
							Create Event
							<Plus className="mb-0.5 ml-1 size-4" />
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
					clickableRowConfig={{
						isEnabled: true,
						onRowClick: (row) => {
							const event = row as Event;
							// Business hosts don't have access to "details" — land them
							// on Business Matching instead, their only real landing page.
							const landingRoute =
								user?.role === "exhibitor" ? "business-matching" : "details";
							router.push(`/event/${event.id}/${landingRoute}`);
						},
						excludeRowClickColumns: ["actions"],
					}}
				/>
			)}
		</div>
	);
}
