"use client";

import {
	Activity,
	Camera,
	ChevronDown,
	ExternalLink,
	Megaphone,
	Monitor,
	QrCode,
	Settings,
	Ticket,
	Users,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import type { Event } from "@/lib/api/event/response";
import EventSettingsDialog from "../settings/edit-modal";
import { AnnounceGuestDialog } from "./announce-guest-dialog";

interface EventDetailsActionButtonsProps {
	event: Event;
}

export function EventDetailsActionButtons({
	event,
}: EventDetailsActionButtonsProps) {
	const router = useRouter();
	const { user } = useAuth();
	const { openDialog, closeDialog } = useDialog();
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

	const [announceOpen, setAnnounceOpen] = useState(false);

	const openDisplaySettings = () => {
		openDialog({
			component: EventSettingsDialog,
			config: { title: "Event Settings", size: "full" },
			props: {
				eventId: event.id,
				initialTab: "welcome-screen" as const,
				onClose: closeDialog,
			},
		});
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
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className="rounded-none border py-5" variant="outline">
								<Monitor className="mr-2 h-4 w-4" />
								<span>Welcome Screen</span>
								<ChevronDown className="ml-2 h-3 w-3" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="rounded-none">
							<DropdownMenuItem
								onClick={() =>
									window.open(`/events/${event.slug}/welcome-screen`, "_blank")
								}
							>
								<Monitor className="mr-2 h-4 w-4" />
								Open Display
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setAnnounceOpen(true)}>
								<Megaphone className="mr-2 h-4 w-4" />
								Announce Guest
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={openDisplaySettings}>
								<Settings className="mr-2 h-4 w-4" />
								Display Settings
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			<AnnounceGuestDialog
				open={announceOpen}
				onOpenChange={setAnnounceOpen}
				eventId={event.id}
			/>
		</div>
	);
}
