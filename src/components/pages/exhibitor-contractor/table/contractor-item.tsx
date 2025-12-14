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
import type { ExhibitionContractor } from "@/lib/api/contractor";
import { ContractorActionsMenu } from "./action-menu";

interface ContractorItemProps {
	contractor: ExhibitionContractor;
}

export function ContractorItem({ contractor }: ContractorItemProps) {
	const { formatDate } = useFormatDate();
	const profile = contractor.exhibition_contractor_profile;

	const handleEmailClick = () => {
		window.location.href = `mailto:${contractor.email}`;
	};

	const handleWhatsAppClick = () => {
		if (contractor.phone) {
			window.open(
				`https://wa.me/${contractor.phone.replace(/[^0-9]/g, "")}`,
				"_blank",
			);
		}
	};

	return (
		<Item variant="outline" className="w-full">
			<ItemContent className="flex-1">
				<ItemTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2">
						<div className="flex flex-col">
							<span className="font-medium">{contractor.full_name}</span>
							<span className="font-normal text-muted-foreground text-xs">
								{profile?.company_name ?? "No company"}
							</span>
						</div>
						<Badge
							variant={contractor.status === "active" ? "default" : "secondary"}
							className="rounded-none capitalize"
						>
							{contractor.status}
						</Badge>
					</span>
				</ItemTitle>
				<div className="flex flex-col gap-1 text-muted-foreground text-sm">
					<span className="flex items-center gap-2">
						<Mail className="h-3 w-3" />
						<span className="text-xs">{contractor.email}</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-5 w-5"
							onClick={handleEmailClick}
						>
							<Mail className="size-3" />
						</Button>
					</span>
					{contractor.phone && (
						<span className="flex items-center gap-2">
							<MessageSquare className="h-3 w-3" />
							<span className="text-xs">{contractor.phone}</span>
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
					{contractor.created_at && (
						<span className="text-xs">
							Joined on {formatDate(contractor.created_at)}
						</span>
					)}
				</div>
			</ItemContent>
			<ItemActions>
				<ContractorActionsMenu contractor={contractor} />
			</ItemActions>
		</Item>
	);
}
