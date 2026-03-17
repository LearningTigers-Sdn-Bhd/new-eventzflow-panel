"use client";

import type { Table as TanStackTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { MessageSquareHeart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/data-state";
import type { Wish } from "@/lib/api/wishes";
import { cn } from "@/lib/utils";
import { WishesActionMenu } from "./action-menu";

interface WishesCardGridProps<TData> {
	table: TanStackTable<TData>;
	eventId: string;
}

export function WishesCardGrid<TData>({
	table,
	eventId,
}: WishesCardGridProps<TData>) {
	const rows = table.getRowModel().rows;

	if (rows.length === 0) {
		return (
			<div className="flex min-h-[400px] items-center justify-center border border-dashed bg-muted/10">
				<EmptyState
					title="No wishes yet"
					description="New guestbook messages will appear here."
					icon={<MessageSquareHeart className="size-12 text-muted-foreground/50" />}
					height="h-auto"
				/>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{rows.map((row) => {
				const wish = row.original as Wish;
				const status = wish.status;

				return (
					<Card key={row.id} className="flex flex-col rounded-none border-dashed bg-muted/5 transition-all hover:border-primary/50 hover:bg-muted/10">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
							<div className="flex items-center gap-2 overflow-hidden">
								<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
									<User className="size-4 text-primary" />
								</div>
								<div className="overflow-hidden">
									<p className="truncate font-bold text-sm leading-none">
										{wish.guest_name}
									</p>
									<p className="mt-1 truncate text-muted-foreground text-xs">
										{format(new Date(wish.created_at), "d MMM, h:mm a")}
									</p>
								</div>
							</div>
							<Badge
								variant={
									status === "pending"
										? "secondary"
										: status === "approved"
											? "default"
											: "destructive"
								}
								className={cn(
									"h-5 rounded-none px-1.5 font-bold text-[10px] uppercase tracking-wider",
									status === "approved" && "bg-emerald-500 text-white hover:bg-emerald-600",
									status === "pending" && "bg-amber-500 text-white hover:bg-amber-600",
								)}
							>
								{status}
							</Badge>
						</CardHeader>
						<CardContent className="flex-1 p-4 pt-2">
							<p className="whitespace-pre-wrap font-medium text-muted-foreground text-sm leading-relaxed italic">
								"{wish.message}"
							</p>
						</CardContent>
						<CardFooter className="flex justify-end border-t border-dashed bg-muted/20 p-2">
							<WishesActionMenu wish={wish} eventId={eventId} />
						</CardFooter>
					</Card>
				);
			})}
		</div>
	);
}
