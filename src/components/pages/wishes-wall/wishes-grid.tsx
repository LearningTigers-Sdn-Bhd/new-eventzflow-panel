"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/data-state";
import { cable } from "@/lib/cable";
import { fetchApprovedWishes, type Wish } from "@/lib/api/wishes";
import { WishCard } from "./wish-card";
import { mergeIncomingWish } from "./wishes-grid-state";

type WishesGridProps = {
	eventId: string;
	eventTitle: string;
	slug: string;
};

type WishesWallMessage =
	| { type: "state"; wishes: Wish[] }
	| { type: "new_wish"; wish: Wish }
	| { type: "remove_wish"; wish_id: number };

export function WishesGrid({ eventId, eventTitle, slug }: WishesGridProps) {
	const [wishes, setWishes] = useState<Wish[]>([]);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		let isMounted = true;

		void fetchApprovedWishes(slug).then((response) => {
			if (isMounted) {
				setWishes(response.wishes);
			}
		});

		const subscription = cable.subscriptions.create(
			{ channel: "WishesWallChannel", event_id: eventId },
			{
				connected() {
					setIsConnected(true);
				},
				disconnected() {
					setIsConnected(false);
				},
				received(data: WishesWallMessage) {
					if (data.type === "state") {
						setWishes(data.wishes);
					}

					if (data.type === "new_wish") {
						setWishes((current) => mergeIncomingWish(current, data.wish));
					}

					if (data.type === "remove_wish") {
						setWishes((current) =>
							current.filter((wish) => wish.id !== data.wish_id),
						);
					}
				},
			},
		);

		return () => {
			isMounted = false;
			subscription.unsubscribe();
		};
	}, [eventId, slug]);

	return (
		<div className="min-h-screen bg-[#120f0c] px-6 py-8 text-white sm:px-10 lg:px-14">
			<div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col">
				<div className="mb-8 flex items-start justify-between gap-6">
					<div>
						<p className="text-[11px] text-amber-200/75 uppercase tracking-[0.38em]">
							Live Wishes Wall
						</p>
						<h1 className="mt-4 max-w-4xl font-serif text-4xl text-stone-50 italic leading-tight sm:text-5xl lg:text-6xl">
							{eventTitle}
						</h1>
					</div>
					<div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-stone-300">
						{isConnected ? "Live" : "Reconnecting"}
					</div>
				</div>

				{wishes.length === 0 ? (
					<EmptyState
						title="Waiting for the first blessing"
						description="Approved wishes will appear here in real time during the celebration."
						height="h-[calc(100vh-16rem)]"
						className="rounded-[2rem] border border-white/10 bg-white/5"
					/>
				) : (
					<div className="grid flex-1 auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-3">
						<AnimatePresence>
							{wishes.map((wish) => (
								<WishCard key={wish.id} wish={wish} />
							))}
						</AnimatePresence>
					</div>
				)}
			</div>
		</div>
	);
}
