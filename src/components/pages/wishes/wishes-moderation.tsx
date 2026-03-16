"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Info, MonitorPlay, RefreshCw } from "lucide-react";
import Link from "next/link";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getEventById, updateEvent } from "@/lib/api/event";
import { listWishes } from "@/lib/api/wishes";
import { getAutoRefreshQueryOptions } from "@/lib/query/auto-refresh";
import { DataTable } from "./table/wishes-table";
import { getWishesColumns } from "./table/wishes-table-columns";

type WishesModerationProps = {
	eventId: string;
};

export function WishesModeration({ eventId }: WishesModerationProps) {
	const queryClient = useQueryClient();

	const { data: event } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
		enabled: !!eventId,
	});

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["wishes", eventId],
		queryFn: () => listWishes(eventId),
		enabled: !!eventId,
		...getAutoRefreshQueryOptions(),
	});

	const autoApproveMutation = useMutation({
		mutationFn: (enabled: boolean) =>
			updateEvent(eventId, { auto_approve_wishes: enabled }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["event", eventId] });
		},
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading guestbook wishes..."
				description="Fetching blessings for moderation."
				height="h-[60vh]"
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Unable to load wishes"
				description={
					error instanceof Error ? error.message : "Please try again."
				}
				action={
					<Button onClick={() => refetch()} variant="outline">
						Try Again
					</Button>
				}
				height="h-[60vh]"
			/>
		);
	}

	const columns = getWishesColumns(eventId);
	const wishes = data?.wishes ?? [];

	return (
		<div className="space-y-4">
			<div className="flex flex-1 items-start gap-3 rounded-none border border-dashed bg-muted/30 p-4">
				<Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
				<div className="flex-1 space-y-1">
					<div className="flex items-center justify-between">
						<p className="font-medium text-sm">Auto-approve wishes</p>
						<Switch
							checked={event?.auto_approve_wishes ?? false}
							onCheckedChange={(checked) => autoApproveMutation.mutate(checked)}
							disabled={autoApproveMutation.isPending}
							aria-label="Auto-approve wishes"
						/>
					</div>
					<p className="text-muted-foreground text-sm">
						New guestbook submissions appear on the wishes wall immediately
						without manual approval.
					</p>
				</div>
			</div>

			<div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
				<Button
					variant="outline"
					asChild
					className="w-full rounded-none sm:w-auto sm:shrink-0"
				>
					<Link
						href={`/events/${event?.slug}/guestbook`}
						target="_blank"
						rel="noopener noreferrer"
					>
						View Form
						<ExternalLink className="ml-2 h-4 w-4" />
					</Link>
				</Button>
				<Button
					variant="outline"
					asChild
					className="w-full rounded-none sm:w-auto sm:shrink-0"
				>
					<Link
						href={`/events/${event?.slug}/wishes-wall`}
						target="_blank"
						rel="noopener noreferrer"
					>
						Live Wall
						<MonitorPlay className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</div>

			<DataTable columns={columns} data={wishes} eventId={eventId} view="table" />
		</div>
	);
}
