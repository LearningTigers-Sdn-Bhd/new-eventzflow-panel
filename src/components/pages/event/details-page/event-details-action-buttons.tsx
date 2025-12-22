"use client";

import { Activity, Pencil, QrCode, Ticket, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import EventSettingsDialog from "@/components/pages/event/settings/edit-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import type { Event } from "@/lib/api/event/response";

interface EventDetailsActionButtonsProps {
	event: Event;
}

export function EventDetailsActionButtons({
	event,
}: EventDetailsActionButtonsProps) {
	const router = useRouter();
	const { openDialog, closeDialog } = useDialog();
	const { user } = useAuth();
	const {
		canManageEvent,
		canScanTickets,
		canManageTickets,
		canViewVisitors,
		canViewAnalytics,
	} = useEventPermissions(event.id, event);

	const isTicketEvent = event.use_ticket !== false;

	const openEventSettings = () => {
		openDialog({
			component: EventSettingsDialog,
			config: {
				title: "Event Settings",
				size: "full",
			},
			props: {
				eventId: event.id,
				onClose: closeDialog,
			},
		});
	};

	if (!user) return null;

	return (
		<div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
			{isTicketEvent ? (
				<>
					{canScanTickets && (
						<Button
							className="rounded-none border py-6 md:py-4"
							variant="secondary"
							onClick={() => router.push("/scan")}
						>
							<QrCode className="mr-2 h-4 w-4" />
							<span>
								Scan <span className="inline md:hidden lg:inline">Tickets</span>
							</span>
						</Button>
					)}
					{canManageTickets && (
						<Button
							className="rounded-none border py-6 md:py-4"
							onClick={() => router.push(`/event/${event.id}/tickets`)}
						>
							<Ticket className="mr-2 h-4 w-4" />
							<span>
								View All{" "}
								<span className="inline md:hidden lg:inline">Tickets</span>
							</span>
						</Button>
					)}
				</>
			) : (
				<>
					{canViewVisitors && (
						<Button
							className="rounded-none border py-5 md:py-4"
							variant="secondary"
							onClick={() => router.push(`/event/${event.id}/visitors`)}
						>
							<Users className="mr-2 h-4 w-4" />
							<span>
								View{" "}
								<span className="inline md:hidden lg:inline">Visitors</span>
							</span>
						</Button>
					)}
					{canViewAnalytics && (
						<Button
							className="rounded-none border py-5 md:py-4"
							onClick={() => router.push(`/event/${event.id}/mall-live-feed`)}
						>
							<Activity className="mr-2 h-4 w-4" />
							<span>
								Live <span className="inline md:hidden lg:inline">Feed</span>
							</span>
						</Button>
					)}
				</>
			)}
			{canManageEvent && (
				<Button
					className="rounded-none border py-6 md:py-4"
					variant="outline"
					onClick={openEventSettings}
				>
					<Pencil className="mr-2 h-4 w-4" />
					<span>
						Edit Event{" "}
						<span className="inline md:hidden lg:inline">Details</span>
					</span>
				</Button>
			)}
		</div>
	);
}
