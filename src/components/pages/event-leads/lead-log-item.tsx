"use client";

import { Calendar, Mail, Phone, StickyNote, Store } from "lucide-react";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import type { EventLeadWithDetails } from "@/lib/api/event-lead";

interface EventLeadItemProps {
	lead: EventLeadWithDetails;
}

export function EventLeadItem({ lead }: EventLeadItemProps) {
	const hasContact = lead.lead_email || lead.lead_phone;

	return (
		<Item variant="outline" className="h-full w-full">
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="w-full">
					<div className="flex items-center gap-2">
						<h3 className="font-bold text-lg leading-tight">
							{lead.lead_name}
						</h3>
						<span
							className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${
								lead.leadable_type === "Visitor"
									? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
									: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
							}`}
						>
							{lead.leadable_type}
						</span>
					</div>
				</ItemTitle>
				{hasContact && (
					<ItemDescription className="flex w-full flex-col gap-1">
						{lead.lead_phone && (
							<div className="flex items-center gap-1.5">
								<Phone className="size-3 shrink-0 text-muted-foreground" />
								<span className="font-medium text-muted-foreground text-sm">
									{lead.lead_phone}
								</span>
							</div>
						)}
						{lead.lead_email && (
							<div className="flex items-center gap-1.5">
								<Mail className="size-3 shrink-0 text-muted-foreground" />
								<span className="break-all font-medium text-muted-foreground text-sm">
									{lead.lead_email}
								</span>
							</div>
						)}
					</ItemDescription>
				)}
			</ItemHeader>
			<ItemContent className="flex flex-col gap-3">
				<div className="flex items-center gap-2">
					<Store className="size-4 shrink-0 text-muted-foreground" />
					<span className="font-medium text-muted-foreground text-sm">
						{lead.vendor_name}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Calendar className="size-4 shrink-0 text-muted-foreground" />
					<span className="font-medium text-muted-foreground text-sm">
						{new Date(lead.created_at).toLocaleString()}
					</span>
				</div>
				{lead.notes && (
					<div className="flex items-center gap-2">
						<StickyNote className="size-4 shrink-0 text-muted-foreground" />
						<span className="line-clamp-2 font-medium text-muted-foreground text-sm">
							{lead.notes}
						</span>
					</div>
				)}
			</ItemContent>
		</Item>
	);
}
