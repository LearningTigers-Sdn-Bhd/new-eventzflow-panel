"use client";

import {
	Calendar,
	ExternalLink,
	Mail,
	MessageSquare,
	ShieldCheck,
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
import type { ResourcePermission } from "@/lib/api/resource/permission";
import { cn } from "@/lib/utils";
import { PermissionsActionsMenu } from "./permissions-action-menu";

interface PermissionsItemProps {
	permission: ResourcePermission;
}

export function PermissionsItem({ permission }: PermissionsItemProps) {
	const { formatDate } = useFormatDate();

	const handleEmailClick = () => {
		window.location.href = `mailto:${permission.user.email}`;
	};

	const handleWhatsAppClick = () => {
		if (permission.user.phone) {
			window.open(
				`https://wa.me/${permission.user.phone.replace(/[^0-9]/g, "")}`,
				"_blank",
			);
		}
	};

	return (
		<Item variant="outline" className="w-full rounded-none">
			<ItemContent className="flex flex-col gap-3">
				<ItemTitle className="flex items-center justify-between">
					<span className="font-bold">{permission.user.fullName}</span>
				</ItemTitle>
				<div className="flex items-center gap-2">
					<Badge
						className={cn(
							"w-full max-w-28 rounded-none font-bold capitalize",
							permission.status === "partnership"
								? "bg-purple-500"
								: "bg-blue-500",
						)}
					>
						{permission.status === "partnership" ? "Partnership" : "Regular"}
					</Badge>
					<Badge
						variant="outline"
						className={cn(
							"w-full max-w-28 rounded-none font-bold capitalize",
							permission.isOfficial
								? "border-purple-500 text-purple-500"
								: "border-muted-foreground text-muted-foreground",
						)}
					>
						{permission.isOfficial ? (
							<>
								<ShieldCheck className="mr-1 h-3 w-3" />
								Official
							</>
						) : (
							"Member"
						)}
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
								{permission.user.email}
							</span>
							<ExternalLink className="size-3" />
						</Button>
					</div>
					{permission.user.phone && (
						<div className="group flex w-full items-center gap-0.5">
							<MessageSquare className="size-4" />
							<Button
								variant="ghost"
								size="sm"
								className="rounded-none hover:bg-transparent"
								onClick={handleWhatsAppClick}
							>
								<span className="text-sm group-hover:underline">
									{permission.user.phone}
								</span>
								<ExternalLink className="size-3" />
							</Button>
						</div>
					)}
					<div className="flex w-full items-center gap-0.5">
						<Calendar className="size-4" />
						<span className="px-2.5 text-sm">
							Created on {formatDate(permission.createdAt)}
						</span>
					</div>
				</div>
			</ItemContent>
			<ItemActions>
				<PermissionsActionsMenu permission={permission} />
			</ItemActions>
		</Item>
	);
}
