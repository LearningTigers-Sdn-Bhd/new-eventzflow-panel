"use client";

import { Mail, MessageSquare } from "lucide-react";
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
import { TeamMemberActionsMenu } from "./action-menu";
import type { TeamMember } from "./team-member-table-columns";

interface TeamMemberItemProps {
	member: TeamMember;
}

export function TeamMemberItem({ member }: TeamMemberItemProps) {
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

	const roleLabel =
		member.role === "org_owner"
			? "Owner"
			: member.role === "organizer"
				? "Organizer"
				: member.role === "vendor"
					? "Vendor"
					: "Member";

	return (
		<Item variant="outline" className="w-full">
			<ItemContent className="flex-1">
				<ItemTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2">
						<span className="font-medium">{member.full_name}</span>
						<Badge
							variant="outline"
							className={cn(
								"min-w-16 font-bold capitalize",
								member.role === "org_owner" &&
									"border-purple-500 text-purple-500",
								member.role === "organizer" && "border-blue-500 text-blue-500",
								member.role === "vendor" && "border-orange-500 text-orange-500",
								member.role === "member" && "border-gray-500 text-gray-500",
							)}
						>
							{roleLabel}
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
						Joined on {formatDate(member.createdAt)}
					</span>
				</div>
			</ItemContent>
			<ItemActions>
				<TeamMemberActionsMenu member={member} />
			</ItemActions>
		</Item>
	);
}
