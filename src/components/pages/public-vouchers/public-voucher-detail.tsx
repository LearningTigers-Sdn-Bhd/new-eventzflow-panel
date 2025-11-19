"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import { ArrowLeft, Clock, Mail, MapPin, Phone, Quote, Share2, Store, Tag, Ticket, User } from "lucide-react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFormatDate } from "@/hooks/use-format-date";
import { intervalToDuration, isPast } from "date-fns";
import { getVoucher } from "@/lib/api/voucher";
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
		queryFn: () => getVoucher(voucherId),
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
	const validUntil = new Date(voucher.endDate);
	const isExpired = isPast(validUntil);

	const duration = intervalToDuration({
		start: now,
		end: validUntil,
	});

	const validityString = isExpired
		? "Expired"
		: `${duration.days ?? 0} Days ${duration.hours ?? 0} Hours left`;

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
		<div className="min-h-screen bg-muted/30 px-3 py-6 sm:px-6 sm:py-10">
			<div className="mx-auto flex w-full max-w-6xl flex-col">
				<Button variant="ghost" size="sm" className="mb-5 w-fit px-0 text-xs sm:text-sm" onClick={navigateBack}>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to vouchers
				</Button>

				<div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
					<aside className="space-y-5 sm:space-y-6">
						<section className="rounded-[32px] border bg-neutral-900 text-white shadow-xl">
							<div className="flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center">
								<div className="flex-1 space-y-3">
									<p className="text-[11px] uppercase tracking-[0.4em] text-white/60">Redeem on-site</p>
									<h2 className="text-2xl font-semibold leading-tight">Show this pass to claim the perk</h2>
									<p className="text-sm text-white/70">
										Present the QR code at the merchant kiosk. Staff will scan and confirm instantly.
									</p>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
										<Button variant="secondary" size="sm" className="rounded-full px-6 py-2" onClick={handleCopyCode}>
											{copiedCode ? "Code copied" : "Copy code"}
										</Button>
										<div className="rounded-full border border-white/20 px-4 py-2 text-center text-sm font-mono tracking-wider text-white/90">
											{redemptionCode}
										</div>
									</div>
									<div className="rounded-2xl border border-white/15 bg-white/5 p-3 text-xs text-white/80">
										Keep this page open. The QR and code update automatically after a successful redemption.
									</div>
								</div>
								<div className="flex flex-col items-center gap-3">
									<div className="rounded-[26px] bg-white p-4 shadow-2xl">
										<QRCode value={qrValue} size={200} style={{ height: "auto", width: "100%", maxWidth: "220px" }} />
									</div>
									<p className="text-[11px] uppercase tracking-[0.35em] text-white/70">Scan to redeem</p>
								</div>
							</div>
						</section>

						<section className="rounded-[28px] border bg-card p-5 sm:p-6 shadow-sm">
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-2xl border border-border/60 bg-primary/10 flex items-center justify-center sm:h-20 sm:w-20">
									<Store className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
								</div>
								<div>
									<p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
										{hasVendor ? "Vendor" : "Provided by"}
									</p>
									<h2 className="text-xl font-semibold">{vendorName}</h2>
								</div>
							</div>

							<div className="space-y-5 pt-5">
								{vendorDescription && (
									<div>
										<p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">About</p>
										<div className="rounded-2xl border bg-muted/10 px-4 py-3">
											<p className="text-sm text-foreground whitespace-pre-line">
												{vendorDescription}
											</p>
										</div>
									</div>
								)}

								{hasVendor && (vendorEmail || vendorPhone || vendorPersonInCharge || vendorCategory || vendorAddress) && (
									<div>
										<p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">Contact</p>
										<div className="grid gap-3 sm:grid-cols-2">
											{vendorEmail && (
												<div className="flex items-start gap-3 rounded-2xl border bg-muted/10 px-4 py-3">
													<Mail className="h-4 w-4 text-primary mt-0.5" />
													<div className="text-sm flex-1 min-w-0">
														<p className="text-[10px] uppercase tracking-wide text-muted-foreground">Email</p>
														<p className="font-semibold break-all">{vendorEmail}</p>
													</div>
												</div>
											)}
											{vendorPhone && (
												<div className="flex items-start gap-3 rounded-2xl border bg-muted/10 px-4 py-3">
													<Phone className="h-4 w-4 text-primary mt-0.5" />
													<div className="text-sm flex-1 min-w-0">
														<p className="text-[10px] uppercase tracking-wide text-muted-foreground">Phone</p>
														<p className="font-semibold break-all">{vendorPhone}</p>
													</div>
												</div>
											)}
											{vendorPersonInCharge && (
												<div className="flex items-start gap-3 rounded-2xl border bg-muted/10 px-4 py-3">
													<User className="h-4 w-4 text-primary mt-0.5" />
													<div className="text-sm flex-1 min-w-0">
														<p className="text-[10px] uppercase tracking-wide text-muted-foreground">Person in Charge</p>
														<p className="font-semibold">{vendorPersonInCharge}</p>
													</div>
												</div>
											)}
											{vendorCategory && (
												<div className="flex items-start gap-3 rounded-2xl border bg-muted/10 px-4 py-3">
													<Tag className="h-4 w-4 text-primary mt-0.5" />
													<div className="text-sm flex-1 min-w-0">
														<p className="text-[10px] uppercase tracking-wide text-muted-foreground">Category</p>
														<p className="font-semibold capitalize">{vendorCategory}</p>
													</div>
												</div>
											)}
											{vendorAddress && (
												<div className="flex items-start gap-3 rounded-2xl border bg-muted/10 px-4 py-3 sm:col-span-2">
													<MapPin className="h-4 w-4 text-primary mt-0.5" />
													<div className="text-sm flex-1 min-w-0">
														<p className="text-[10px] uppercase tracking-wide text-muted-foreground">Address</p>
														<p className="font-semibold whitespace-pre-line">{vendorAddress}</p>
													</div>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</section>
					</aside>

					<main className="space-y-6 sm:space-y-7">
						<section className="rounded-[28px] border bg-card p-5 sm:p-7 shadow-sm space-y-6">
							<div className="flex flex-wrap items-center gap-3">
								<Badge variant="secondary" className="capitalize bg-primary/10 text-primary">
									{voucher.voucherType.replace(/_/g, " ")}
								</Badge>
								<span className={`inline-flex items-center gap-2 rounded-full border border-current px-3 py-1 text-[11px] font-semibold ${statusAccent} sm:text-xs`}>
									<span className={`h-2 w-2 rounded-full ${statusBgClass}`} />
									{statusLabel}
								</span>
							</div>
							<div className="space-y-2">
								<h1 className="text-2xl font-semibold sm:text-3xl">{voucher.title}</h1>
								<p className="text-sm text-muted-foreground sm:text-base">
									{voucher.voucherType === "percentage"
										? `${voucher.voucherValue}% off`
										: voucher.voucherType === "fixed_amount"
											? `RM ${voucher.voucherValue.toFixed(2)} off`
											: `${voucher.voucherValue} free item(s)`}
								</p>
								{voucher.description && (
									<p className="text-sm text-muted-foreground pt-2 whitespace-pre-line">
										{voucher.description}
									</p>
								)}
							</div>

							<div className="grid gap-4 sm:grid-cols-3">
								<div className="rounded-2xl border bg-muted/20 px-4 py-3">
									<p className="text-[11px] uppercase tracking-widest text-muted-foreground">Available</p>
									<p className="mt-1 text-2xl font-semibold">{voucher.totalRedemptionAvailable ?? 0}</p>
								</div>
								<div className="rounded-2xl border bg-muted/20 px-4 py-3">
									<p className="text-[11px] uppercase tracking-widest text-muted-foreground">Redeemed</p>
									<p className="mt-1 text-2xl font-semibold">{voucher.redeemedCount ?? 0}</p>
								</div>
								<div className="rounded-2xl border bg-muted/20 px-4 py-3">
									<p className="text-[11px] uppercase tracking-widest text-muted-foreground">Remaining</p>
									<p className="mt-1 text-2xl font-semibold">{Math.max(remaining, 0)}</p>
								</div>
							</div>

							<div className="space-y-3 rounded-2xl border bg-muted/10 px-4 py-3">
								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Ticket className="h-4 w-4" />
										<span>Availability</span>
									</div>
									<span className={`font-semibold ${statusAccent}`}>
										{remaining} / {voucher.totalRedemptionAvailable}
									</span>
								</div>
								<Progress value={percentageUsed} className="h-2" />
							</div>

							<div className="rounded-2xl border bg-muted/20 px-4 py-3">
								<div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
									<Clock className="h-4 w-4" />
									<span>Validity</span>
								</div>
								<p className={`mt-2 text-lg font-semibold ${isExpired ? "text-red-600" : "text-emerald-600"}`}>
									{validityString}
								</p>
							</div>

							<div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground space-y-3">
								<div className="flex items-start gap-3 text-foreground">
									<Quote className="h-5 w-5 text-primary" />
									<p>
										This voucher is valid until <span className="font-semibold">{formatDate(voucher.endDate)}</span>. Make sure to redeem it before it expires.
									</p>
								</div>
								<Button variant="secondary" size="sm" className="w-full rounded-xl border" onClick={handleShare}>
									<Share2 className="mr-2 h-4 w-4" />
									{shared ? "Shared!" : "Share Voucher"}
								</Button>
							</div>
						</section>
					</main>
				</div>
			</div>
		</div>
	);
}
