"use client";

import { AlertTriangle, Building2, Clock, Hourglass, Ticket, Zap } from "lucide-react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isPast, differenceInDays } from "date-fns";

import type { Voucher } from "@/lib/api/voucher";

interface PublicVoucherCardProps {
	voucher: Voucher;
}

type VoucherMessage = {
	headline: string;
	badge: string;
	color: string;
	bgColor: string;
	badgeBg: string; // Solid color for badge on image overlay
	icon: React.ReactNode;
};

function getVoucherMessage(voucher: Voucher): VoucherMessage {
	const now = new Date();
	const startDate = new Date(voucher.startDate);
	const endDate = new Date(voucher.endDate);
	const isUnlimited = voucher.isUnlimited;
	const total = voucher.totalRedemptionAvailable ?? 0;
	const remaining = isUnlimited ? Number.POSITIVE_INFINITY : total - voucher.redeemedCount;
	const claimedPercent = !isUnlimited && total > 0 ? ((total - remaining) / total) * 100 : 0;
	const isSoldOut = !isUnlimited && remaining <= 0;
	const daysUntilEnd = differenceInDays(endDate, now);

	// Priority order: Sold Out > Expired > Upcoming > Ending Soon > Claim levels > Available
	if (isSoldOut) {
		return {
			headline: "Sorry, this one's overclaimed",
			badge: "Overclaimed",
			color: "text-red-600",
			bgColor: "bg-red-500/10 border-red-500/20",
			badgeBg: "bg-red-600 text-white border-0",
			icon: <AlertTriangle className="h-3 w-3" />,
		};
	}

	if (isPast(endDate)) {
		return {
			headline: "You just missed it!",
			badge: "Expired",
			color: "text-red-600",
			bgColor: "bg-red-500/10 border-red-500/20",
			badgeBg: "bg-red-600 text-white border-0",
			icon: <Clock className="h-3 w-3" />,
		};
	}

	if (now < startDate) {
		return {
			headline: "Coming soon!",
			badge: "Coming soon",
			color: "text-blue-600",
			bgColor: "bg-blue-500/10 border-blue-500/20",
			badgeBg: "bg-blue-600 text-white border-0",
			icon: <Hourglass className="h-3 w-3" />,
		};
	}

	if (daysUntilEnd <= 3) {
		return {
			headline: "Finishing soon…",
			badge: "Ending soon",
			color: "text-orange-600",
			bgColor: "bg-orange-500/10 border-orange-500/20",
			badgeBg: "bg-orange-500 text-white border-0",
			icon: <Clock className="h-3 w-3" />,
		};
	}

	// Messages based on claim percentage
	if (claimedPercent >= 80) {
		return {
			headline: "Not many left…",
			badge: "Almost gone",
			color: "text-red-500",
			bgColor: "bg-red-500/10 border-red-500/20",
			badgeBg: "bg-red-500 text-white border-0",
			icon: <Zap className="h-3 w-3" />,
		};
	}

	if (claimedPercent >= 60) {
		return {
			headline: "It's going fast…",
			badge: "Going fast",
			color: "text-orange-600",
			bgColor: "bg-orange-500/10 border-orange-500/20",
			badgeBg: "bg-orange-500 text-white border-0",
			icon: <Zap className="h-3 w-3" />,
		};
	}

	if (claimedPercent >= 40) {
		return {
			headline: "Many have claimed this…",
			badge: "Popular",
			color: "text-amber-600",
			bgColor: "bg-amber-500/10 border-amber-500/20",
			badgeBg: "bg-amber-500 text-white border-0",
			icon: <Ticket className="h-3 w-3" />,
		};
	}

	return {
		headline: "Grab while it lasts…",
		badge: "Available",
		color: "text-emerald-600",
		bgColor: "bg-emerald-500/10 border-emerald-500/20",
		badgeBg: "bg-emerald-600 text-white border-0",
		icon: <Ticket className="h-3 w-3" />,
	};
}

export function PublicVoucherCard({ voucher }: PublicVoucherCardProps) {
	const router = useRouter();
	const params = useParams<{ event_id: string }>();
	const eventId = params?.event_id;
	const isUnlimited = voucher.isUnlimited;
	const total = voucher.totalRedemptionAvailable ?? 0;
	const remaining = isUnlimited ? Number.POSITIVE_INFINITY : total - voucher.redeemedCount;
	const isAvailable = (isUnlimited || remaining > 0) && !isPast(new Date(voucher.endDate));

	const voucherMessage = getVoucherMessage(voucher);

	return (
		<article className="group flex h-full flex-col overflow-hidden rounded-none border border-border bg-background transition hover:border-primary/50">
			<div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
				{voucher.imageUrl ? (
					<>
						<div
							className="absolute inset-0 bg-center bg-cover transition duration-500 group-hover:scale-105"
							style={{ backgroundImage: `url(${voucher.imageUrl})` }}
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
					</>
				) : (
					<>
						<div className="absolute inset-0 flex items-center justify-center">
							<p className="font-medium text-muted-foreground/60 text-sm sm:text-base">
								No image added
							</p>
						</div>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
					</>
				)}
				<div className="absolute inset-x-0 top-0 flex items-center justify-between px-2.5 py-2 sm:px-4">
					<Badge variant="secondary" className="w-fit rounded-none border-0 bg-primary/90 text-[9px] text-primary-foreground capitalize tracking-wide sm:text-[11px]">
						{(voucher.voucherType || "").replace(/_/g, " ")}
					</Badge>
					{/* Message badge - solid color for visibility on images */}
					<span className={`inline-flex items-center gap-1 px-2 py-0.5 font-medium text-[10px] sm:text-xs ${voucherMessage.badgeBg}`}>
						{voucherMessage.icon}
						{voucherMessage.badge}
					</span>
				</div>
			</div>

			<div className="flex flex-1 flex-col gap-2 px-2.5 py-2.5 sm:gap-3 sm:px-4 sm:py-4">
				<div className="flex flex-col gap-0.5 sm:gap-1">
					<h3 className="line-clamp-2 font-semibold text-[13px] text-foreground leading-snug sm:text-lg">
						{voucher.title}
					</h3>
					<div className="flex items-center gap-1 text-[11px] text-muted-foreground sm:text-sm">
						<Building2 className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
						<span className="truncate">{voucher.vendor?.fullName || "Unknown Merchant"}</span>
					</div>
				</div>

				{/* Description - hidden on mobile, max 2 lines on desktop */}
				{voucher.description && (
					<p className="hidden text-muted-foreground text-sm leading-relaxed sm:line-clamp-2">
						{voucher.description}
					</p>
				)}

				{/* Mobile: Minimalist message */}
				<div className="flex items-center gap-1 text-[10px] text-muted-foreground sm:hidden">
					{voucherMessage.icon}
					<span className={voucherMessage.color}>
						{voucherMessage.badge}
					</span>
				</div>

				{/* Desktop: Full message */}
				<div className={`hidden border px-2.5 py-2 text-xs sm:block ${voucherMessage.bgColor}`}>
					<div className={`flex items-center gap-1.5 font-semibold ${voucherMessage.color}`}>
						{voucherMessage.icon}
						<span>{voucherMessage.headline}</span>
					</div>
				</div>
			</div>

			<div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4">
				<Button
					className="h-8 w-full rounded-none font-medium text-[11px] sm:h-9 sm:text-sm"
					size="sm"
					disabled={!isAvailable}
					onClick={() => {
						if (!isAvailable || !eventId) return;
						router.push(
							`/event/${eventId}/voucher-showcase/${voucher.id}` as Route,
						);
					}}
				>
					<div className="flex items-center justify-center gap-1.5 sm:gap-2">
						<Ticket className="h-3 w-3 sm:h-4 sm:w-4" />
						<span>{isAvailable ? "View Voucher" : "Unavailable"}</span>
					</div>
				</Button>
			</div>
		</article>
	);
}
