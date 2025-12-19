"use client";

import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useFormatDate } from "@/hooks/use-format-date";
import type { Event } from "@/lib/api/event/response";
import { cn } from "@/lib/utils";

interface EventDetailsViewProps {
	event: Event;
}

export function EventDetailsView({ event }: EventDetailsViewProps) {
	const { formatDate } = useFormatDate();
	const { isVendor, isExhibitionContractor } = useEventPermissions(
		event.id,
		event,
	);

	const showWebhookUrl = !isVendor && !isExhibitionContractor;
	const showColumn2 = !isVendor && !isExhibitionContractor;

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
			className={cn(
				"grid grid-cols-1 gap-6 border border-dashed p-1 md:p-4",
				showColumn2 && "lg:grid-cols-2",
			)}
		>
			{/* Column 1: Event Description & Status */}
			<div className="grid grid-cols-1 divide-y divide-muted-foreground/20 rounded-none border">
				<div className="flex flex-col gap-1 px-3 py-2">
					<p className="font-medium text-muted-foreground text-sm">
						Event Description
					</p>
					<p className="whitespace-pre-wrap text-sm leading-relaxed">
						{event.description || "No description provided."}
					</p>
				</div>

				{/* Status & Type */}
				<div className="grid grid-cols-2 divide-x divide-muted-foreground/20">
					<div className="flex flex-row items-center justify-between gap-1 px-3 py-2 md:flex-col md:items-start md:justify-start xl:flex-row xl:items-center xl:justify-between">
						<p className="font-medium text-muted-foreground text-sm">Status</p>
						<Badge
							className={cn(
								"w-fit rounded-none px-3 py-1 capitalize",
								event.status === "published" &&
									"bg-green-500 text-white hover:bg-green-600",
								event.status === "draft" &&
									"bg-yellow-500 text-white hover:bg-yellow-600",
								event.status === "cancelled" &&
									"bg-red-500 text-white hover:bg-red-600",
								event.status === "completed" &&
									"bg-blue-500 text-white hover:bg-blue-600",
							)}
						>
							{event.status}
						</Badge>
					</div>

					<div className="flex flex-row items-center justify-between gap-1 px-3 py-2 md:flex-col md:items-start md:justify-start xl:flex-row xl:items-center xl:justify-between">
						<p className="font-medium text-muted-foreground text-sm">Type</p>
						<Badge
							className={cn(
								"w-fit rounded-none px-3 py-1",
								event.use_ticket
									? "bg-purple-500 text-white hover:bg-purple-600"
									: "bg-cyan-500 text-white hover:bg-cyan-600",
							)}
						>
							{event.use_ticket ? "Ticket Event" : "Visitor Event"}
						</Badge>
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
			</div>

			{/* Column 2: Labels */}
			{showColumn2 && (
				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<p className="font-medium text-muted-foreground text-sm">
							Labels Required
						</p>
						{labels.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{labels.map((item) => (
									<div
										key={item.key}
										className="flex items-center rounded-none border bg-muted/50 px-3 py-1.5 text-xs"
									>
										<span className="font-semibold">{item.label}</span>
									</div>
								))}
							</div>
						) : (
							<p className="text-muted-foreground text-sm italic">
								No labels configured for this event.
							</p>
						)}
					</div>
					<div className="flex flex-col gap-6">
						<div className="space-y-4">
							<p className="font-medium text-muted-foreground text-sm">
								Event Options
							</p>
							<div className="grid grid-cols-1 divide-y divide-muted-foreground/20 rounded-none border">
								<div className="flex items-center justify-between rounded-none p-3">
									<span className="text-sm">Multiple Scans Allowed</span>
									<Badge
										className={cn(
											"min-w-24 rounded-none",
											event.multiple_scans
												? "bg-green-500 text-white hover:bg-green-600"
											: "bg-red-500 text-white hover:bg-red-600",
										)}
									>
										{event.multiple_scans ? "Yes" : "No"}
									</Badge>
								</div>
								<div className="flex items-center justify-between rounded-none p-3">
									<span className="text-sm">Exhibitor Kit</span>
									<Badge
										className={cn(
											"min-w-24 rounded-none",
											event.use_exhibitor_kit
												? "bg-green-500 text-white hover:bg-green-600"
												: "bg-red-500 text-white hover:bg-red-600",
										)}
									>
										{event.use_exhibitor_kit ? "Enabled" : "Disabled"}
									</Badge>
								</div>
								<div className="flex items-center justify-between rounded-none p-3">
									<span className="text-sm">Contractor Printing</span>
									<Badge
										className={cn(
											"min-w-24 rounded-none",
											event.allow_contractor_printing_services
												? "bg-green-500 text-white hover:bg-green-600"
												: "bg-red-500 text-white hover:bg-red-600",
										)}
									>
										{event.allow_contractor_printing_services
											? "Allowed"
											: "Not Allowed"}
									</Badge>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Column 3: Additional Information */}
		</div>
	);
}
