"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { Ticket, Gift, Store, Percent, Wallet, ArrowLeftRight } from "lucide-react";
import { useParams } from "next/navigation";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { getVouchers } from "@/lib/api/voucher";
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

	// Fetch event details for title
	const { data: event } = useQuery({
		queryKey: ["event", eventId],
		queryFn: async () => {
			const { getEventById } = await import("@/lib/api/event");
			return getEventById(eventId);
		},
		enabled: Boolean(eventId),
	});

	const {
		data: vouchers,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["public", "event", eventId, "vouchers"],
		queryFn: () => getVouchers({ event_id: Number(eventId) }),
	});

	const filteredVouchers = vouchers?.filter((voucher) => {
		if (selectedCategory === "all") {
			return true;
		}
		return voucher.voucherType === selectedCategory;
	}) || [];

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background relative mt-16">
				<div className="relative container mx-auto px-4 py-8 lg:py-12">
					<LoadingState
						title="Loading vouchers..."
						description="Please wait while we fetch available vouchers"
						height="h-[400px]"
					/>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background relative mt-16">
				<div className="relative container mx-auto px-4 py-8 lg:py-12">
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
			<div className="min-h-screen bg-background relative mt-16">
				<div className="relative container mx-auto px-4 py-8 lg:py-12">
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
	const availableVouchers = vouchers.filter((v) => v.totalRedemptionAvailable - v.redeemedCount > 0).length;
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
		<div className="min-h-screen bg-background relative mt-8 sm:mt-16">
			{/* Geometric Pattern Background - Interlocking Hexagons */}
			<div
				className="pointer-events-none fixed inset-0 opacity-[0.2]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%239C92AC' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					backgroundSize: '28px 49px'
				}}
			/>

			<div className="relative container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12 max-w-7xl">
				{/* Hero Header */}
				<div className="mb-6 sm:mb-10 text-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 sm:px-4 py-1.5 mb-3 sm:mb-4">
						<Ticket className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
						<span className="text-primary text-xs sm:text-sm font-medium">Exclusive Event Deals</span>
					</div>
					<h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent px-2">
						{eventDisplayName}
					</h1>
					<p className="mt-3 sm:mt-4 text-muted-foreground text-sm sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4">
						Discover amazing deals from our event partners. Claim your vouchers now and enjoy exclusive discounts on-site! 🎉
					</p>

					{/* Stats Bar */}
					<div className="mt-6 sm:mt-8 flex justify-center">
						<div className="inline-flex flex-row divide-x divide-border rounded-2xl border bg-card/50 shadow-sm backdrop-blur-sm">
							{summaryCards.map(({ label, value, Icon }) => (
								<div key={label} className="flex items-center gap-3 px-6 py-4 sm:gap-4 sm:px-10 sm:py-5">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-10 sm:w-10">
										<Icon className="h-4 w-4 sm:h-5 sm:w-5" />
									</div>
									<div className="text-left">
										<p className="text-lg font-bold leading-none tracking-tight text-foreground sm:text-2xl">{value}</p>
										<p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">{label}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Category Selector */}
				<div className="mb-8 flex w-full items-center gap-3 overflow-x-auto scrollbar-hide md:flex-wrap md:justify-center">
					{categoryOptions.map(({ value, label, Icon }) => (
						<button
							type="button"
							key={value}
							onClick={() => setSelectedCategory(value)}
							className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${
								selectedCategory === value
									? "border-primary bg-primary text-primary-foreground shadow-md"
									: "border-border/50 bg-background/80 backdrop-blur-sm text-muted-foreground hover:border-primary/50 hover:bg-accent/50 hover:text-foreground"
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
						<div className="rounded-xl sm:rounded-2xl border bg-card/60 backdrop-blur-sm px-4 sm:px-6 py-12 sm:py-16 text-center shadow-lg">
							<div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-3 sm:mb-4">
								<Ticket className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
							</div>
							<p className="text-lg sm:text-xl font-semibold mb-2">No vouchers found</p>
							<p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-4">
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
					<div className="mt-8 sm:mt-12 text-center">
						<div className="inline-block rounded-xl sm:rounded-2xl bg-muted p-5 sm:p-8 border w-full">
							<p className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Don't miss out on these exclusive deals!</p>
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
