"use client";

import { useQuery } from "@tanstack/react-query";
import { differenceInDays, isPast } from "date-fns";
import {
	AlertTriangle,
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Clock,
	Copy,
	Hourglass,
	QrCode,
	Share2,
	Sparkles,
	Store,
	Ticket,
	Zap,
} from "lucide-react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicEventById } from "@/lib/api/event";
import { getPublicVoucher } from "@/lib/api/voucher";
import { EventNotFound } from "./event-not-found";

type VoucherMessage = {
	headline: string;
	subtext: string;
	color: string;
	bgColor: string;
	icon: React.ReactNode;
};

function getVoucherMessage(voucher: {
	startDate: string;
	endDate: string;
	totalRedemptionAvailable: number | null;
	isUnlimited: boolean;
	redeemedCount: number;
}): VoucherMessage {
	const now = new Date();
	const startDate = new Date(voucher.startDate);
	const endDate = new Date(voucher.endDate);
	const isUnlimited = voucher.isUnlimited;
	const total = voucher.totalRedemptionAvailable ?? 0;
	const remaining = isUnlimited
		? Number.POSITIVE_INFINITY
		: total - voucher.redeemedCount;
	const claimedPercent =
		!isUnlimited && total > 0 ? ((total - remaining) / total) * 100 : 0;
	const isSoldOut = !isUnlimited && remaining <= 0;
	const daysUntilEnd = differenceInDays(endDate, now);

	// Priority order: Sold Out > Expired > Upcoming > Ending Soon > Claim levels > Available
	if (isSoldOut) {
		return {
			headline: "We're sorry, this voucher is overclaimed",
			subtext: "It's a bummer, we may raise some more vouchers soon…",
			color: "text-red-600",
			bgColor: "bg-red-500/10 border-red-500/20",
			icon: <AlertTriangle className="h-4 w-4" />,
		};
	}

	if (isPast(endDate)) {
		return {
			headline: "Oops, you just missed it!",
			subtext: "This voucher has expired. Keep an eye out for new ones!",
			color: "text-red-600",
			bgColor: "bg-red-500/10 border-red-500/20",
			icon: <Clock className="h-4 w-4" />,
		};
	}

	if (now < startDate) {
		return {
			headline: "Coming soon!",
			subtext:
				"This voucher isn't active yet. Mark your calendar and check back!",
			color: "text-blue-600",
			bgColor: "bg-blue-500/10 border-blue-500/20",
			icon: <Hourglass className="h-4 w-4" />,
		};
	}

	if (daysUntilEnd <= 3) {
		return {
			headline: "Finishing soon…",
			subtext: "Time's running out! Grab this before it's gone.",
			color: "text-orange-600",
			bgColor: "bg-orange-500/10 border-orange-500/20",
			icon: <Clock className="h-4 w-4" />,
		};
	}

	// Messages based on claim percentage
	if (claimedPercent >= 80) {
		return {
			headline: "Not many left…",
			subtext: "Almost gone! Only a handful remaining.",
			color: "text-red-500",
			bgColor: "bg-red-500/10 border-red-500/20",
			icon: <Zap className="h-4 w-4" />,
		};
	}

	if (claimedPercent >= 60) {
		return {
			headline: "It's going fast…",
			subtext: "Still available, but not for long!",
			color: "text-orange-600",
			bgColor: "bg-orange-500/10 border-orange-500/20",
			icon: <Zap className="h-4 w-4" />,
		};
	}

	if (claimedPercent >= 40) {
		return {
			headline: "Many have claimed this…",
			subtext: "People are loving this one. Don't miss out!",
			color: "text-amber-600",
			bgColor: "bg-amber-500/10 border-amber-500/20",
			icon: <Ticket className="h-4 w-4" />,
		};
	}

	return {
		headline: "Grab while it lasts…",
		subtext: "This voucher is up for grabs. Claim yours now!",
		color: "text-emerald-600",
		bgColor: "bg-emerald-500/10 border-emerald-500/20",
		icon: <Ticket className="h-4 w-4" />,
	};
}

export function PublicVoucherDetail() {
	const router = useRouter();
	const params = useParams<{ event_id: string; voucher_id: string }>();
	const eventId = params?.event_id;
	const voucherId = useMemo(
		() => Number(params?.voucher_id ?? Number.NaN),
		[params],
	);
	const [copiedCode, setCopiedCode] = useState(false);
	const [shared, setShared] = useState(false);

	const {
		data: voucher,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["public", "event", eventId, "voucher", voucherId],
		enabled: Boolean(eventId) && Number.isFinite(voucherId),
		queryFn: () => getPublicVoucher(voucherId),
	});

	// Fetch event info for display
	const {
		data: event,
		isLoading: isLoadingEvent,
		error: eventError,
	} = useQuery({
		queryKey: ["public", "event", eventId],
		queryFn: async () => {
			try {
				return await getPublicEventById(eventId!);
			} catch (error) {
				// Silently catch the error - we'll handle it in the UI
				return null;
			}
		},
		enabled: Boolean(eventId),
		retry: false,
	});

	const navigateBack = () => {
		if (!eventId) {
			router.back();
			return;
		}
		router.push(`/event/${eventId}/voucher-showcase` as Route);
	};

	if (isLoading || isLoadingEvent || (!voucher && !isError)) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<LoadingState
					title="Loading voucher..."
					description="Please wait while we fetch this voucher."
					height="h-[300px]"
				/>
			</div>
		);
	}

	if (!event) {
		return <EventNotFound />;
	}

	if (isError || !voucher) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<ErrorState
					title="Voucher not found"
					description="We couldn't find this voucher. It may have been removed or is no longer available."
					action={
						<Button onClick={navigateBack}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to vouchers
						</Button>
					}
				/>
			</div>
		);
	}

	const voucherMessage = getVoucherMessage(voucher);

	const redemptionCode = voucher.voucherUuid;
	const qrValue = voucher.voucherUuid;

	const handleCopyCode = async () => {
		await navigator.clipboard.writeText(redemptionCode);
		setCopiedCode(true);
		setTimeout(() => setCopiedCode(false), 2000);
	};

	const handleShare = async () => {
		const shareUrl = window.location.href;
		const shareData = {
			title: voucher.title,
			text: `Check out this voucher: ${voucher.title}`,
			url: shareUrl,
		};

		if (navigator.share) {
			try {
				await navigator.share(shareData);
				setShared(true);
				setTimeout(() => setShared(false), 2000);
			} catch (err) {
				console.error("Share failed:", err);
			}
		} else {
			await navigator.clipboard.writeText(shareUrl);
			setShared(true);
			setTimeout(() => setShared(false), 2000);
		}
	};

	// Vendor name only
	const vendorName = voucher.vendor?.fullName || "Event Organizer";

	return (
		<div className="h-screen overflow-hidden bg-background">
			{/* Geometric Pattern Background - Interlocking Hexagons */}
			<div
				className="pointer-events-none fixed inset-0 opacity-[0.15]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%239C92AC' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					backgroundSize: "28px 49px",
				}}
			/>

			<div className="relative flex h-full flex-col">
				{/* Header */}
				<div className="border-b bg-card/50 px-6 py-3 backdrop-blur-sm">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 text-xs"
						onClick={navigateBack}
					>
						<ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
						Back
					</Button>
				</div>

				{/* Main Content - Grid Layout */}
				<div className="flex-1 overflow-auto">
					<div className="mx-auto w-full max-w-[1800px] p-4 md:p-6">
						<div className="grid grid-cols-12 items-stretch gap-4">
							{/* Left Column - QR Code */}
							<div className="col-span-12 lg:col-span-4">
								<div className="flex h-full flex-col rounded-none border bg-background p-5 shadow-none">
									<div className="mb-4 text-center">
										<div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
											<QrCode className="h-5 w-5 text-primary" />
										</div>
										<h3 className="font-semibold text-sm">Redeem Code</h3>
										<p className="mt-1 text-muted-foreground text-xs">
											Scan to claim
										</p>
									</div>

									<div className="mb-4 flex min-h-[250px] flex-1 items-center justify-center rounded-none border-2 border-border border-dashed bg-muted/30 p-4 sm:min-h-[300px]">
										<QRCode
											value={qrValue}
											size={256}
											style={{
												height: "auto",
												width: "100%",
												maxWidth: "250px",
											}}
										/>
									</div>

									{/* Code display only - buttons moved to right column */}
									<div className="rounded-none border bg-muted/50 p-2.5">
										<p className="mb-1 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
											Code
										</p>
										<p className="break-all font-mono font-semibold text-xs tracking-wider">
											{redemptionCode}
										</p>
									</div>
								</div>
							</div>

							{/* Right Column - Voucher Details */}
							<div className="col-span-12 flex flex-col gap-4 lg:col-span-8">
								{/* Title & Value Card with Badges */}
								<div className="rounded-none border bg-background p-5 shadow-none">
									<div className="mb-3 flex flex-wrap items-center gap-2">
										<Badge
											variant="secondary"
											className="h-6 border-primary/20 bg-primary/10 text-primary text-xs capitalize"
										>
											<Sparkles className="mr-1 h-3 w-3" />
											{(voucher.voucherType || "").replace(/_/g, " ")}
										</Badge>
										{/* Message badge */}
										<span
											className={`inline-flex h-6 items-center gap-1.5 border px-2.5 font-semibold text-xs ${voucherMessage.bgColor} ${voucherMessage.color}`}
										>
											{voucherMessage.icon}
											{voucherMessage.headline}
										</span>
									</div>

									<div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
										<h1 className="font-bold text-2xl leading-tight sm:text-3xl">
											{voucher.title}
										</h1>

										{/* Value Display */}
										<div className="shrink-0 text-left sm:text-right">
											{voucher.voucherType === "percentage" ? (
												<div className="flex items-baseline justify-start gap-1 sm:justify-end">
													<span className="font-bold text-3xl text-primary sm:text-4xl">
														{voucher.voucherValue}%
													</span>
													<span className="font-semibold text-lg text-muted-foreground">
														OFF
													</span>
												</div>
											) : voucher.voucherType === "fixed_amount" ? (
												<div className="flex items-baseline justify-start gap-1 sm:justify-end">
													<span className="font-bold text-3xl text-primary sm:text-4xl">
														RM {voucher.voucherValue.toFixed(2)}
													</span>
													<span className="font-medium text-muted-foreground text-sm">
														DISCOUNT
													</span>
												</div>
											) : (
												<span className="font-bold text-2xl text-primary sm:text-3xl">
													FREE ITEMS
												</span>
											)}
										</div>
									</div>
								</div>

								{/* Description Card - Full text */}
								{voucher.description && (
									<div className="rounded-none border bg-background p-5 shadow-none">
										<p className="mb-2 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
											Description
										</p>
										<p className="whitespace-pre-wrap text-justify text-foreground text-sm leading-relaxed">
											{voucher.description}
										</p>
									</div>
								)}

								{/* Voucher Message Card */}
								<div
									className={`rounded-none border p-5 shadow-none ${voucherMessage.bgColor}`}
								>
									<div className="flex items-center gap-4">
										<div
											className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${voucherMessage.bgColor}`}
										>
											{voucherMessage.icon}
										</div>
										<div className="flex-1">
											<p
												className={`font-bold text-lg ${voucherMessage.color}`}
											>
												{voucherMessage.headline}
											</p>
											<p className="mt-1 text-muted-foreground text-sm">
												{voucherMessage.subtext}
											</p>
										</div>
									</div>
								</div>

								{/* Vendor & Event Info - Side by Side */}
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									{/* Vendor Card */}
									<div className="rounded-none border bg-background p-5 shadow-none">
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border bg-primary/5">
												<Store className="h-5 w-5 text-primary" />
											</div>
											<div className="min-w-0">
												<p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
													Vendor
												</p>
												<h3 className="truncate font-semibold text-sm">
													{vendorName}
												</h3>
											</div>
										</div>
									</div>

									{/* Event Card */}
									<div className="rounded-none border bg-background p-5 shadow-none">
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border bg-primary/5">
												<Calendar className="h-5 w-5 text-primary" />
											</div>
											<div className="min-w-0">
												<p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
													Event
												</p>
												<h3 className="truncate font-semibold text-sm">
													{event?.title || "Event"}
												</h3>
											</div>
										</div>
									</div>
								</div>

								{/* Actions Card - Copy & Share */}
								<div className="rounded-none border bg-background p-5 shadow-none">
									<div className="flex flex-col gap-3">
										<div className="flex items-center gap-2">
											<Share2 className="h-4 w-4 text-primary" />
											<p className="font-semibold text-sm">
												Share this voucher
											</p>
										</div>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												className="flex-1"
												onClick={handleCopyCode}
											>
												{copiedCode ? (
													<>
														<CheckCircle2 className="mr-2 h-3.5 w-3.5" />
														Copied!
													</>
												) : (
													<>
														<Copy className="mr-2 h-3.5 w-3.5" />
														Copy Code
													</>
												)}
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="flex-1"
												onClick={handleShare}
											>
												<Share2 className="mr-2 h-3.5 w-3.5" />
												{shared ? "Shared!" : "Share Link"}
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
