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
	Mail,
	RefreshCcw,
	Send,
	ShieldAlert,
	User,
	type LucideIcon,
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

const statusConfig: Record<
	string,
	{ color: string; label: string }
> = {
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
			<span className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
				{Icon && <Icon className="h-3 w-3" />}
				{label}
			</span>
			<div className="text-sm font-medium">{value || "-"}</div>
		</div>
		);
	};

	const renderTimestamp = (label: string, date: string | null) => {
		if (!date) return null;
		const d = new Date(date);
		return (
			<div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
				<span className="text-muted-foreground text-xs font-medium">{label}</span>
				<div className="text-right">
					<div className="text-xs font-semibold">{d.toLocaleDateString()}</div>
					<div className="text-[10px] text-muted-foreground">
						{d.toLocaleTimeString()}
					</div>
				</div>
			</div>
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl p-0 gap-0 rounded-none">
				<DialogHeader className="p-6 pb-4 border-b">
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
					<div className="p-6 space-y-8">
						{/* Error Section */}
						{(data.lastError || data.failureReason) && (
							<div className="bg-red-50 border border-red-200 rounded-none p-4 flex gap-3">
								<AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
								<div className="space-y-1">
									<h4 className="text-sm font-bold text-red-800">
										Delivery Error
									</h4>
									<p className="text-sm text-red-700 font-mono break-all">
										{data.lastError || data.failureReason}
									</p>
								</div>
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{/* Left Column: Metadata & Details */}
							<div className="md:col-span-2 space-y-8">
								<section className="space-y-4">
									<h3 className="text-sm font-bold flex items-center gap-2">
										<Hash className="h-4 w-4 text-primary" />
										Metadata
									</h3>
									<div className="grid grid-cols-2 gap-6 bg-muted/30 p-4 rounded-none border border-border/50">
										{renderInfoRow("Provider", data.provider)}
										{renderInfoRow(
											"Provider ID",
											<div className="flex items-center gap-2 group">
												<span className="truncate max-w-[150px] font-mono text-xs">
													{data.providerMessageId}
												</span>
												{data.providerMessageId && (
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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
												<div className="flex items-center gap-1 text-primary hover:underline cursor-pointer">
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
													<span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
														<Clock className="h-3 w-3" />
														Next: {new Date(data.nextRetryAt).toLocaleString()}
													</span>
												)}
											</div>,
										)}
									</div>
								</section>

								<section className="space-y-4">
									<h3 className="text-sm font-bold flex items-center gap-2">
										<Mail className="h-4 w-4 text-primary" />
										Content & Recipients
									</h3>
									<div className="space-y-4">
										<div className="space-y-1">
											<span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
												Subject
											</span>
											<p className="text-base font-medium leading-tight">
												{data.subject || "(No Subject)"}
											</p>
										</div>

										<div className="grid grid-cols-1 gap-4">
											<div className="flex items-start gap-3">
												<div className="mt-1 bg-primary/10 p-1.5 rounded-full">
													<User className="h-3.5 w-3.5 text-primary" />
												</div>
												<div className="flex-1 space-y-2">
													<div>
														<span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
															To
														</span>
														<div className="flex flex-wrap gap-1.5">
															{data.recipients.to.map((email) => (
																<Badge
																	key={email}
																	variant="secondary"
																	className="font-normal text-xs rounded-none"
																>
																	{email}
																</Badge>
															))}
															{data.recipients.to.length === 0 && (
																<span className="text-xs text-muted-foreground italic">
																	None
																</span>
															)}
														</div>
													</div>

													{data.recipients.cc.length > 0 && (
														<div>
															<span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
																Cc
															</span>
															<div className="flex flex-wrap gap-1.5">
																{data.recipients.cc.map((email) => (
																	<Badge
																		key={email}
																		variant="outline"
																		className="font-normal text-xs rounded-none"
																	>
																		{email}
																	</Badge>
																))}
															</div>
														</div>
													)}

													{data.recipients.bcc.length > 0 && (
														<div>
															<span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
															Bcc
															</span>
															<div className="flex flex-wrap gap-1.5">
																{data.recipients.bcc.map((email) => (
																	<Badge
																		key={email}
																		variant="outline"
																		className="font-normal text-xs italic rounded-none"
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
								<section className="bg-muted/30 rounded-none border p-4 space-y-4">
									<h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
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

									<div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
										<span>Last Updated</span>
										<span>{new Date(data.updatedAt).toLocaleString()}</span>
									</div>
								</section>

								{data.resendOfId && (
									<div className="bg-orange-50/50 border border-orange-100 rounded-none p-3 flex items-center gap-2 text-xs">
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
