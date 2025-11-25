"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import { ArrowLeft, Calendar, CheckCircle2, Clock, Copy, Mail, MapPin, Phone, QrCode, Quote, Share2, Sparkles, Store, Tag, Ticket, User } from "lucide-react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFormatDate } from "@/hooks/use-format-date";
import { intervalToDuration, isPast } from "date-fns";
import { getPublicVoucher } from "@/lib/api/voucher";
import { getVendorProfileById } from "@/lib/api/vendor-profile";

export function PublicVoucherDetail() {
	const router = useRouter();
	const params = useParams<{ event_id: string; voucher_id: string }>();
	const eventId = params?.event_id;
	const voucherId = useMemo(() => Number(params?.voucher_id ?? NaN), [params]);
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

	// Fetch vendor profile if voucher has a vendor_id but no vendor data
	const { data: vendorProfile } = useQuery({
		queryKey: ["vendor-profile", voucher?.vendorId],
		queryFn: () => getVendorProfileById(voucher!.vendorId),
		enabled: Boolean(voucher?.vendorId) && !voucher?.vendor,
	});

	const { formatDate } = useFormatDate();

	const navigateBack = () => {
		if (!eventId) {
			router.back();
			return;
		}
		router.push(`/event/${eventId}/voucher-showcase` as Route);
	};

	if (isLoading || (!voucher && !isError)) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingState
					title="Loading voucher..."
					description="Please wait while we fetch this voucher."
					height="h-[300px]"
				/>
			</div>
		);
	}

	if (isError || !voucher) {
		return (
			<div className="min-h-screen flex items-center justify-center">
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

	const remaining = voucher.totalRedemptionAvailable - voucher.redeemedCount;
	const percentageUsed = voucher.totalRedemptionAvailable
		? Math.min((voucher.redeemedCount / voucher.totalRedemptionAvailable) * 100, 100)
		: 0;
	const isLowStock = remaining <= voucher.totalRedemptionAvailable * 0.2;
	const canClaim = remaining > 0;

	const statusAccent = !canClaim ? "text-red-600" : isLowStock ? "text-orange-500" : "text-emerald-500";
	const statusBgClass = statusAccent.replace("text-", "bg-");
	const statusLabel = !canClaim ? "Sold out" : isLowStock ? "Limited" : "Available";

	const redemptionCode = voucher.voucherUuid;
	const qrValue = voucher.voucherUuid;

	const handleCopyCode = async () => {
		await navigator.clipboard.writeText(redemptionCode);
		setCopiedCode(true);
		setTimeout(() => setCopiedCode(false), 2000);
	};

	const getVoucherValueDisplay = () => {
		if (voucher.voucherType === "percentage") {
			return `${voucher.voucherValue}%`;
		} else if (voucher.voucherType === "fixed_amount") {
			return `RM ${voucher.voucherValue.toFixed(2)}`;
		} else {
			return `${voucher.voucherValue}`;
		}
	};

	const getVoucherValueLabel = () => {
		if (voucher.voucherType === "percentage") {
			return "OFF";
		} else if (voucher.voucherType === "fixed_amount") {
			return "DISCOUNT";
		} else {
			return "FREE ITEMS";
		}
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

	const now = new Date();
	const startDate = new Date(voucher.startDate);
	const validUntil = new Date(voucher.endDate);
	const isExpired = isPast(validUntil);
	const isUpcoming = now < startDate;

	const duration = intervalToDuration({
		start: now,
		end: isUpcoming ? startDate : validUntil,
	});

	let validityString = "";
	if (isExpired) {
		validityString = "Expired";
	} else if (isUpcoming) {
		validityString = `Upcoming • Starts in ${duration.days ?? 0}d ${duration.hours ?? 0}h`;
	} else {
		validityString = `${duration.days ?? 0} Days ${duration.hours ?? 0} Hours left`;
	}

	// Use vendor data from voucher or from vendor profile
	const vendorData = voucher.vendor || (vendorProfile ? {
		id: vendorProfile.vendor.id,
		fullName: vendorProfile.vendor.full_name,
		email: vendorProfile.vendor.email,
		phone: vendorProfile.vendor.phone,
	} : null);

	const hasVendor = Boolean(vendorData);
	const vendorName = vendorData?.fullName || "Event Organizer";
	const vendorEmail = vendorData?.email;
	const vendorPhone = vendorData?.phone;
	const vendorDescription = vendorProfile?.description;
	const vendorAddress = vendorProfile?.address;
	const vendorPersonInCharge = vendorProfile?.person_in_charge;
	const vendorCategory = vendorProfile?.category;

	return (
		<div className="h-screen overflow-hidden bg-background">
			{/* Geometric Pattern Background - Interlocking Hexagons */}
			<div
				className="pointer-events-none fixed inset-0 opacity-[0.15]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%239C92AC' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					backgroundSize: '28px 49px'
				}}
			/>

			<div className="relative flex h-full flex-col">
				{/* Header */}
				<div className="border-b bg-card/50 backdrop-blur-sm px-6 py-3">
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
					<div className="mx-auto max-w-[1800px] p-4 md:p-6">
						<div className="grid grid-cols-12 gap-4 items-stretch">
						{/* Left Column - QR Code */}
						<div className="col-span-12 lg:col-span-4">
							<div className="flex h-full flex-col rounded-none border bg-background p-5 shadow-none">
								<div className="mb-4 text-center">
									<div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
										<QrCode className="h-5 w-5 text-primary" />
									</div>
									<h3 className="text-sm font-semibold">Redeem Code</h3>
									<p className="mt-1 text-xs text-muted-foreground">
										Scan to claim
									</p>
								</div>

								<div className="mb-4 flex flex-1 items-center justify-center rounded-none border-2 border-dashed border-border bg-muted/30 p-4 min-h-[250px] sm:min-h-[300px]">
									<QRCode 
										value={qrValue} 
										size={256} 
										style={{ height: "auto", width: "100%", maxWidth: "250px" }} 
									/>
								</div>

								<div className="space-y-2">
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
											{shared ? "Shared!" : "Share"}
										</Button>
									</div>
									
									<div className="rounded-none border bg-muted/50 p-2.5">
										<p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
											Code
										</p>
										<p className="font-mono text-xs font-semibold tracking-wider break-all">
											{redemptionCode}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Right Column - Voucher Details */}
						<div className="col-span-12 flex flex-col gap-4 lg:col-span-8">
							{/* Title & Value Card with Badges and Share */}
							<div className="rounded-none border bg-background p-5 shadow-none">
								<div className="mb-3 flex flex-wrap items-center gap-2">
									<Badge variant="secondary" className="h-6 bg-primary/10 text-primary border-primary/20 text-xs capitalize">
										<Sparkles className="mr-1 h-3 w-3" />
										{(voucher.voucherType || "").replace(/_/g, " ")}
									</Badge>
									<span className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold ${statusAccent}`}>
										<span className={`h-1.5 w-1.5 rounded-full ${statusBgClass}`} />
										{statusLabel}
									</span>

								</div>

								
								<div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
									<h1 className="text-2xl font-bold leading-tight sm:text-3xl">
										{voucher.title}
									</h1>
									
									{/* Value Display (Moved to top right visually on desktop, or inline on mobile) */}
									<div className="shrink-0 text-left sm:text-right">
										{voucher.voucherType === "percentage" ? (
											<div className="flex items-baseline justify-start sm:justify-end gap-1">
												<span className="text-3xl font-bold text-primary sm:text-4xl">
													{voucher.voucherValue}%
												</span>
												<span className="text-lg font-semibold text-muted-foreground">OFF</span>
											</div>
										) : voucher.voucherType === "fixed_amount" ? (
											<div className="flex items-baseline justify-start sm:justify-end gap-1">
												<span className="text-3xl font-bold text-primary sm:text-4xl">
													RM {voucher.voucherValue.toFixed(2)}
												</span>
												<span className="text-sm font-medium text-muted-foreground">DISCOUNT</span>
											</div>
										) : (
											<span className="text-2xl font-bold text-primary sm:text-3xl">FREE ITEMS</span>
										)}
									</div>
								</div>
								{voucher.description && (
									<p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
										{voucher.description}
									</p>
								)}
							</div>

							{/* Stats Grid */}
							<div className="grid grid-cols-3 gap-2 sm:gap-4">
								<div className="rounded-none border bg-background p-4 text-center shadow-none">
									<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Available</p>
									<p className="mt-1.5 text-2xl font-bold">{voucher.totalRedemptionAvailable ?? 0}</p>
								</div>
								<div className="rounded-none border bg-background p-4 text-center shadow-none">
									<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Redeemed</p>
									<p className="mt-1.5 text-2xl font-bold">{voucher.redeemedCount ?? 0}</p>
								</div>
								<div className="rounded-none border bg-background p-4 text-center shadow-none">
									<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Remaining</p>
									<p className={`mt-1.5 text-2xl font-bold ${!canClaim ? "text-destructive" : isLowStock ? "text-orange-500" : "text-primary"}`}>
										{Math.max(remaining, 0)}
									</p>
								</div>
							</div>

							{/* Availability Progress */}
							<div className="rounded-none border bg-background p-4 shadow-none">
								<div className="mb-3 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Ticket className="h-4 w-4 text-primary" />
										<span className="text-sm font-semibold">Availability</span>
									</div>
									<span className={`text-xs font-semibold ${statusAccent}`}>
										{remaining} / {voucher.totalRedemptionAvailable}
									</span>
								</div>
								<Progress value={percentageUsed} className="h-2" />
								<div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
									<span>{percentageUsed.toFixed(1)}% redeemed</span>
									<span className={isLowStock ? "font-semibold text-orange-500" : ""}>
										{isLowStock ? "Limited" : "In stock"}
									</span>
								</div>
							</div>

							{/* Dates & Validity */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="rounded-none border bg-background p-4 shadow-none">
									<div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
										<Clock className="h-3.5 w-3.5" />
										<p className="text-[10px] font-medium uppercase tracking-wider">Validity</p>
									</div>
									<p className={`text-lg font-bold ${isExpired ? "text-destructive" : isUpcoming ? "text-blue-600" : "text-primary"}`}>
										{validityString}
									</p>
								</div>
								<div className="rounded-none border bg-background p-4 shadow-none flex items-center gap-4">
									<Quote className="h-10 w-10 text-muted-foreground/20 shrink-0 fill-current" />
									<p className="text-sm font-medium leading-relaxed text-muted-foreground">
										This voucher is valid until <span className="font-bold text-foreground">{formatDate(voucher.endDate)}</span>. Make sure to redeem it before it expires.
									</p>
								</div>
							</div>

							{/* Vendor Info - Vertical Card */}
							<div className="rounded-none border bg-background p-5 shadow-none">
								<div className="mb-4 flex items-center gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border bg-primary/5">
										<Store className="h-5 w-5 text-primary" />
									</div>
									<div className="min-w-0">
										<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
											{hasVendor ? "Vendor" : "Provider"}
										</p>
										<h3 className="truncate text-sm font-semibold">{vendorName}</h3>
									</div>
								</div>

								<div className="space-y-3">
									{hasVendor && (vendorEmail || vendorPhone) && (
										<div className="space-y-2">
											<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
												Contact
											</p>
											<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
												{vendorEmail && (
													<div className="flex items-start gap-2 rounded-none border bg-muted/30 p-2.5">
														<Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
														<div className="min-w-0 flex-1">
															<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Email</p>
															<p className="mt-0.5 break-all text-xs font-semibold">{vendorEmail}</p>
														</div>
													</div>
												)}
												{vendorPhone && (
													<div className="flex items-start gap-2 rounded-none border bg-muted/30 p-2.5">
														<Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
														<div className="min-w-0 flex-1">
															<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Phone</p>
															<p className="mt-0.5 break-all text-xs font-semibold">{vendorPhone}</p>
														</div>
													</div>
												)}
											</div>
										</div>
									)}
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
