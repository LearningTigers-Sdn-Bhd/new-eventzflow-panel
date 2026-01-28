"use client";

import {
	Activity,
	ExternalLink,
	Monitor,
	QrCode,
	Ticket,
	Users,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import type { Event } from "@/lib/api/event/response";

interface EventDetailsActionButtonsProps {
	event: Event;
}

export function EventDetailsActionButtons({
	event,
}: EventDetailsActionButtonsProps) {
	const router = useRouter();
	const { user } = useAuth();
	const {
		canManageEvent,
		canScanTickets,
		canManageTickets,
		canViewVisitors,
		canViewAnalytics,
		isOrgOwner,
		isOrganizer,
		isEventStaff,
	} = useEventPermissions(event.id, event);

	const isTicketEvent = event.use_ticket !== false;
	const canViewPublicCheckIn = isOrgOwner || isOrganizer || isEventStaff;

	const openWelcomeScreen = () => {
		window.open(`/events/${event.slug}/welcome-screen`, "_blank");
	};

	if (!user) return null;

	return (
		<div className="border bg-background">
			{/* Header */}
			<div className="flex items-center gap-2 border-b px-4 py-2">
				<Zap className="h-4 w-4 text-muted-foreground" />
				<span className="font-medium text-sm">Quick Actions</span>
			</div>

			{/* Buttons Grid */}
			<div className="grid grid-cols-2 gap-2 p-3 md:flex md:flex-row md:flex-wrap md:justify-end">
				{isTicketEvent ? (
					<>
						{canScanTickets && (
							<Button
								className="rounded-none border py-5"
								variant="secondary"
								onClick={() => router.push("/scan")}
							>
								<QrCode className="mr-2 h-4 w-4" />
								<span>Scan Tickets</span>
							</Button>
						)}
						{canManageTickets && (
							<Button
								className="rounded-none border py-5"
								onClick={() => router.push(`/event/${event.id}/tickets`)}
							>
								<Ticket className="mr-2 h-4 w-4" />
								<span>View All Tickets</span>
							</Button>
						)}
					</>
				) : (
					<>
						{canViewVisitors && (
							<Button
								className="rounded-none border py-5"
								variant="secondary"
								onClick={() => router.push(`/event/${event.id}/visitors`)}
							>
								<Users className="mr-2 h-4 w-4" />
								<span>View Visitors</span>
							</Button>
						)}
						{canViewAnalytics && (
							<Button
								className="rounded-none border py-5"
								onClick={() => router.push(`/event/${event.id}/mall-live-feed`)}
							>
								<Activity className="mr-2 h-4 w-4" />
								<span>Live Feed</span>
							</Button>
						)}
					</>
				)}

				{canViewPublicCheckIn && (
					<Button
						className="rounded-none border py-5"
						variant="outline"
						asChild
					>
						<a
							href={`/events/${event.slug}/check-in`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<ExternalLink className="mr-2 h-4 w-4" />
							<span>Check-In Page</span>
						</a>
					</Button>
				)}

				{canManageEvent && (
					<Button
						className="rounded-none border py-5"
						variant="outline"
						onClick={openWelcomeScreen}
					>
						<Monitor className="mr-2 h-4 w-4" />
						<span>Welcome Screen</span>
					</Button>
				)}
			</div>
		</div>
	);
}
