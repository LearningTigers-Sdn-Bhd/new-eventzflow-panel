"use client";

import { FileText } from "lucide-react";
import { IconViewer } from "@/components/admin-ui/form/icon-viewer";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemFooter,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import type { ResourceTopic } from "@/lib/api/resource/topic/response";
import { TopicsActionMenu } from "./topics-action-menu";

interface TopicsItemProps {
	topic: ResourceTopic;
}

export function TopicsItem({ topic }: TopicsItemProps) {
	return (
		<Item variant="outline" className="rounded-none">
			<ItemHeader>
				<ItemTitle className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center border bg-muted">
						<IconViewer name={topic.logo} />
					</div>
					<span className="font-medium">{topic.name}</span>
				</ItemTitle>
			</ItemHeader>
			<ItemContent>
				<div className="flex items-start gap-2 text-muted-foreground text-sm">
					<FileText className="mt-0.5 h-4 w-4 shrink-0" />
					<p className="line-clamp-2">
						{topic.description || "No description"}
					</p>
				</div>
			</ItemContent>
			<ItemFooter className="flex items-center justify-between text-muted-foreground text-xs">
				<span>Created: {new Date(topic.createdAt).toLocaleDateString()}</span>
				<ItemActions>
					<TopicsActionMenu topic={topic} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
