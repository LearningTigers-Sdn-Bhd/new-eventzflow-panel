"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { Ticket, Gift, Store, Percent, Wallet, ArrowLeftRight } from "lucide-react";
import { useParams } from "next/navigation";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { getPublicEventById } from "@/lib/api/event";
import { getPublicVouchers } from "@/lib/api/voucher";
import { EventNotFound } from "./event-not-found";
import { PublicVoucherCard } from "./voucher-card";

// Map backend voucher type to display categories
const discountCategories = ["free_item", "fixed_amount", "percentage"] as const;

type DiscountCategory = (typeof discountCategories)[number];

const isDiscountCategory = (value: string): value is DiscountCategory =>
	(discountCategories as readonly string[]).includes(value);

const categoryMeta: Record<DiscountCategory, { label: string; description: string; Icon: LucideIcon }> = {
	percentage: {
		label: "Percentage",
		description: "Save with % off items",
		Icon: Percent,
	},
	fixed_amount: {
		label: "Cash Savings",
		description: "Instant RM rebates",
		Icon: Wallet,
	},
	free_item: {
		label: "Free Items",
		description: "Complimentary items",
		Icon: ArrowLeftRight,
	},
};

type CategoryOption = {
	value: "all" | DiscountCategory;
	label: string;
	description: string;
	Icon: LucideIcon;
	count: number;
};

const emptyCategoryCounts: Record<DiscountCategory, number> = {
	free_item: 0,
	fixed_amount: 0,
	percentage: 0,
};

export function PublicVouchersPage() {
	const params = useParams();
	const eventId = params.event_id as string;
	const [selectedCategory, setSelectedCategory] = useState<"all" | DiscountCategory>("all");

	// Fetch event details for title (public endpoint - no auth required)
	const { 
		data: event, 
		isLoading: isLoadingEvent, 
		error: eventError 
	} = useQuery({
		queryKey: ["public", "event", eventId],
		queryFn: async () => {
			try {
				return await getPublicEventById(eventId);
			} catch (error) {
				// Silently catch the error - we'll handle it in the UI
				return null;
			}
		},
		enabled: Boolean(eventId),
		retry: false,
	});

	const {
		data: vouchers,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["public", "event", eventId, "vouchers"],
		queryFn: () => getPublicVouchers({ event_id: Number(eventId) }),
		enabled: Boolean(eventId) && Boolean(event),
	});

	const filteredVouchers = vouchers?.filter((voucher) => {
		if (selectedCategory === "all") {
			return true;
		}
		return voucher.voucherType === selectedCategory;
	}) || [];

	if (isLoading || isLoadingEvent) {
		return (
			<div className="relative mt-16 min-h-screen bg-background">
				<div className="container relative mx-auto px-4 py-8 lg:py-12">
					<LoadingState
						title="Loading vouchers..."
						description="Please wait while we fetch available vouchers"
						height="h-[400px]"
					/>
				</div>
			</div>
		);
	}

	if (!event) {
		return <EventNotFound />;
	}

	if (error) {
		return (
			<div className="relative mt-16 min-h-screen bg-background">
				<div className="container relative mx-auto px-4 py-8 lg:py-12">
					<ErrorState
						title="Failed to load vouchers"
						description="Please try again later"
						height="h-[400px]"
					/>
				</div>
			</div>
		);
	}

	if (!vouchers || vouchers.length === 0) {
		return (
			<div className="relative mt-16 min-h-screen bg-background">
				<div className="container relative mx-auto px-4 py-8 lg:py-12">
					<EmptyState
						title="No vouchers available"
						description="There are currently no active vouchers for this event. Please check back later for new offers."
						icon={<Ticket className="size-12" />}
						height="h-[400px]"
					/>
				</div>
			</div>
		);
	}

	const eventDisplayName = event?.title || "Event Vouchers";

	const totalVouchers = vouchers.length;
	const availableVouchers = vouchers.filter((v) => v.isUnlimited || (v.totalRedemptionAvailable ?? 0) - v.redeemedCount > 0).length;
	const totalVendors = vouchers ? new Set(vouchers.map((voucher) => voucher.vendor?.fullName || "Unknown")).size : 0;

	const summaryCards = [
		{
			label: "Total Offers",
			value: totalVouchers,
			Icon: Gift,
		},
		{
			label: "Total Vendors",
			value: totalVendors,
			Icon: Store,
		},
	];

	const categoryCounts = (vouchers ?? []).reduce<Record<DiscountCategory, number>>((acc, voucher) => {
		if (isDiscountCategory(voucher.voucherType)) {
			acc[voucher.voucherType] += 1;
		}
		return acc;
	}, { ...emptyCategoryCounts });

	const categoryOptions: CategoryOption[] = [
		{
			value: "all",
			label: "All Categories",
			description: "Curated picks for everyone",
			Icon: Gift,
			count: totalVouchers,
		},
		...discountCategories
			.map((key) => ({
				value: key,
				label: categoryMeta[key].label,
				description: categoryMeta[key].description,
				Icon: categoryMeta[key].Icon,
				count: categoryCounts[key],
			}))
			.filter((option) => option.count > 0),
	];

	const selectedCategoryLabel = selectedCategory === "all" ? null : categoryMeta[selectedCategory].label;

	return (
		<div className="relative mt-8 min-h-screen bg-background sm:mt-16">
			{/* Geometric Pattern Background - Interlocking Hexagons */}
			<div
				className="pointer-events-none fixed inset-0 opacity-[0.15]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%239C92AC' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					backgroundSize: '28px 49px'
				}}
			/>

			<div className="container relative mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:py-12">
				{/* Hero Header */}
				<div className="mb-6 text-center sm:mb-10">
					<div className="mb-3 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 sm:mb-4 sm:px-4">
						<Ticket className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
						<span className="font-medium text-primary text-xs sm:text-sm">Exclusive Event Deals</span>
					</div>
					<h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text px-2 font-bold font-heading text-2xl text-transparent tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
						{eventDisplayName}
					</h1>
					<p className="mx-auto mt-3 max-w-3xl px-4 text-muted-foreground text-sm leading-relaxed sm:mt-4 sm:text-lg md:text-xl">
						Discover amazing deals from our event partners. Claim your vouchers now and enjoy exclusive discounts on-site! 🎉
					</p>

					{/* Stats Bar */}
					<div className="mt-6 flex justify-center sm:mt-8">
						<div className="inline-flex flex-row divide-x divide-border border bg-background">
							{summaryCards.map(({ label, value, Icon }) => (
								<div key={label} className="flex items-center gap-3 px-6 py-4 sm:gap-4 sm:px-10 sm:py-5">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-10 sm:w-10">
										<Icon className="h-4 w-4 sm:h-5 sm:w-5" />
									</div>
									<div className="text-left">
										<p className="font-bold text-foreground text-lg leading-none tracking-tight sm:text-2xl">{value}</p>
										<p className="mt-1 font-medium text-[10px] text-muted-foreground uppercase tracking-wider sm:text-xs">{label}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Category Selector */}
				<div className="scrollbar-hide mb-8 flex w-full items-center gap-3 overflow-x-auto md:flex-wrap md:justify-center">
					{categoryOptions.map(({ value, label, Icon }) => (
						<button
							type="button"
							key={value}
							onClick={() => setSelectedCategory(value)}
							className={`flex flex-shrink-0 items-center gap-1.5 border px-3 py-1.5 font-medium text-xs transition-all active:scale-95 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${
								selectedCategory === value
									? "border-primary bg-primary text-primary-foreground shadow-md"
									: "border-border/50 bg-background/80 text-muted-foreground backdrop-blur-sm hover:border-primary/50 hover:bg-accent/50 hover:text-foreground"
							}`}
						>
							<Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
							<span>{label}</span>
						</button>
					))}
				</div>

				{/* Vouchers Grid */}
				<section>
					{filteredVouchers.length === 0 ? (
						<div className="border bg-background/60 px-4 py-12 text-center backdrop-blur-sm sm:px-6 sm:py-16">
							<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center bg-muted sm:mb-4 sm:h-16 sm:w-16">
								<Ticket className="h-6 w-6 text-muted-foreground sm:h-8 sm:w-8" />
							</div>
							<p className="mb-2 font-semibold text-lg sm:text-xl">No vouchers found</p>
							<p className="mx-auto max-w-md px-4 text-muted-foreground text-sm sm:text-base">
								{selectedCategory === "all"
									? "We couldn't find any public vouchers right now. Check back soon for fresh offers."
									: `No ${selectedCategoryLabel} vouchers at the moment. Try another category for more deals.`}
							</p>
						</div>
					) : (
						<div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3">
							{filteredVouchers.map((voucher) => (
								<PublicVoucherCard key={voucher.id} voucher={voucher} />
							))}
						</div>
					)}
				</section>

				{/* Footer CTA */}
				{filteredVouchers.length > 0 && (
					<div className="mt-8 text-center sm:mt-12">
						<div className="inline-block w-full border bg-muted p-5 sm:p-8">
							<p className="mb-1 font-semibold text-base sm:mb-2 sm:text-lg">Don't miss out on these exclusive deals!</p>
							<p className="text-muted-foreground text-xs sm:text-sm">
								Vouchers are limited and available on a first-come, first-served basis.
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
