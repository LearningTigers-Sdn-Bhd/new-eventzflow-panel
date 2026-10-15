"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeedbackResponsePagination } from "@/lib/api/feedback-form";

export function SimplePager({
	pagination,
	onPage,
}: {
	pagination: FeedbackResponsePagination;
	onPage: (page: number) => void;
}) {
	if (pagination.total_pages <= 1) return null;
	return (
		<div className="flex items-center justify-between gap-3 pt-2 text-muted-foreground text-sm">
			<span>
				{pagination.from}–{pagination.to} of {pagination.total_count}
			</span>
			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="rounded-none"
					disabled={!pagination.prev_page}
					onClick={() => pagination.prev_page && onPage(pagination.prev_page)}
				>
					<ChevronLeft className="size-4" />
					Previous
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="rounded-none"
					disabled={!pagination.next_page}
					onClick={() => pagination.next_page && onPage(pagination.next_page)}
				>
					Next
					<ChevronRight className="size-4" />
				</Button>
			</div>
		</div>
	);
}
