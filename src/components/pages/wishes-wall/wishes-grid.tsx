"use client";

import { AnimatePresence } from "framer-motion";
import { Great_Vibes } from "next/font/google";
import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchApprovedWishes, type Wish } from "@/lib/api/wishes";
import { cable } from "@/lib/cable";
import { WishCard } from "./wish-card";
import { mergeIncomingWish } from "./wishes-grid-state";

const greatVibes = Great_Vibes({
	subsets: ["latin"],
	weight: ["400"],
});

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
		<div className="relative min-h-screen overflow-hidden bg-rsvp-canvas px-6 py-12 sm:px-10 lg:px-14">
			{/* Subtle Decorative Background Elements */}
			<div className="pointer-events-none fixed inset-0 z-0">
				<div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-rsvp-mist opacity-40 blur-[120px]" />
				<div className="absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] rounded-full bg-rsvp-mist opacity-40 blur-[120px]" />
			</div>

			{/* Corner Floral Decorations */}
			<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-80">
				{/* Top Left */}
				<div className="absolute top-0 left-0 h-64 w-64 sm:h-96 sm:w-96 lg:h-[32rem] lg:w-[32rem]">
					<Image
						src="/images/assets/flowers/top-left-flower.webp"
						alt=""
						fill
						sizes="(max-width: 640px) 16rem, (max-width: 1024px) 24rem, 32rem"
						className="object-contain object-left-top"
					/>
				</div>
				{/* Top Right */}
				<div className="absolute top-0 right-0 h-64 w-64 sm:h-96 sm:w-96 lg:h-[32rem] lg:w-[32rem]">
					<Image
						src="/images/assets/flowers/top-right-flower.webp"
						alt=""
						fill
						loading="eager"
						sizes="(max-width: 640px) 16rem, (max-width: 1024px) 24rem, 32rem"
						className="object-contain object-right-top"
					/>
				</div>
				{/* Bottom Left */}
				<div className="absolute bottom-0 left-0 h-64 w-64 sm:h-96 sm:w-96 lg:h-[32rem] lg:w-[32rem]">
					<Image
						src="/images/assets/flowers/bottom-left-flower.webp"
						alt=""
						fill
						sizes="(max-width: 640px) 16rem, (max-width: 1024px) 24rem, 32rem"
						className="object-contain object-left-bottom"
					/>
				</div>
				{/* Bottom Right */}
				<div className="absolute right-0 bottom-0 h-64 w-64 sm:h-96 sm:w-96 lg:h-[32rem] lg:w-[32rem]">
					<Image
						src="/images/assets/flowers/bottom-right-flower.webp"
						alt=""
						fill
						sizes="(max-width: 640px) 16rem, (max-width: 1024px) 24rem, 32rem"
						className="object-contain object-right-bottom"
					/>
				</div>
			</div>

			<div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-[100rem] flex-col">
				<div className="mb-12 flex flex-col items-center justify-center text-center">
					<div className="flex flex-col items-center">
						<p className="mb-4 font-semibold text-[11px] text-stone-500 uppercase tracking-[0.4em]">
							Live Wishes Wall
						</p>
						<h1
							className={`${greatVibes.className} mb-6 max-w-4xl text-6xl text-stone-900 sm:text-7xl lg:text-8xl`}
						>
							{eventTitle}
						</h1>
						<div className="relative w-full max-w-[16rem] py-2">
							<div
								className="absolute inset-0 flex items-center"
								aria-hidden="true"
							>
								<div className="w-full border-stone-300 border-t" />
							</div>
							<div className="relative flex justify-center">
								<span className="bg-transparent px-3 text-stone-400">
									<div className="h-1.5 w-1.5 rotate-45 border border-stone-400 bg-rsvp-canvas" />
								</span>
							</div>
						</div>
					</div>
				</div>

				{wishes.length === 0 ? (
					<div className="flex flex-1 items-center justify-center">
						<div className="max-w-lg rounded-[2rem] border border-stone-200/50 bg-white/60 p-12 text-center backdrop-blur-sm">
							<div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
								<svg
									aria-hidden="true"
									className="h-6 w-6 text-stone-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-serif text-2xl text-stone-800">
								Waiting for the first blessing
							</h3>
							<p className="font-serif text-lg text-stone-500 italic leading-relaxed">
								Approved wishes will appear here in real time during the
								celebration.
							</p>
						</div>
					</div>
				) : (
					<div className="grid flex-1 auto-rows-max gap-6 pb-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						<AnimatePresence mode="popLayout">
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
