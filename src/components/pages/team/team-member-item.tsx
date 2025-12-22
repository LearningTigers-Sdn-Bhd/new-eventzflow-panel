"use client";

import { Mail, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
		<Item variant="outline" className="w-full gap-2 rounded-none">
			<ItemContent className="flex-1">
				<ItemTitle className="flex items-center justify-between">
					<span className="font-semibold text-base">{member.full_name}</span>
				</ItemTitle>
				<div className="flex flex-col gap-3 text-muted-foreground text-sm">
					<div className="flex flex-row gap-1">
						<Badge
							variant="outline"
							className={cn(
								"w-full max-w-18 rounded-none font-medium capitalize",
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
								"w-full max-w-18 rounded-none font-medium capitalize",
								member.status === "active" && "bg-green-500",
								member.status === "inactive" && "bg-red-500",
							)}
						>
							{member.status}
						</Badge>
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex items-center">
							<button
								type="button"
								className="flex items-center gap-2"
								onClick={handleEmailClick}
							>
								<Mail className="size-4" /> {member.email}
							</button>
						</div>
						{member.phone && (
							<button
								type="button"
								className="flex items-center gap-2"
								onClick={handleWhatsAppClick}
							>
								<MessageSquare className="size-4" /> {member.phone}
							</button>
						)}
					</div>
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
