"use client";

import {
	Item,
	ItemActions,
	ItemContent,
	ItemTitle,
} from "@/components/ui/item";
import { useFormatDate } from "@/hooks/use-format-date";
import type { Group } from "@/lib/api/group/response";
import { GroupActionsMenu } from "./action-menu";

interface GroupItemProps {
	group: Group;
}

export function GroupItem({ group }: GroupItemProps) {
	const { formatDate } = useFormatDate();

	return (
		<Item variant="outline" className="w-full">
			<ItemContent className="flex-1">
				<ItemTitle className="flex items-center justify-between">
					<span className="font-medium">{group.name}</span>
				</ItemTitle>
				<div className="flex flex-col gap-1 text-muted-foreground text-sm">
					{group.description && (
						<span className="text-xs">{group.description}</span>
					)}
					<span className="text-xs">
						Created on {formatDate(group.created_at)}
					</span>
				</div>
			</ItemContent>
			<ItemActions>
				<GroupActionsMenu group={group} />
			</ItemActions>
		</Item>
	);
}
