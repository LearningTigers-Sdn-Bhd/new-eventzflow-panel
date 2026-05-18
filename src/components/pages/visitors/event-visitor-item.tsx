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
			className="h-auto w-full flex-col items-stretch border-none px-3 py-3 transition-colors hover:bg-muted/30"
		>
			<div className="flex w-full items-start gap-2">
				<ItemMedia variant="image" className="mt-0.5 size-9 shrink-0">
					<Avatar className="size-9 rounded-none border shadow-sm">
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
				<ItemContent className="ml-2.5 min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0 flex-1">
							<ItemTitle
								className="line-clamp-2 cursor-pointer break-words font-bold text-[15px] leading-tight transition-colors hover:text-primary"
								onClick={openViewModal}
							>
								{visitor.full_name}
							</ItemTitle>
						</div>
						<div className="shrink-0 self-start pt-0.5">
							{isCheckedIn ? (
								<Badge
									variant="outline"
									className="h-6 gap-1 rounded-none border-green-200 bg-green-50 px-2 font-bold text-[10px] text-green-700 uppercase"
								>
									<CheckCircle2 className="size-3" />
									Checked In
								</Badge>
							) : (
								<Badge
									variant="outline"
									className="h-6 gap-1 rounded-none border-gray-200 bg-gray-50 px-2 font-bold text-[10px] text-gray-500 uppercase"
								>
									<Clock className="size-3" />
									Not Scanned
								</Badge>
							)}
						</div>
					</div>
					<ItemDescription className="mt-1.5 flex flex-col gap-1">
						<div className="flex min-w-0 items-start gap-1.5">
							<User className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/70" />
							<span
								className="block break-words font-semibold text-[11px] text-muted-foreground uppercase tracking-wider"
								title={visitor.public_id}
							>
								{visitor.public_id}
							</span>
						</div>
						<div className="flex justify-end">
							<ItemActions className="shrink-0">
								<VisitorActionsMenu visitor={visitor} />
							</ItemActions>
						</div>
					</ItemDescription>
				</ItemContent>
			</div>
		</Item>
	);
}
