"use client";

import {
	Calendar,
	ExternalLink,
	Mail,
	Building2,
	Link as LinkIcon,
	Image as ImageIcon,
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
import { EventVendorActionsMenu } from "./action-menu";
import type { EventVendorMember } from "./columns";

interface EventVendorItemProps {
	vendor: EventVendorMember;
}

export function EventVendorItem({ vendor }: EventVendorItemProps) {
	const { formatDate } = useFormatDate();

	const handleEmailClick = () => {
		window.location.href = `mailto:${vendor.vendor.email}`;
	};

	const handleRedirectClick = () => {
		if (vendor.redirect_url) {
			window.open(vendor.redirect_url, "_blank");
		}
	};

	const handlePosterClick = () => {
		if (vendor.poster_url) {
			window.open(vendor.poster_url, "_blank");
		}
	};

	return (
		<Item variant="outline" className="w-full rounded-none">
			<ItemContent className="flex flex-col gap-3">
				<ItemTitle className="flex items-center justify-between">
					<span className="font-bold">{vendor.vendor.full_name}</span>
				</ItemTitle>
				<div className="flex items-center gap-2">
					<Badge
						variant="outline"
						className={cn(
							"w-full max-w-36 rounded-none font-bold capitalize",
							vendor.type === "Exhibitor" &&
								"border-purple-500 text-purple-500",
							vendor.type === "Merchant" && "border-blue-500 text-blue-500",
						)}
					>
						{vendor.type === "Exhibitor" ? (
							<Building2 className="mr-1 h-3 w-3" />
						) : (
							<Building2 className="mr-1 h-3 w-3" />
						)}
						{vendor.type}
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
								{vendor.vendor.email}
							</span>
							<ExternalLink className="size-3" />
						</Button>
					</div>
					{vendor.redirect_url && (
						<div className="group flex w-full items-center gap-0.5">
							<LinkIcon className="size-4" />
							<Button
								variant="ghost"
								size="sm"
								className="rounded-none hover:bg-transparent"
								onClick={handleRedirectClick}
							>
								<span className="max-w-[200px] truncate text-sm group-hover:underline">
									{vendor.redirect_url}
								</span>
								<ExternalLink className="size-3" />
							</Button>
						</div>
					)}
					{vendor.poster_url && (
						<div className="group flex w-full items-center gap-0.5">
							<ImageIcon className="size-4" />
							<Button
								variant="ghost"
								size="sm"
								className="rounded-none hover:bg-transparent"
								onClick={handlePosterClick}
							>
								<span className="max-w-[200px] truncate text-sm group-hover:underline">
									{vendor.poster_url}
								</span>
								<ExternalLink className="size-3" />
							</Button>
						</div>
					)}
					<div className="flex w-full flex-col gap-0.5">
						<div className="flex items-center gap-0.5">
							<Calendar className="size-4" />
							<span className="px-2.5 text-sm">
								Added on {formatDate(vendor.created_at)}
							</span>
						</div>
						<span className="px-2.5 pl-7 text-muted-foreground text-xs">
							{new Date(vendor.created_at).toLocaleTimeString('en-US', {
								hour: '2-digit',
								minute: '2-digit',
								hour12: true
							})}
						</span>
					</div>
				</div>
			</ItemContent>
			<ItemActions>
				<EventVendorActionsMenu vendor={vendor} />
			</ItemActions>
		</Item>
	);
}
