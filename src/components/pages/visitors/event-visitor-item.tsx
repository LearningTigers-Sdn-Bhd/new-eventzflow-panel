"use client";

import { CheckCircle2, Clock, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { useDialog } from "@/hooks/use-dialog";
import type { Visitor } from "@/lib/api/visitor";
import { cn } from "@/lib/utils";
import ViewEventVisitorModal from "./action-modals/view-event-visitor-modal";
import { VisitorActionsMenu } from "./event-visitor-action-menu";

interface VisitorItemProps {
	visitor: Visitor;
	labelsData?: Record<string, string>;
}

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function VisitorItem({ visitor }: VisitorItemProps) {
	const isCheckedIn = visitor.checked_in;
	const { openDialog } = useDialog();

	const openViewModal = () => {
		openDialog({
			component: ViewEventVisitorModal,
			config: {
				title: "View Visitor",
				description: "View the visitor information.",
				size: "2xl",
				showCloseButton: true,
				className: "rounded-none",
			},
			props: { visitor },
		});
	};

	return (
		<Item
			variant="default"
			className="h-auto w-full flex-col items-stretch border-none px-4 py-4 transition-colors hover:bg-muted/30"
		>
			<div className="flex w-full items-start">
				<ItemMedia variant="image" className="mt-0.5 size-10 shrink-0">
					<Avatar className="size-10 rounded-none border shadow-sm">
						<AvatarFallback
							className={cn(
								"rounded-none font-bold text-xs",
								isCheckedIn
									? "bg-green-100 text-green-700"
									: "bg-blue-100 text-blue-700",
							)}
						>
							{getInitials(visitor.full_name || "V")}
						</AvatarFallback>
					</Avatar>
				</ItemMedia>
				<ItemContent className="ml-3 flex-1 min-w-0">
					<ItemTitle
						className="cursor-pointer text-wrap break-words font-bold text-base leading-tight transition-colors hover:text-primary"
						onClick={openViewModal}
					>
						{visitor.full_name}
					</ItemTitle>
					<ItemDescription className="mt-2 flex items-center gap-1.5">
						<User className="size-3.5 shrink-0 text-muted-foreground/70" />
						<span className="truncate font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
							{visitor.public_id}
						</span>
					</ItemDescription>
				</ItemContent>
			</div>

			<div className="mt-4 flex w-full items-center justify-between gap-2">
				<div className="flex-1">
					{isCheckedIn ? (
						<Badge
							variant="outline"
							className="h-7 gap-1.5 rounded-none border-green-200 bg-green-50 px-2.5 font-bold text-[10px] text-green-700 uppercase"
						>
							<CheckCircle2 className="size-3.5" />
							Checked In
						</Badge>
					) : (
						<Badge
							variant="outline"
							className="h-7 gap-1.5 rounded-none border-gray-200 bg-gray-50 px-2.5 font-bold text-[10px] text-gray-500 uppercase"
						>
							<Clock className="size-3.5" />
							Pending
						</Badge>
					)}
				</div>
				<ItemActions className="shrink-0">
					<VisitorActionsMenu visitor={visitor} />
				</ItemActions>
			</div>
		</Item>
	);
}
