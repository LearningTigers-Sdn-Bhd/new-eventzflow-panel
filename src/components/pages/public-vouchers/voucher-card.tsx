"use client";

import { AlertTriangle, Building2, Calendar, Clock, Hourglass, Ticket, Zap } from "lucide-react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { intervalToDuration, isPast, differenceInDays } from "date-fns";

import type { Voucher } from "@/lib/api/voucher";

interface PublicVoucherCardProps {
	voucher: Voucher;
}

type VoucherStatus = {
	label: string;
	color: string;
	bgColor: string;
	icon: React.ReactNode;
};

function getVoucherStatus(voucher: Voucher): VoucherStatus {
	const now = new Date();
	const startDate = new Date(voucher.startDate);
	const endDate = new Date(voucher.endDate);
	const remaining = voucher.totalRedemptionAvailable - voucher.redeemedCount;
	const isLowStock = remaining <= voucher.totalRedemptionAvailable * 0.2 && remaining > 0;
	const isSoldOut = remaining <= 0;
	const daysUntilEnd = differenceInDays(endDate, now);

	// Priority order: Sold Out > Expired > Upcoming > Ending Soon > Limited Stock > Available
	if (isSoldOut) {
		return {
			label: "Sold Out",
			color: "text-red-600",
			bgColor: "bg-red-500/10 border-red-500/20",
			icon: <AlertTriangle className="h-3 w-3" />,
		};
	}

	if (isPast(endDate)) {
		return {
			label: "Expired",
			color: "text-red-600",
			bgColor: "bg-red-500/10 border-red-500/20",
			icon: <Clock className="h-3 w-3" />,
		};
	}

	if (now < startDate) {
		return {
			label: "Upcoming",
			color: "text-blue-600",
			bgColor: "bg-blue-500/10 border-blue-500/20",
			icon: <Hourglass className="h-3 w-3" />,
		};
	}

	if (daysUntilEnd <= 3) {
		return {
			label: "Ending Soon",
			color: "text-orange-600",
			bgColor: "bg-orange-500/10 border-orange-500/20",
			icon: <Clock className="h-3 w-3" />,
		};
	}

	if (isLowStock) {
		return {
			label: "Limited Stock",
			color: "text-amber-600",
			bgColor: "bg-amber-500/10 border-amber-500/20",
			icon: <Zap className="h-3 w-3" />,
		};
	}

	return {
		label: "Available",
		color: "text-emerald-600",
		bgColor: "bg-emerald-500/10 border-emerald-500/20",
		icon: <Ticket className="h-3 w-3" />,
	};
}

export function PublicVoucherCard({ voucher }: PublicVoucherCardProps) {
	const router = useRouter();
	const params = useParams<{ event_id: string }>();
	const eventId = params?.event_id;
	const remaining = voucher.totalRedemptionAvailable - voucher.redeemedCount;
	const isAvailable = remaining > 0 && !isPast(new Date(voucher.endDate));

	const status = getVoucherStatus(voucher);

	return (
		<article className="group flex h-full flex-col overflow-hidden rounded-none border border-border bg-background transition hover:border-primary/50">
			<div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
				{voucher.imagePath ? (
					<>
						<div
							className="absolute inset-0 transition duration-500 group-hover:scale-105 bg-cover bg-center"
							style={{ backgroundImage: `url(${voucher.imagePath})` }}
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
					</>
				) : (
					<>
						<div className="absolute inset-0 flex items-center justify-center">
							<p className="text-sm sm:text-base font-medium text-muted-foreground/60">
								No image added
							</p>
						</div>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
					</>
				)}
				<div className="absolute inset-x-0 top-0 flex items-center justify-between px-2.5 sm:px-4 py-2">
					<Badge variant="secondary" className="w-fit bg-primary/90 text-[9px] sm:text-[11px] capitalize tracking-wide border-0 text-primary-foreground rounded-none">
						{(voucher.voucherType || "").replace(/_/g, " ")}
					</Badge>
					{/* Status badge instead of percentage claimed */}
					<span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-0.5 border backdrop-blur-sm ${status.bgColor} ${status.color}`}>
						{status.icon}
						{status.label}
					</span>
				</div>
			</div>

			<div className="flex flex-1 flex-col gap-2 px-2.5 py-2.5 sm:gap-3 sm:px-4 sm:py-4">
				<div className="flex flex-col gap-0.5 sm:gap-1">
					<h3 className="text-[13px] sm:text-lg font-semibold leading-snug text-foreground line-clamp-2">
						{voucher.title}
					</h3>
					<div className="flex items-center gap-1 text-[11px] sm:text-sm text-muted-foreground">
						<Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
						<span className="truncate">{voucher.vendor?.fullName || "Unknown Merchant"}</span>
					</div>
				</div>

				<p className="hidden sm:block text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:text-sm">
					{voucher.description || "No description available"}
				</p>

				{/* Mobile: Minimalist status info */}
				<div className="flex items-center gap-1 sm:hidden text-[10px] text-muted-foreground">
					<Calendar className="h-3 w-3" />
					<span className={status.color}>
						{status.label}
					</span>
				</div>

				{/* Desktop: Status card */}
				<div className="hidden sm:block border border-primary/10 bg-primary/5 px-2.5 py-2 text-xs">
					<div className="flex items-center justify-between font-semibold text-primary">
						<span>Status</span>
						<span className={`flex items-center gap-1.5 ${status.color}`}>
							{status.icon}
							{status.label}
						</span>
					</div>
				</div>
			</div>

			<div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4">
				<Button
					className="w-full rounded-none text-[11px] h-8 sm:h-9 font-medium sm:text-sm"
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
