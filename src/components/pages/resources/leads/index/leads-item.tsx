"use client";

import { Building2, MapPin, Mail, Phone, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemFooter,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import type { ResourceLead } from "@/lib/api/resource/lead/response";
import { cn } from "@/lib/utils";
import { LeadsActionMenu } from "./leads-action-menu";

interface LeadsItemProps {
	lead: ResourceLead;
	onClick?: () => void;
}

export function LeadsItem({ lead, onClick }: LeadsItemProps) {
	return (
		<Item
			variant="outline"
			className={cn(
				"rounded-none",
				onClick && "cursor-pointer transition-colors hover:bg-accent/50",
			)}
			onClick={onClick}
		>
			<ItemHeader>
				<ItemTitle className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center border bg-muted">
							<Mail className="h-4 w-4 text-muted-foreground" />
						</div>
						<span className="line-clamp-2 font-medium">{lead.name}</span>
					</div>
				</ItemTitle>
			</ItemHeader>
			<ItemContent>
				<div className="flex flex-col gap-2 text-muted-foreground text-xs">
					{/* Email */}
					<div className="flex items-center gap-2">
						<Mail className="h-3 w-3 shrink-0" />
						<span className="line-clamp-1">{lead.email}</span>
					</div>

					{/* Phone */}
					{lead.phone && (
						<div className="flex items-center gap-2">
							<Phone className="h-3 w-3 shrink-0" />
							<span>{lead.phone}</span>
						</div>
					)}

					{/* Company & Job Title */}
					{(lead.company || lead.jobTitle) && (
						<div className="flex items-center gap-2">
							<Building2 className="h-3 w-3 shrink-0" />
							<div className="flex flex-col">
								{lead.company && <span>{lead.company}</span>}
								{lead.jobTitle && (
									<span className="text-[10px]">{lead.jobTitle}</span>
								)}
							</div>
						</div>
					)}

					{/* Location */}
					{(lead.country || lead.state) && (
						<div className="flex items-center gap-2">
							<MapPin className="h-3 w-3 shrink-0" />
							<span>
								{[lead.state, lead.country].filter(Boolean).join(", ")}
							</span>
						</div>
					)}

					{/* Resource */}
					{lead.resource && (
						<div className="mt-2 flex items-start gap-2">
							<FileText className="mt-0.5 h-3 w-3 shrink-0" />
							<div className="flex flex-col">
								<span className="text-foreground text-xs">
									{lead.resource.title}
								</span>
								<span className="font-mono text-[10px]">
									/{lead.resource.slug}
								</span>
							</div>
						</div>
					)}
				</div>
			</ItemContent>
			<ItemFooter className="flex items-center justify-between text-muted-foreground text-xs">
				<span>
					Submitted: {new Date(lead.createdAt).toLocaleDateString()}
				</span>
				<ItemActions>
					<LeadsActionMenu lead={lead} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
