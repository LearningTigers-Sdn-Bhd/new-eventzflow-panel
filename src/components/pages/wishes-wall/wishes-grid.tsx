"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { fetchApprovedWishes, type Wish } from "@/lib/api/wishes";
import { cable } from "@/lib/cable";
import { AnimatedWallRenderer } from "./animated-wall-renderer";
import { CardWallRenderer } from "./card-wall-renderer";
import type { NormalizedWallSettings } from "./wall-settings";
import {
	getRotationPageCount,
	getVisibleWishes,
	mergeIncomingWish,
	normalizeRotationPage,
} from "./wishes-grid-state";
import { WishesWallShell } from "./wishes-wall-shell";

type WishesGridProps = {
	eventId: string;
	eventTitle: string;
	slug: string;
	wallSettings: NormalizedWallSettings;
};

type WishesWallMessage =
	| { type: "state"; wishes: Wish[] }
	| { type: "new_wish"; wish: Wish }
	| { type: "remove_wish"; wish_id: number };

const PAGE_ROTATION_INTERVAL_MS = 8000;

export function WishesGrid({
	eventId,
	eventTitle,
	slug,
	wallSettings,
}: WishesGridProps) {
	const [wishes, setWishes] = useState<Wish[]>([]);
	const [page, setPage] = useState(0);
	const pageCount = useMemo(() => getRotationPageCount(wishes), [wishes]);
	const pageNumbers = useMemo(
		() => Array.from({ length: pageCount }, (_, index) => index),
		[pageCount],
	);
	const visibleWishes = useMemo(
		() => getVisibleWishes(wishes, page),
		[page, wishes],
	);
	const liveCardStageClassName =
		"h-[calc(100vh-20rem)] overflow-hidden min-h-[32rem] px-4 sm:px-6 lg:px-10";

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

	useEffect(() => {
		setPage((current) => normalizeRotationPage(current, wishes));
	}, [wishes]);

	useEffect(() => {
		if (pageCount <= 1) {
			return;
		}

		const intervalId = window.setInterval(() => {
			setPage((current) => (current + 1) % pageCount);
		}, PAGE_ROTATION_INTERVAL_MS);

		return () => window.clearInterval(intervalId);
	}, [pageCount]);

	return (
		<div className="relative min-h-screen overflow-hidden bg-rsvp-canvas">
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

			<WishesWallShell settings={wallSettings} eventTitle={eventTitle}>
				{wallSettings.mode === "animation" ? (
					<AnimatedWallRenderer wishes={wishes} settings={wallSettings} />
				) : (
					<div className={liveCardStageClassName}>
						<CardWallRenderer
							visibleWishes={visibleWishes}
							page={page}
							pageNumbers={pageNumbers}
							wishesCount={wishes.length}
							settings={wallSettings}
						/>
					</div>
				)}
			</WishesWallShell>
		</div>
	);
}
