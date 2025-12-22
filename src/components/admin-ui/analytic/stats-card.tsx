"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ReactElement } from "react";
import type { IconType } from "react-icons";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Shared variants for StatsCard and CompactStatsCard
export const cardVariants = cva(
	"flex min-w-0 flex-col items-center gap-1 border p-2 text-center",
	{
		variants: {
			variant: {
				default: "border-primary/20 bg-primary/5 text-muted-foreground",
				sky: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300",
				emerald:
					"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
				yellow:
					"border-yellow-400 bg-yellow-100 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export const countVariants = cva("font-bold text-lg", {
	variants: {
		variant: {
			default: "",
			sky: "text-sky-600 dark:text-sky-400",
			emerald: "text-emerald-600 dark:text-emerald-400",
			yellow: "text-yellow-600 dark:text-yellow-400",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export type StatsVariant = VariantProps<typeof cardVariants>["variant"];

const labelColorVariants = {
	border: cva("", {
		variants: {
			color: {
				blue: "border-sky-600",
				green: "border-emerald-600",
				red: "border-red-500",
				yellow: "border-yellow-500",
				purple: "border-purple-500",
			},
		},
	}),
	bg: cva("", {
		variants: {
			color: {
				blue: "bg-sky-400/50",
				green: "bg-emerald-400/50",
				red: "bg-red-500/50",
				yellow: "bg-yellow-500/50",
				purple: "bg-purple-500/50",
			},
		},
	}),
	solidBg: cva("", {
		variants: {
			color: {
				blue: "bg-sky-400",
				green: "bg-emerald-400",
				red: "bg-red-500",
				yellow: "bg-yellow-500",
				purple: "bg-purple-500",
			},
		},
	}),
	count: cva("", {
		variants: {
			color: {
				blue: "text-sky-400",
				green: "text-emerald-400",
				red: "text-red-500",
				yellow: "text-yellow-500",
				purple: "text-purple-500",
			},
		},
	}),
	label: cva("", {
		variants: {
			color: {
				blue: "text-sky-400",
				green: "text-emerald-400",
				red: "text-red-500",
				yellow: "text-yellow-500",
				purple: "text-purple-500",
			},
		},
	}),
} as const;

export type LabelColor = VariantProps<
	typeof labelColorVariants.border
>["color"];

export interface Indicator {
	label: string;
	count: number;
	color?: LabelColor;
	isTotal?: boolean;
}

export type ProgressStatsCardProps = {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	subtitle?: string;
	indicators: Indicator[];
	progressValue?: number; // Current value for progress
	quickAction?: {
		label: string;
		onClick: () => void;
	};
};

export function ProgressStatsCard({ data }: { data: ProgressStatsCardProps }) {
	const {
		icon: Icon,
		title,
		subtitle,
		indicators,
		progressValue,
		quickAction,
	} = data;

	// Find the total indicator (marked with isTotal: true)
	const totalIndicator = indicators.find((ind) => ind.isTotal);
	const total = totalIndicator?.count;

	// Auto-detect progress from indicators if not explicitly provided
	// Use first non-total indicator as progress if available
	const autoProgressValue: number | undefined =
		progressValue !== undefined
			? progressValue
			: indicators.find((ind) => !ind.isTotal)?.count;

	const progressPercentage =
		total !== undefined && autoProgressValue !== undefined && total > 0
			? (autoProgressValue / total) * 100
			: undefined;

	// Extract colors from indicators for progress bar
	const progressIndicator = indicators.find((ind) => !ind.isTotal);

	const totalBgClass = totalIndicator?.color
		? labelColorVariants.solidBg({ color: totalIndicator.color })
		: "bg-blue-500";
	const progressBgClass = progressIndicator?.color
		? labelColorVariants.solidBg({ color: progressIndicator.color })
		: "bg-green-500";

	return (
		<Card className="h-full w-full gap-0 rounded-none p-0 shadow-none">
			<CardHeader className="flex min-h-[100px] flex-col justify-between px-4 py-4">
				{/* FlexRow: Icon and Title */}
				<div className="flex items-end gap-3">
					<div className="flex h-full items-end justify-center">
						<Icon className="size-8 text-muted-foreground" />
					</div>
					<h3 className="font-bold text-lg tracking-tight">{title}</h3>
				</div>
				{/* FlexRow: Subtitle (if exists) */}

				<div className="flex h-full w-full items-end">
					{subtitle && (
						<p className="text-balance text-muted-foreground text-sm">
							{subtitle}
						</p>
					)}
				</div>
			</CardHeader>

			<CardContent
				className={cn(
					"flex flex-col gap-4 px-4",
					quickAction ? "pb-0" : "pb-4 md:pb-8",
				)}
			>
				{/* ProgressBar (auto-detected from indicators or explicit values) */}
				{progressPercentage !== undefined && (
					<div
						className={cn(
							"relative h-1 w-full overflow-hidden rounded-none",
							totalBgClass,
						)}
					>
						<div
							className={cn("h-full transition-all", progressBgClass)}
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				)}

				{/* IndicatorListFlexCol */}
				<div className="flex flex-col gap-1">
					{indicators.map((indicator) => (
						<div
							key={indicator.label}
							className="flex items-center justify-between"
						>
							{/* FlexRow: Squared Color and Label */}
							<div className="flex items-center gap-2">
								<div
									className={cn(
										"rounded-none border p-1.5",
										indicator.color
											? cn(
													labelColorVariants.bg({ color: indicator.color }),
													labelColorVariants.border({ color: indicator.color }),
												)
											: "border-primary bg-primary",
									)}
								/>
								<span className="text-muted-foreground text-sm">
									{indicator.label}
								</span>
							</div>
							{/* Count */}
							<span className="font-semibold text-base">
								{indicator.count.toLocaleString()}
							</span>
						</div>
					))}
				</div>
			</CardContent>

			{/* Footer: ActionButton when quickAction exists */}
			{quickAction && (
				<CardFooter className="w-full p-0 pt-6">
					<Button
						onClick={quickAction.onClick}
						className="w-full rounded-none border-border/90 border-x-0 border-t border-b-0 py-7"
						variant="outline"
					>
						<span className="font-semibold text-sm">{quickAction.label}</span>
						<ArrowUpRight className="mb-0.5 ml-1 size-4" />
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}

export type StatsCardProps = {
	label: string;
	value: React.ReactNode;
	Icon: React.ComponentType<{ className?: string }>;
	subtitle?: string;
	valueClassName?: string;
	iconContainerClassName?: string;
	iconClassName?: string;
	variant?: StatsVariant;
};

export function StatsCard({
	label,
	value,
	Icon,
	subtitle,
	variant,
}: StatsCardProps) {
	return (
		<Card
			className={cn(
				"h-full rounded-none border border-border/90 border-x border-dashed bg-muted/50 p-0 shadow-none lg:border-l",
			)}
		>
			<CardContent className="h-full p-0">
				<div className="flex h-full flex-col items-center justify-between gap-2 md:flex-row md:gap-0">
					<div className="flex h-full items-center justify-center px-6 pt-3 md:py-0">
						<Icon className={cn("size-7 md:size-6")} />
					</div>
					<div className="flex h-full w-full flex-col justify-center px-4 pb-4 text-center md:px-0 md:py-4 md:text-left">
						<p className={cn("text-balance align-top font-semibold text-sm")}>
							{label}
						</p>
						<p
							className={cn(
								"font-bold text-xl tracking-tight",
								variant && countVariants({ variant }),
							)}
						>
							{value}
						</p>
						{subtitle && (
							<p className="text-muted-foreground text-sm">{subtitle}</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export interface CompactStatsCardProps
	extends VariantProps<typeof cardVariants> {
	icon: LucideIcon | IconType;
	label: string;
	count: number;
}

export function CompactStatsCard({
	icon: Icon,
	label,
	count,
	variant,
}: CompactStatsCardProps): ReactElement {
	return (
		<div className={cardVariants({ variant })}>
			<Icon className="size-5" />
			<p className="text-xs">{label}</p>
			<p className={countVariants({ variant })}>{count}</p>
		</div>
	);
}
