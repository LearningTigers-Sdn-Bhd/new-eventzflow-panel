"use client";

import { Mail, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { useFormatDate } from "@/hooks/use-format-date";
import type { Vendor } from "@/lib/api/vendor";
import { cn } from "@/lib/utils";
import { VendorActionsMenu } from "./action-menu";

interface VendorItemProps {
	vendor: Vendor;
}

export function VendorItem({ vendor }: VendorItemProps) {
	const { formatDate } = useFormatDate();

	const handleEmailClick = () => {
		window.location.href = `mailto:${vendor.email}`;
	};

	const handleWhatsAppClick = () => {
		if (vendor.phone) {
			window.open(
				`https://wa.me/${vendor.phone.replace(/[^0-9]/g, "")}`,
				"_blank",
			);
		}
	};

	return (
		<Item variant="outline" className="w-full">
			<ItemContent className="flex-1">
				<ItemTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2">
						<span className="font-medium">{vendor.full_name}</span>
						<Badge
							className={cn(
								"min-w-16 font-bold capitalize",
								vendor.status === "active" && "bg-green-500",
								vendor.status === "inactive" && "bg-red-500",
							)}
						>
							{vendor.status}
						</Badge>
					</span>
				</ItemTitle>
				<div className="flex flex-col gap-1 text-muted-foreground text-sm">
					<span className="flex items-center gap-2">
						<Mail className="h-3 w-3" />
						<span className="text-xs">{vendor.email}</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-5 w-5"
							onClick={handleEmailClick}
						>
							<Mail className="size-3" />
						</Button>
					</span>
					{vendor.phone && (
						<span className="flex items-center gap-2">
							<MessageSquare className="h-3 w-3" />
							<span className="text-xs">{vendor.phone}</span>
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
						Joined on {formatDate(vendor.createdAt)}
					</span>
				</div>
			</ItemContent>
			<ItemActions>
				<VendorActionsMenu vendor={vendor} />
			</ItemActions>
		</Item>
	);
}
