"use client";

import { Building2, Calendar, Ticket } from "lucide-react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFormatDate } from "@/hooks/use-format-date";
import { intervalToDuration, isPast } from "date-fns";

import type { Voucher } from "@/lib/api/voucher";

interface PublicVoucherCardProps {
	voucher: Voucher;
}

export function PublicVoucherCard({ voucher }: PublicVoucherCardProps) {
	const { formatDate } = useFormatDate();
	const router = useRouter();
	const params = useParams<{ event_id: string }>();
	const eventId = params?.event_id;
	const remaining = voucher.totalRedemptionAvailable - voucher.redeemedCount;
	const percentageUsed = voucher.totalRedemptionAvailable
		? Math.min((voucher.redeemedCount / voucher.totalRedemptionAvailable) * 100, 100)
		: 0;
	const isLowStock = remaining <= voucher.totalRedemptionAvailable * 0.2;
	const isAvailable = remaining > 0;

	const now = new Date();
	const startDate = new Date(voucher.startDate);
	const endDate = new Date(voucher.endDate);

	// Determine voucher status
	const isUpcoming = now < startDate;
	const isActive = now >= startDate && now <= endDate;
	const isExpired = now > endDate;

	let validityString = "";
	let validityColor = "";

	if (isUpcoming) {
		// Voucher hasn't started yet
		const durationToStart = intervalToDuration({
			start: now,
			end: startDate,
		});
		validityString = `Upcoming • Starts in ${durationToStart.days ?? 0}d ${durationToStart.hours ?? 0}h`;
		validityColor = "text-blue-600";
	} else if (isActive) {
		// Voucher is currently active
		const durationRemaining = intervalToDuration({
			start: now,
			end: endDate,
		});
		validityString = `${durationRemaining.days ?? 0}d ${durationRemaining.hours ?? 0}h left`;
		validityColor = "text-emerald-600";
	} else {
		// Voucher has expired
		validityString = "Expired";
		validityColor = "text-red-600";
	}

	return (
		<article className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-border/50 bg-card shadow-md ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-xl">
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
					<Badge variant="secondary" className="w-fit bg-primary backdrop-blur-sm text-[9px] sm:text-[11px] uppercase tracking-wide border-0 text-white dark:text-black">
						{(voucher.voucherType || "").replace(/_/g, " ")}
					</Badge>
					<span className="text-[10px] sm:text-xs font-medium backdrop-blur-sm rounded-full bg-black/20 px-2 py-0.5 text-white/90">
						{isAvailable ? `${Math.min(100, Math.round(percentageUsed))}% claimed` : "Sold out"}
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

				{/* Mobile: Minimalist validity info */}
				<div className="flex items-center gap-1 sm:hidden text-[10px] text-muted-foreground">
					<Calendar className="h-3 w-3" />
					<span className={validityColor}>
						{validityString}
					</span>
				</div>

				{/* Desktop: Full validity card */}
				<div className="hidden sm:block rounded-xl border border-primary/10 bg-primary/5 px-2.5 py-2 text-xs">
					<div className="flex items-center justify-between font-semibold text-primary">
						<span>Validity</span>
						<span className={validityColor}>
							{validityString}
						</span>
					</div>
				</div>

				{/* Desktop: Progress bar */}
				<div className="hidden sm:flex flex-col gap-2 rounded-xl border bg-muted/30 px-3 py-3">
					<div className="flex items-center justify-between">
						<p className="text-xs uppercase tracking-wide text-muted-foreground">Redeemed</p>
						<p className="text-xl font-bold text-foreground">{Math.round(percentageUsed)}%</p>
					</div>
					<Progress value={percentageUsed} className="h-2" />
				</div>
			</div>

			<div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4">
				<Button
					className="w-full rounded-xl text-[11px] h-8 sm:h-9 font-medium sm:rounded-2xl sm:text-sm"
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
						<span>{isAvailable ? "Claim Voucher" : "Sold Out"}</span>
					</div>
				</Button>
			</div>
		</article>
	);
}
