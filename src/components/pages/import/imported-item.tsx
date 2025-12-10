"use client";

import {
	AlertCircle,
	CheckCircle2,
	ChevronDown,
	CreditCard,
	FileX,
	RefreshCw,
	Tag,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface ImportedItemProps {
	item: Record<string, unknown> | string;
	category: "created" | "updated" | "skipped" | "errors";
}

export function ImportedItem({ item, category }: ImportedItemProps) {
	const [isOpen, setIsOpen] = useState(false);
	const isError = category === "errors";
	const itemData: string | Record<string, unknown> = item;

	// Extract changed_fields for updated items
	const changedFields =
		category === "updated" && typeof itemData === "object"
			? (itemData.changed_fields as string[] | undefined)
			: undefined;

	const hasPaymentStatusChange =
		changedFields?.includes("payment_status") ?? false;
	const hasCustomLabelsChange =
		changedFields?.includes("custom_fields_data") ?? false;

	const categoryConfig = {
		created: {
			bg: "bg-green-50 dark:bg-green-950/20",
			border: "border-green-200 dark:border-green-900/30",
			iconBg: "bg-green-500/20",
			icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
			badgeBg: "bg-green-500/20 text-green-700 dark:text-green-400",
			label: "Created",
		},
		updated: {
			bg: "bg-blue-50 dark:bg-blue-950/20",
			border: "border-blue-200 dark:border-blue-900/30",
			iconBg: "bg-blue-500/20",
			icon: <RefreshCw className="h-4 w-4 text-blue-600" />,
			badgeBg: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
			label: "Updated",
		},
		skipped: {
			bg: "bg-yellow-50 dark:bg-yellow-950/20",
			border: "border-yellow-200 dark:border-yellow-900/30",
			iconBg: "bg-yellow-500/20",
			icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
			badgeBg: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
			label: "Skipped",
		},
		errors: {
			bg: "bg-red-50 dark:bg-red-950/20",
			border: "border-red-200 dark:border-red-900/30",
			iconBg: "bg-red-500/20",
			icon: <FileX className="h-4 w-4 text-red-600" />,
			badgeBg: "bg-red-500/20 text-red-700 dark:text-red-400",
			label: "Error",
		},
	};

	const config = categoryConfig[category];

	// For non-error items, extract all fields
	const otherFields =
		!isError && typeof itemData === "object"
			? Object.entries(itemData as Record<string, unknown>).filter(
					([key]) =>
						key !== "model" && key !== "id" && key !== "changed_fields",
				)
			: [];
	const firstTwoFields = otherFields.slice(0, 2);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<Card
				className={cn(
					"gap-0 rounded-none border-2 p-0 transition-all",
					config.bg,
					config.border,
				)}
			>
				{isError ? (
					<CardContent className="px-2 py-4 md:px-4">
						<div className="flex items-start gap-3">
							<div className={cn("shrink-0 rounded-lg p-2", config.iconBg)}>
								{config.icon}
							</div>
							<div className="min-w-0 flex-1 space-y-2">
								<div className="flex items-center gap-2">
									<Badge
										className={cn(
											"shrink-0 rounded-none font-medium text-xs",
											config.badgeBg,
										)}
									>
										{config.label}
									</Badge>
								</div>
								<p className="wrap-break-word font-medium text-foreground text-sm">
									{itemData as string}
								</p>
							</div>
						</div>
					</CardContent>
				) : (
					<>
						<CollapsibleTrigger asChild>
							<CardHeader
								className={cn(
									"cursor-pointer px-2 py-4 transition-colors hover:bg-opacity-50 md:px-4",
								)}
							>
								<div className="flex items-start gap-3">
									<div className={cn("shrink-0 rounded-lg p-2", config.iconBg)}>
										{config.icon}
									</div>
									<div className="min-w-0 flex-1 space-y-0">
										<div className="flex flex-wrap items-center gap-2">
											<Badge
												className={cn(
													"shrink-0 rounded-none font-medium text-xs",
													config.badgeBg,
												)}
											>
												{config.label}
											</Badge>
											{/* Show change indicators for updated items */}
											{category === "updated" && (
												<>
													{hasPaymentStatusChange && (
														<Badge
															variant="outline"
															className="shrink-0 rounded-none border-orange-500/50 bg-orange-50 font-medium text-orange-700 text-xs dark:bg-orange-950/20 dark:text-orange-400"
														>
															<CreditCard className="mr-1 h-3 w-3" />
															Payment Status Changed
														</Badge>
													)}
													{hasCustomLabelsChange && (
														<Badge
															variant="outline"
															className="shrink-0 rounded-none border-purple-500/50 bg-purple-50 font-medium text-purple-700 text-xs dark:bg-purple-950/20 dark:text-purple-400"
														>
															<Tag className="mr-1 h-3 w-3" />
															Custom Labels Changed
														</Badge>
													)}
												</>
											)}
										</div>
										{(() => {
											const data = itemData as Record<string, unknown>;
											const model = data.model;
											if (model) {
												return (
													<p className="font-semibold text-sm capitalize">
														{String(model)}
													</p>
												);
											}
											return null;
										})()}
										{(() => {
											const data = itemData as Record<string, unknown>;
											const id = data.id;
											if (id) {
												return (
													<p className="break-all font-mono text-muted-foreground text-xs">
														ID: {String(id)}
													</p>
												);
											}
											return null;
										})()}
										{/* Display first 2 fields in header only when closed */}
										{!isOpen &&
											firstTwoFields.map(([key, value]) => (
												<div key={key} className="flex items-start gap-2">
													<span className="shrink-0 font-medium text-muted-foreground text-xs capitalize">
														{key.replace(/_/g, " ")}:
													</span>
													<span className="wrap-break-word text-xs">
														{value !== null && value !== undefined
															? String(value)
															: "N/A"}
													</span>
												</div>
											))}
									</div>
									<div className="shrink-0">
										<ChevronDown
											className={cn(
												"h-4 w-4 text-muted-foreground transition-transform",
												isOpen && "rotate-180",
											)}
										/>
									</div>
								</div>
							</CardHeader>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<CardContent className="px-2 pt-0 pb-4 md:px-4">
								<div className="space-y-1 pl-11">
									{/* Display all fields in content */}
									{otherFields.map(([key, value]) => (
										<div key={key} className="flex items-start gap-2">
											<span className="shrink-0 font-medium text-muted-foreground text-xs capitalize">
												{key.replace(/_/g, " ")}:
											</span>
											<span className="wrap-break-word text-xs">
												{value !== null && value !== undefined
													? String(value)
													: "N/A"}
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</CollapsibleContent>
					</>
				)}
			</Card>
		</Collapsible>
	);
}
