"use client";

import { ExternalLink, List, QrCode, Settings } from "lucide-react";
import { BlankCard } from "@/components/admin-ui/analytic";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useFormatDate } from "@/hooks/use-format-date";
import type { Event } from "@/lib/api/event/response";
import { cn } from "@/lib/utils";
import PublicCheckInQrDialog from "./public-check-in-qr-dialog";

interface EventDetailsViewProps {
	event: Event;
}

export function EventDetailsView({ event }: EventDetailsViewProps) {
	const { formatDate } = useFormatDate();
	const { openDialog } = useDialog();
	const {
		isVendor,
		isExhibitionContractor,
		isOrgOwner,
		isOrganizer,
		isEventStaff,
	} = useEventPermissions(event.id, event);

	const showWebhookUrl = !isVendor && !isExhibitionContractor;
	const showColumn2 = !isVendor && !isExhibitionContractor;
	const canViewPublicCheckIn = isOrgOwner || isOrganizer || isEventStaff;

	const openQrDialog = () => {
		openDialog({
			component: PublicCheckInQrDialog,
			config: {
				title: "Public Check-In QR Code",
				size: "md",
			},
			props: {
				eventTitle: event.title,
				slug: event.slug,
			},
		});
	};

	// Parse labels_data
	const labels =
		event.labels_data && Object.keys(event.labels_data).length > 0
			? Object.entries(event.labels_data).map(([key, value]) => ({
					key,
					label: value as string,
				}))
			: [];

	return (
		<div
			className={cn("grid grid-cols-1 gap-2", showColumn2 && "lg:grid-cols-2")}
		>
			{/* Column 1: Event Details Card */}
			<BlankCard
				title="Event Details"
				icon={<List className="size-4" />}
				contentClassName="p-0"
			>
				{/* Column 1: Event Description & Status */}
				<div className="grid h-full grid-cols-1 divide-y divide-muted-foreground/20 rounded-none border">
					<div className="flex flex-col gap-1 px-3 py-2">
						<p className="font-medium text-muted-foreground text-sm">
							Event Description
						</p>
						<p className="whitespace-pre-wrap text-sm italic leading-relaxed">
							{event.description || "No description provided."}
						</p>
					</div>

					{/* Status & Type */}
					<div className="grid grid-cols-2 divide-x divide-muted-foreground/20">
						<div className="flex flex-row items-center justify-between gap-1 px-3 py-2 md:flex-col md:items-start md:justify-start xl:flex-row xl:items-center xl:justify-between">
							<p className="font-medium text-muted-foreground text-sm">
								Status
							</p>
							<p className="whitespace-pre-wrap text-sm capitalize italic leading-relaxed">
								{event.status}
							</p>
						</div>

						<div className="flex flex-row items-center justify-between gap-1 px-3 py-2 md:flex-col md:items-start md:justify-start xl:flex-row xl:items-center xl:justify-between">
							<p className="font-medium text-muted-foreground text-sm">Type</p>
							<p className="whitespace-pre-wrap text-sm capitalize italic leading-relaxed">
								{event.use_ticket ? "Ticket Event" : "Visitor Event"}
							</p>
						</div>
					</div>

					{/* Dates */}
					<div className="grid grid-cols-2 divide-x divide-muted-foreground/20">
						<div className="flex flex-row items-center justify-between gap-1 px-3 py-2 md:flex-col md:items-start md:justify-start xl:flex-row xl:items-center xl:justify-between">
							<p className="font-medium text-muted-foreground text-sm">
								Start Date
							</p>
							<p className="font-medium font-mono text-sm tracking-tight">
								{formatDate(event.start_date)}
							</p>
						</div>
						<div className="flex flex-row items-center justify-between gap-1 px-3 py-2 md:flex-col md:items-start md:justify-start xl:flex-row xl:items-center xl:justify-between">
							<p className="font-medium text-muted-foreground text-sm">
								End Date
							</p>
							<p className="font-medium font-mono text-sm tracking-tight">
								{formatDate(event.end_date)}
							</p>
						</div>
					</div>

					{/* Webhook URL */}
					{showWebhookUrl && (
						<div className="flex flex-col gap-2 px-3 py-2">
							<p className="font-medium text-muted-foreground text-sm">
								Webhook URL
							</p>
							{event.webhook_url ? (
								<a
									href={event.webhook_url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-primary text-sm hover:underline"
								>
									{event.webhook_url}
									<ExternalLink className="h-3 w-3" />
								</a>
							) : (
								<p className="font-mono text-muted-foreground text-sm italic">
									No webhook URL configured.
								</p>
							)}
						</div>
					)}

					{/* Public Check-In */}
					{canViewPublicCheckIn && (
						<div className="flex flex-col gap-2 px-3 py-2">
							<p className="font-medium text-muted-foreground text-sm">
								Public Check-In Page
							</p>
							<div className="flex flex-col gap-2 sm:flex-row">
								<Button
									variant="outline"
									size="sm"
									className="flex-1 rounded-none"
									onClick={openQrDialog}
								>
									<QrCode className="mr-2 h-4 w-4" />
									Show QR Code
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="flex-1 rounded-none"
									asChild
								>
									<a
										href={`/events/${event.slug}/check-in`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<ExternalLink className="mr-2 h-4 w-4" />
										Open Page
									</a>
								</Button>
							</div>
						</div>
					)}
				</div>
			</BlankCard>

			{/* Column 2: Event Configuration */}
			{showColumn2 && (
				<BlankCard
					title="Event Configuration"
					icon={<Settings className="size-4" />}
					contentClassName="p-0"
				>
					<div className="grid h-full grid-cols-1 divide-y divide-muted-foreground/20 rounded-none border">
						{/* Labels Configuration Details */}
						<div className="flex flex-col gap-2 p-3">
							<p className="font-medium text-muted-foreground text-sm">
								Labels Required
							</p>
							{labels.length > 0 ? (
								<div className="flex flex-wrap gap-2">
									{labels.map((item) => (
										<div
											key={item.key}
											className="flex items-center rounded-none border bg-background px-3 py-1.5 text-xs"
										>
											<span className="font-mono tracking-wide">
												{item.label}
											</span>
										</div>
									))}
								</div>
							) : (
								<p className="text-muted-foreground text-sm italic">
									No labels configured for this event.
								</p>
							)}
						</div>
						{/* Event Options Configuration Details */}
						<div className="flex flex-col gap-6 p-3">
							<div className="space-y-4">
								<p className="font-medium text-muted-foreground text-sm">
									Event Options
								</p>
								<div className="grid grid-cols-1 divide-y divide-muted-foreground/20 rounded-none border">
									<div className="flex items-center justify-between rounded-none p-3">
										<span className="text-sm">Multiple Scans Allowed</span>
										<p className="whitespace-pre-wrap text-sm capitalize italic leading-relaxed">
											{event.multiple_scans ? "Yes" : "No"}
										</p>
									</div>
									<div className="flex items-center justify-between rounded-none p-3">
										<span className="text-sm">Exhibitor Kit</span>
										<p className="whitespace-pre-wrap text-sm capitalize italic leading-relaxed">
											{event.use_exhibitor_kit ? "Enabled" : "Disabled"}
										</p>
									</div>
									<div className="flex items-center justify-between rounded-none p-3">
										<span className="text-sm">Contractor Printing</span>
										<p className="whitespace-pre-wrap text-sm capitalize italic leading-relaxed">
											{event.allow_contractor_printing_services
												? "Allowed"
												: "Not Allowed"}
										</p>
									</div>
									<div className="flex items-center justify-between rounded-none p-3">
										<span className="text-sm">Sponsorships</span>
										<p className="whitespace-pre-wrap text-sm capitalize italic leading-relaxed">
											{event.use_sponsorship ? "Enabled" : "Disabled"}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</BlankCard>
			)}

			{/* Column 3: Additional Information */}
		</div>
	);
}
