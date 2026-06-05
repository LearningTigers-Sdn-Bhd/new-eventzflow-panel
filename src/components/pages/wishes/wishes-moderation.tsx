"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronDown,
	ExternalLink,
	Info,
	MonitorPlay,
	Settings2,
} from "lucide-react";
import Link from "next/link";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useDialog } from "@/hooks/use-dialog";
import { getEventById, updateEvent } from "@/lib/api/event";
import { listWishes } from "@/lib/api/wishes";
import { getAutoRefreshQueryOptions } from "@/lib/query/auto-refresh";
import { DataTable } from "./table/wishes-table";
import { getWishesColumns } from "./table/wishes-table-columns";
import { WishWallSettingsDialogContent } from "./wall-settings-dialog";

type WishesModerationProps = {
	eventId: string;
};

export function WishesModeration({ eventId }: WishesModerationProps) {
	const queryClient = useQueryClient();
	const { openDialog, closeDialog } = useDialog();

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

	const openWallSettings = () => {
		openDialog({
			component: WishWallSettingsDialogContent,
			config: {
				title: "Wishes Wall Settings",
				description:
					"Choose how approved wishes appear on the live venue screen.",
				size: "full",
				showCloseButton: true,
			},
			props: {
				eventId,
				event,
				onClose: closeDialog,
			},
		});
	};

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
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="w-full rounded-none sm:w-auto sm:shrink-0"
						>
							Configuration
							<Settings2 className="ml-2 h-4 w-4" />
							<ChevronDown className="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-56 rounded-none bg-background"
					>
						<DropdownMenuItem asChild className="rounded-none">
							<Link
								href={`/events/${event?.slug}/guestbook`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<ExternalLink className="h-4 w-4" />
								<span>Open Form</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={openWallSettings}
							className="rounded-none"
						>
							<Settings2 className="h-4 w-4" />
							<span>Wall Configuration</span>
						</DropdownMenuItem>
						<DropdownMenuSeparator className="rounded-none" />
						<DropdownMenuItem asChild className="rounded-none">
							<Link
								href={`/events/${event?.slug}/wishes-wall`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<MonitorPlay className="h-4 w-4" />
								<span>Live Wall</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<DataTable columns={columns} data={wishes} eventId={eventId} />
		</div>
	);
}
