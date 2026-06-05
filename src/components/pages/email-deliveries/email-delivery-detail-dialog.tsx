"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Calendar,
	CheckCircle2,
	Clock,
	Copy,
	ExternalLink,
	Hash,
	type LucideIcon,
	Mail,
	RefreshCcw,
	Send,
	ShieldAlert,
	User,
} from "lucide-react";
import { LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { getEmailDelivery } from "@/lib/api/email-delivery";
import { cn } from "@/lib/utils";

interface EmailDeliveryDetailDialogProps {
	deliveryId: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { color: string; label: string }> = {
	queued: {
		color: "bg-slate-500 text-white border-transparent",
		label: "Queued",
	},
	sending: {
		color: "bg-blue-500 text-white border-transparent",
		label: "Sending",
	},
	sent: {
		color: "bg-cyan-500 text-white border-transparent",
		label: "Sent",
	},
	delivered: {
		color: "bg-green-500 text-white border-transparent",
		label: "Delivered",
	},
	failed: {
		color: "bg-red-500 text-white border-transparent",
		label: "Failed",
	},
	bounced: {
		color: "bg-orange-500 text-white border-transparent",
		label: "Bounced",
	},
	complained: {
		color: "bg-yellow-600 text-white border-transparent",
		label: "Complained",
	},
	suppressed: {
		color: "bg-zinc-500 text-white border-transparent",
		label: "Suppressed",
	},
};

export function EmailDeliveryDetailDialog({
	deliveryId,
	open,
	onOpenChange,
}: EmailDeliveryDetailDialogProps) {
	const { data, isLoading } = useQuery({
		queryKey: ["email-delivery", deliveryId],
		queryFn: () => getEmailDelivery(deliveryId as number),
		enabled: open && deliveryId !== null,
	});

	const { copyToClipboard } = useCopyToClipboard();

	const renderInfoRow = (
		label: string,
		value: React.ReactNode,
		icon?: LucideIcon,
	) => {
		const Icon = icon;
		return (
			<div className="flex flex-col gap-1">
				<span className="flex items-center gap-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
					{Icon && <Icon className="h-3 w-3" />}
					{label}
				</span>
				<div className="font-medium text-sm">{value || "-"}</div>
			</div>
		);
	};

	const renderTimestamp = (label: string, date: string | null) => {
		if (!date) return null;
		const d = new Date(date);
		return (
			<div className="flex items-center justify-between border-border/50 border-b py-2 last:border-0">
				<span className="font-medium text-muted-foreground text-xs">
					{label}
				</span>
				<div className="text-right">
					<div className="font-semibold text-xs">{d.toLocaleDateString()}</div>
					<div className="text-[10px] text-muted-foreground">
						{d.toLocaleTimeString()}
					</div>
				</div>
			</div>
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] gap-0 overflow-y-auto rounded-none p-0 sm:max-w-3xl">
				<DialogHeader className="border-b p-6 pb-4">
					<div className="flex items-center justify-between pr-8">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<DialogTitle className="text-xl">
									Email Delivery #{deliveryId}
								</DialogTitle>
								{!isLoading && data?.status && statusConfig[data.status] && (
									<Badge
										variant="outline"
										className={cn(
											"rounded-none px-2.5 py-0.5 font-bold text-xs",
											statusConfig[data.status].color,
										)}
									>
										{statusConfig[data.status].label}
									</Badge>
								)}
							</div>
							<DialogDescription>
								{isLoading || !data ? (
									"Retrieving log details, failures, and retry metadata..."
								) : (
									<>
										Log details for the email sent via{" "}
										<span className="font-mono text-foreground">
											{data.mailerName}.{data.mailerAction}
										</span>
									</>
								)}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{isLoading || !data ? (
					<div className="p-12">
						<LoadingState
							title="Loading details..."
							description="Please wait while we fetch this email log."
							height="h-48"
						/>
					</div>
				) : (
					<div className="space-y-8 p-6">
						{/* Error Section */}
						{(data.lastError || data.failureReason) && (
							<div className="flex gap-3 rounded-none border border-red-200 bg-red-50 p-4">
								<AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
								<div className="space-y-1">
									<h4 className="font-bold text-red-800 text-sm">
										Delivery Error
									</h4>
									<p className="break-all font-mono text-red-700 text-sm">
										{data.lastError || data.failureReason}
									</p>
								</div>
							</div>
						)}

						<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
							{/* Left Column: Metadata & Details */}
							<div className="space-y-8 md:col-span-2">
								<section className="space-y-4">
									<h3 className="flex items-center gap-2 font-bold text-sm">
										<Hash className="h-4 w-4 text-primary" />
										Metadata
									</h3>
									<div className="grid grid-cols-2 gap-6 rounded-none border border-border/50 bg-muted/30 p-4">
										{renderInfoRow("Provider", data.provider)}
										{renderInfoRow(
											"Provider ID",
											<div className="group flex items-center gap-2">
												<span className="max-w-[150px] truncate font-mono text-xs">
													{data.providerMessageId}
												</span>
												{data.providerMessageId && (
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
														onClick={() =>
															copyToClipboard(data.providerMessageId || "")
														}
													>
														<Copy className="h-3 w-3" />
													</Button>
												)}
											</div>,
										)}
										{renderInfoRow(
											"Related To",
											data.relatedType && (
												<div className="flex cursor-pointer items-center gap-1 text-primary hover:underline">
													<span>
														{data.relatedType} #{data.relatedId}
													</span>
													<ExternalLink className="h-3 w-3" />
												</div>
											),
										)}
										{renderInfoRow(
											"Retry Info",
											<div className="flex flex-col">
												<span>Count: {data.retryCount}</span>
												{data.nextRetryAt && (
													<span className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
														<Clock className="h-3 w-3" />
														Next: {new Date(data.nextRetryAt).toLocaleString()}
													</span>
												)}
											</div>,
										)}
									</div>
								</section>

								<section className="space-y-4">
									<h3 className="flex items-center gap-2 font-bold text-sm">
										<Mail className="h-4 w-4 text-primary" />
										Content & Recipients
									</h3>
									<div className="space-y-4">
										<div className="space-y-1">
											<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
												Subject
											</span>
											<p className="font-medium text-base leading-tight">
												{data.subject || "(No Subject)"}
											</p>
										</div>

										<div className="grid grid-cols-1 gap-4">
											<div className="flex items-start gap-3">
												<div className="mt-1 rounded-full bg-primary/10 p-1.5">
													<User className="h-3.5 w-3.5 text-primary" />
												</div>
												<div className="flex-1 space-y-2">
													<div>
														<span className="mb-0.5 block font-bold text-[10px] text-muted-foreground uppercase">
															To
														</span>
														<div className="flex flex-wrap gap-1.5">
															{data.recipients.to.map((email) => (
																<Badge
																	key={email}
																	variant="secondary"
																	className="rounded-none font-normal text-xs"
																>
																	{email}
																</Badge>
															))}
															{data.recipients.to.length === 0 && (
																<span className="text-muted-foreground text-xs italic">
																	None
																</span>
															)}
														</div>
													</div>

													{data.recipients.cc.length > 0 && (
														<div>
															<span className="mb-0.5 block font-bold text-[10px] text-muted-foreground uppercase">
																Cc
															</span>
															<div className="flex flex-wrap gap-1.5">
																{data.recipients.cc.map((email) => (
																	<Badge
																		key={email}
																		variant="outline"
																		className="rounded-none font-normal text-xs"
																	>
																		{email}
																	</Badge>
																))}
															</div>
														</div>
													)}

													{data.recipients.bcc.length > 0 && (
														<div>
															<span className="mb-0.5 block font-bold text-[10px] text-muted-foreground uppercase">
																Bcc
															</span>
															<div className="flex flex-wrap gap-1.5">
																{data.recipients.bcc.map((email) => (
																	<Badge
																		key={email}
																		variant="outline"
																		className="rounded-none font-normal text-xs italic"
																	>
																		{email}
																	</Badge>
																))}
															</div>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								</section>
							</div>

							{/* Right Column: Timeline */}
							<div className="space-y-6">
								<section className="space-y-4 rounded-none border bg-muted/30 p-4">
									<h3 className="flex items-center gap-2 font-bold text-muted-foreground text-xs uppercase tracking-widest">
										<Calendar className="h-3.5 w-3.5" />
										Timeline
									</h3>
									<div className="space-y-1">
										{renderTimestamp("Created", data.createdAt)}
										{renderTimestamp("Sent", data.sentAt)}
										{renderTimestamp("Delivered", data.deliveredAt)}
										{renderTimestamp("Failed", data.failedAt)}
										{renderTimestamp("Bounced", data.bouncedAt)}
										{renderTimestamp("Complained", data.complainedAt)}
										{renderTimestamp("Suppressed", data.suppressedAt)}
									</div>

									<Separator className="my-4" />

									<div className="flex items-center justify-between font-medium text-[10px] text-muted-foreground">
										<span>Last Updated</span>
										<span>{new Date(data.updatedAt).toLocaleString()}</span>
									</div>
								</section>

								{data.resendOfId && (
									<div className="flex items-center gap-2 rounded-none border border-orange-100 bg-orange-50/50 p-3 text-xs">
										<RefreshCcw className="h-3.5 w-3.5 text-orange-500" />
										<span className="text-orange-700">
											Resend of <strong>#{data.resendOfId}</strong>
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
