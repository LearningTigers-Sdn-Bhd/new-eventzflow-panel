"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareHeart, RefreshCw } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventById, updateEvent } from "@/lib/api/event";
import { approveWish, deleteWish, listWishes, rejectWish } from "@/lib/api/wishes";
import { WishModerationCard } from "./wish-moderation-card";

type WishesModerationProps = {
	eventId: string;
};

type WishStatus = "pending" | "approved" | "rejected";

export function WishesModeration({ eventId }: WishesModerationProps) {
	const [activeTab, setActiveTab] = useState<WishStatus>("pending");
	const queryClient = useQueryClient();

	const { data: event } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
		enabled: !!eventId,
	});

	const {
		data,
		isLoading,
		error,
		refetch,
		isFetching,
	} = useQuery({
		queryKey: ["wishes", eventId, activeTab],
		queryFn: () => listWishes(eventId, activeTab),
		enabled: !!eventId,
	});

	const invalidateWishes = async () => {
		await queryClient.invalidateQueries({ queryKey: ["wishes", eventId] });
	};

	const approveMutation = useMutation({
		mutationFn: (wishId: number) => approveWish(eventId, wishId),
		onSuccess: invalidateWishes,
	});

	const rejectMutation = useMutation({
		mutationFn: (wishId: number) => rejectWish(eventId, wishId),
		onSuccess: invalidateWishes,
	});

	const deleteMutation = useMutation({
		mutationFn: (wishId: number) => deleteWish(eventId, wishId),
		onSuccess: invalidateWishes,
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
				description={error instanceof Error ? error.message : "Please try again."}
				action={
					<Button onClick={() => refetch()} variant="outline">
						Try Again
					</Button>
				}
				height="h-[60vh]"
			/>
		);
	}

	const wishes = data?.wishes ?? [];

	return (
		<div className="space-y-6 px-4 py-6 sm:px-6">
			<div className="flex flex-col gap-4 rounded-[1.75rem] border border-stone-200/70 bg-gradient-to-br from-white to-stone-50 p-6 shadow-[0_25px_70px_-45px_rgba(0,0,0,0.35)] sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="flex items-center gap-2 font-semibold text-[11px] text-stone-500 uppercase tracking-[0.3em]">
						<MessageSquareHeart className="h-4 w-4" />
						Wedding Guestbook
					</p>
					<h1 className="mt-3 font-serif text-3xl text-stone-900 italic sm:text-4xl">
						{event?.title ?? "Guestbook moderation"}
					</h1>
					<p className="mt-3 max-w-2xl text-stone-500 leading-relaxed">
						Approve heartfelt blessings for the live wishes wall, or keep unsuitable messages out of the venue display.
					</p>
					<div className="mt-5 flex max-w-xl items-start gap-4 rounded-[1.25rem] border border-stone-200 bg-white/80 px-4 py-4">
						<Switch
							checked={event?.auto_approve_wishes ?? false}
							onCheckedChange={(checked) => autoApproveMutation.mutate(checked)}
							disabled={autoApproveMutation.isPending}
							aria-label="Auto-approve wishes"
						/>
						<div>
							<p className="font-semibold text-sm text-stone-900">Auto-approve wishes</p>
							<p className="mt-1 text-sm text-stone-500 leading-relaxed">
								New guestbook submissions appear on the wishes wall immediately without manual approval.
							</p>
						</div>
					</div>
				</div>
				<Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
					<RefreshCw className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
					Refresh
				</Button>
			</div>

			<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as WishStatus)}>
				<TabsList className="grid w-full grid-cols-3 rounded-full border border-stone-200 bg-white p-1 sm:w-[420px]">
					<TabsTrigger value="pending" className="rounded-full">
						Pending
					</TabsTrigger>
					<TabsTrigger value="approved" className="rounded-full">
						Approved
					</TabsTrigger>
					<TabsTrigger value="rejected" className="rounded-full">
						Rejected
					</TabsTrigger>
				</TabsList>
			</Tabs>

			{wishes.length === 0 ? (
				<EmptyState
					title={`No ${activeTab} wishes yet`}
					description="New guestbook messages will appear here once they match this moderation state."
					height="h-[45vh]"
				/>
			) : (
				<div className="grid gap-4 xl:grid-cols-2">
					{wishes.map((wish) => {
						const busy =
							approveMutation.isPending ||
							rejectMutation.isPending ||
							deleteMutation.isPending;

						return (
							<WishModerationCard
								key={wish.id}
								wish={wish}
								busy={busy}
								onApprove={
									wish.status === "pending"
										? () => approveMutation.mutate(wish.id)
										: undefined
								}
								onReject={
									wish.status === "pending"
										? () => rejectMutation.mutate(wish.id)
										: undefined
								}
								onDelete={
									wish.status !== "pending"
										? () => deleteMutation.mutate(wish.id)
										: undefined
								}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}
