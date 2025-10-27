"use client";

import { Mail, MessageSquare, Shield, Users as UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemTitle,
} from "@/components/ui/item";
import { useFormatDate } from "@/hooks/use-format-date";
import { cn } from "@/lib/utils";
import { EventStaffActionsMenu } from "./action-menu";
import type { EventStaffMember } from "./columns";

interface EventStaffItemProps {
	member: EventStaffMember;
}

export function EventStaffItem({ member }: EventStaffItemProps) {
	const { formatDate } = useFormatDate();

	const handleEmailClick = () => {
		window.location.href = `mailto:${member.email}`;
	};

	const handleWhatsAppClick = () => {
		if (member.phone) {
			window.open(
				`https://wa.me/${member.phone.replace(/[^0-9]/g, "")}`,
				"_blank",
			);
		}
	};

	const eventRoleLabel =
		member.eventRole === "event_admin" ? "Admin" : "Team Member";

	return (
		<Item variant="outline" className="w-full">
			<ItemContent className="flex-1">
				<ItemTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2">
						<span className="font-medium">{member.full_name}</span>
						<Badge
							variant="outline"
							className={cn(
								"min-w-20 font-bold capitalize",
								member.eventRole === "event_admin" &&
									"border-purple-500 text-purple-500",
								member.eventRole === "event_team_member" &&
									"border-blue-500 text-blue-500",
							)}
						>
							{member.eventRole === "event_admin" ? (
								<Shield className="mr-1 h-3 w-3" />
							) : (
								<UsersIcon className="mr-1 h-3 w-3" />
							)}
							{eventRoleLabel}
						</Badge>
						<Badge
							className={cn(
								"min-w-16 font-bold capitalize",
								member.status === "active" && "bg-green-500",
								member.status === "inactive" && "bg-red-500",
							)}
						>
							{member.status}
						</Badge>
					</span>
				</ItemTitle>
				<div className="flex flex-col gap-1 text-muted-foreground text-sm">
					<span className="flex items-center gap-2">
						<Mail className="h-3 w-3" />
						<span className="text-xs">{member.email}</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-5 w-5"
							onClick={handleEmailClick}
						>
							<Mail className="size-3" />
						</Button>
					</span>
					{member.phone && (
						<span className="flex items-center gap-2">
							<MessageSquare className="h-3 w-3" />
							<span className="text-xs">{member.phone}</span>
							<Button
								variant="ghost"
								size="icon"
								className="h-5 w-5"
								onClick={handleWhatsAppClick}
							>
								<MessageSquare className="size-3" />
							</Button>
						</span>
					)}
					<span className="text-xs">
						Assigned on {formatDate(member.createdAt)}
					</span>
				</div>
			</ItemContent>
			<ItemActions>
				<EventStaffActionsMenu member={member} />
			</ItemActions>
		</Item>
	);
}
