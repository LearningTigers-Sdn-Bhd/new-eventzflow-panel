"use client";

import {
	Calendar,
	ExternalLink,
	Mail,
	MessageSquare,
	Shield,
	UsersIcon,
} from "lucide-react";
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
		<Item variant="outline" className="w-full rounded-none">
			<ItemContent className="flex flex-col gap-3">
				<ItemTitle className="flex items-center justify-between">
					<span className="font-bold">{member.full_name}</span>
				</ItemTitle>
				<div className="flex items-center gap-2">
					<Badge
						variant="outline"
						className={cn(
							"w-full max-w-36 rounded-none font-bold capitalize",
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
							"w-full max-w-28 rounded-none font-bold capitalize",
							member.status === "active" && "bg-green-500",
							member.status === "inactive" && "bg-red-500",
						)}
					>
						{member.status}
					</Badge>
				</div>
				<div className="flex w-full flex-col text-muted-foreground text-sm">
					<div className="group flex w-full items-center gap-0.5">
						<Mail className="size-4" />
						<Button
							variant="ghost"
							size="sm"
							className="rounded-none hover:bg-transparent"
							onClick={handleEmailClick}
						>
							<span className="text-sm group-hover:underline">
								{member.email}
							</span>
							<ExternalLink className="size-3" />
						</Button>
					</div>
					{member.phone && (
						<div className="group flex w-full items-center gap-0.5">
							<MessageSquare className="size-4" />
							<Button
								variant="ghost"
								size="sm"
								className="rounded-none hover:bg-transparent"
								onClick={handleWhatsAppClick}
							>
								<span className="text-sm group-hover:underline">
									{member.phone}
								</span>
								<ExternalLink className="size-3" />
							</Button>
						</div>
					)}
					<div className="flex w-full items-center gap-0.5">
						<Calendar className="size-4" />
						<span className="px-2.5 text-sm">
							Assigned on {formatDate(member.createdAt)}
						</span>
					</div>
				</div>
			</ItemContent>
			<ItemActions>
				<EventStaffActionsMenu member={member} />
			</ItemActions>
		</Item>
	);
}
