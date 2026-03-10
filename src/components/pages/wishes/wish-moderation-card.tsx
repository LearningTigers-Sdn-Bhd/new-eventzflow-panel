"use client";

import { format } from "date-fns";
import { Check, Clock3, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Wish } from "@/lib/api/wishes";

type WishModerationCardProps = {
	wish: Wish;
	onApprove?: () => void;
	onReject?: () => void;
	onDelete?: () => void;
	busy?: boolean;
};

function formatTimestamp(value: string | null) {
	if (!value) return "Just now";
	return format(new Date(value), "d MMM yyyy, h:mm a");
}

export function WishModerationCard({
	wish,
	onApprove,
	onReject,
	onDelete,
	busy = false,
}: WishModerationCardProps) {
	const isPending = wish.status === "pending";

	return (
		<Card className="gap-4 rounded-[1.5rem] border-stone-200/80 bg-white/95 py-0 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.35)]">
			<CardHeader className="gap-3 border-stone-100 border-b px-5 py-5">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="font-semibold text-[11px] text-stone-500 uppercase tracking-[0.28em]">
							{wish.status}
						</p>
						<CardTitle className="mt-2 font-serif text-2xl text-stone-900 italic">
							{wish.guest_name}
						</CardTitle>
					</div>
					<div className="flex items-center gap-2 text-sm text-stone-400">
						<Clock3 className="h-4 w-4" />
						<span>{formatTimestamp(wish.approved_at ?? wish.created_at)}</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="px-5 pb-0">
				<p className="text-base text-stone-700 leading-relaxed">{wish.message}</p>
			</CardContent>
			<CardFooter className="flex flex-wrap justify-end gap-3 px-5 py-5">
				{isPending ? (
					<>
						<Button
							variant="outline"
							onClick={onReject}
							disabled={busy}
							className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
						>
							<X className="h-4 w-4" />
							Reject
						</Button>
						<Button
							onClick={onApprove}
							disabled={busy}
							className="rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
						>
							<Check className="h-4 w-4" />
							Approve
						</Button>
					</>
				) : (
					<Button
						variant="outline"
						onClick={onDelete}
						disabled={busy}
						className="rounded-full border-stone-200 text-stone-700 hover:bg-stone-50"
					>
						<Trash2 className="h-4 w-4" />
						Delete
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
