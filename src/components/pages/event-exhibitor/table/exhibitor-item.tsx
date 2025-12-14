"use client";

import {
	Building2,
	CreditCard,
	ExternalLink,
	Mail,
	MapPin,
	Phone,
	Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { ExhibitorActionsMenu } from "./action-menu";
import type { ExhibitorMember } from "./columns";

interface ExhibitorItemProps {
	exhibitor: ExhibitorMember;
}

export function ExhibitorItem({ exhibitor }: ExhibitorItemProps) {
	const kit = exhibitor.exhibitor_kit;

	const getPaymentStatusColor = (status: string) => {
		const statusColors: Record<string, string> = {
			unpaid: "border-red-500 text-red-500",
			paid: "border-green-500 text-green-500",
			waived: "border-gray-500 text-gray-500",
			sponsored: "border-blue-500 text-blue-500",
		};
		return statusColors[status] || "";
	};

	return (
		<Item variant="outline" className="w-full rounded-none">
			<ItemContent className="flex flex-col gap-3">
				<ItemTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{kit?.booth_number && (
							<Badge variant="secondary" className="rounded-none font-mono">
								{kit.booth_number}
							</Badge>
						)}
						<span className="font-bold">
							{kit?.company_name || exhibitor.vendor.full_name}
						</span>
					</div>
				</ItemTitle>

				<div className="flex flex-wrap items-center gap-2">
					{kit?.booth_type && (
						<Badge
							variant="outline"
							className={cn(
								"rounded-none font-medium capitalize",
								kit.booth_type === "shell_scheme" &&
									"border-purple-500 text-purple-500",
								kit.booth_type === "raw_space" &&
									"border-orange-500 text-orange-500",
							)}
						>
							{kit.booth_type.replace("_", " ")}
						</Badge>
					)}
					{kit?.payment_status && (
						<Badge
							variant="outline"
							className={cn(
								"rounded-none font-bold capitalize",
								getPaymentStatusColor(kit.payment_status),
							)}
						>
							<CreditCard className="mr-1 h-3 w-3" />
							{kit.payment_status}
						</Badge>
					)}
				</div>

				<div className="flex w-full flex-col gap-2 text-muted-foreground text-sm">
					{kit?.name_on_fascia && (
						<div className="flex items-center gap-2">
							<Building2 className="size-4 shrink-0" />
							<span className="text-sm">Fascia: {kit.name_on_fascia}</span>
						</div>
					)}

					{kit?.pic_full_name && (
						<div className="flex items-center gap-2">
							<MapPin className="size-4 shrink-0" />
							<span className="font-medium text-sm">{kit.pic_full_name}</span>
						</div>
					)}

					{kit?.pic_email_address && (
						<div className="group flex items-center gap-2">
							<Mail className="size-4 shrink-0" />
							<Button
								variant="ghost"
								size="sm"
								className="h-auto rounded-none p-0 hover:bg-transparent"
								onClick={() =>
									(window.location.href = `mailto:${kit.pic_email_address}`)
								}
							>
								<span className="text-sm group-hover:underline">
									{kit.pic_email_address}
								</span>
								<ExternalLink className="ml-1 size-3" />
							</Button>
						</div>
					)}

					{kit?.pic_contact_number && (
						<div className="flex items-center gap-2">
							<Phone className="size-4 shrink-0" />
							<span className="text-sm">{kit.pic_contact_number}</span>
						</div>
					)}

					<div className="flex items-center gap-2">
						<Users className="size-4 shrink-0" />
						<span className="text-sm">
							{kit?.exhibitor_team_members?.length || 0} team member
							{(kit?.exhibitor_team_members?.length || 0) !== 1 ? "s" : ""}
						</span>
					</div>
				</div>
			</ItemContent>
			<ItemActions>
				<ExhibitorActionsMenu exhibitor={exhibitor} />
			</ItemActions>
		</Item>
	);
}
