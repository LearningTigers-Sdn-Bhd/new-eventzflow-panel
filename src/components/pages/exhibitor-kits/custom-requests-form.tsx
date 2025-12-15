"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Plus, Send, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { updateExhibitorKit } from "@/lib/api/exhibitor-kit";
import type { CustomRequestInput } from "@/lib/api/exhibitor-kit/request";
import type { CustomRequest } from "@/lib/api/exhibitor-kit/response";
import { cn } from "@/lib/utils";

interface CustomRequestsFormProps {
	eventId: number;
	exhibitorKitId: number;
	existingRequests: CustomRequest[];
}

interface NewRequest {
	description: string;
	quantity: string;
}

const statusConfig = {
	pending: { label: "Pending", icon: Clock, variant: "secondary" as const },
	approved: {
		label: "Approved",
		icon: CheckCircle2,
		variant: "default" as const,
	},
	rejected: {
		label: "Rejected",
		icon: XCircle,
		variant: "destructive" as const,
	},
};

const statusTheme = {
	pending: {
		border: "border-l-primary/50",
		accent: "text-primary",
	},
	approved: {
		border: "border-l-emerald-500/50",
		accent: "text-emerald-600",
	},
	rejected: {
		border: "border-l-red-500/50",
		accent: "text-red-600",
	},
};

function formatCurrencyMYR(value: number): string {
	return new Intl.NumberFormat("en-MY", {
		style: "currency",
		currency: "MYR",
	}).format(value);
}

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("en-MY", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
}

export function CustomRequestsForm({
	eventId,
	exhibitorKitId,
	existingRequests,
}: CustomRequestsFormProps) {
	const queryClient = useQueryClient();
	const { openConfirm, closeDialog } = useConfirmDialog();
	const [newRequests, setNewRequests] = useState<NewRequest[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const submitMutation = useMutation({
		mutationFn: async (requests: CustomRequestInput[]) => {
			return updateExhibitorKit(eventId, exhibitorKitId, {
				custom_requests_attributes: requests,
			});
		},
		onSuccess: () => {
			toast.success("Custom requests submitted successfully");
			setNewRequests([]);
			queryClient.invalidateQueries({ queryKey: ["exhibitor-kit", eventId] });
			queryClient.invalidateQueries({
				queryKey: ["events", eventId, "vendors"],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to submit custom requests");
		},
		onSettled: () => {
			setIsSubmitting(false);
		},
	});

	const addNewRequest = () => {
		setNewRequests([...newRequests, { description: "", quantity: "1" }]);
	};

	const updateNewRequest = (
		index: number,
		field: keyof NewRequest,
		value: string | number,
	) => {
		const updated = [...newRequests];
		updated[index] = { ...updated[index], [field]: value };
		setNewRequests(updated);
	};

	const removeNewRequest = (index: number) => {
		setNewRequests(newRequests.filter((_, i) => i !== index));
	};

	const validNewRequests = newRequests.filter((r) => r.description.trim());

	const handleSubmit = () => {
		if (validNewRequests.length === 0) {
			toast.error("Please add at least one request with a description");
			return;
		}

		// Validate quantities
		for (const r of validNewRequests) {
			const qty = Number.parseInt(r.quantity, 10);
			if (Number.isNaN(qty) || qty < 1) {
				toast.error("Quantity must be at least 1");
				return;
			}
		}

		setIsSubmitting(true);
		submitMutation.mutate(
			validNewRequests.map((r) => ({
				description: r.description,
				quantity: Math.max(1, Number.parseInt(r.quantity, 10) || 1),
				status: "pending" as const,
			})),
		);
	};

	const handleDeleteRequest = (requestId: number, description: string) => {
		openConfirm({
			title: "Delete Request",
			message: `Are you sure you want to delete this request? "${description.length > 50 ? `${description.slice(0, 50)}...` : description}"`,
			confirmLabel: "Delete",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			size: "sm",
			onConfirm: () => {
				setIsSubmitting(true);
				submitMutation.mutate([{ id: requestId, _destroy: true }]);
				closeDialog();
			},
		});
	};

	const pendingRequests = existingRequests.filter(
		(r) => r.status === "pending",
	);
	const processedRequests = existingRequests.filter(
		(r) => r.status !== "pending",
	);

	return (
		<Card className="rounded-none">
			<CardHeader className="border-b">
				<div className="flex items-center gap-2">
					<CardTitle className="text-base">Custom Requests</CardTitle>
					{existingRequests.length > 0 && (
						<Badge variant="outline" className="rounded-none">
							{existingRequests.length} submitted
						</Badge>
					)}
					{newRequests.length > 0 && (
						<Badge variant="outline" className="rounded-none">
							{validNewRequests.length}/{newRequests.length} ready
						</Badge>
					)}
				</div>
				<CardDescription>
					Need something not in the catalog? Add a request and we’ll reply with
					availability and pricing.
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-6">
				{existingRequests.length > 0 && (
					<div className="space-y-6">
						{pendingRequests.length > 0 && (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<p className="font-semibold text-sm">Pending</p>
										<Badge variant="secondary" className="rounded-none">
											{pendingRequests.length}
										</Badge>
									</div>
									<p className="text-muted-foreground text-xs">
										You can remove requests until they’re reviewed.
									</p>
								</div>

								<div className="grid gap-3 md:grid-cols-2">
									{pendingRequests.map((request) => {
										const config = statusConfig[request.status];
										const theme = statusTheme[request.status];
										const StatusIcon = config.icon;
										const unitPrice = request.resolved_price ?? null;
										const total =
											unitPrice !== null ? unitPrice * request.quantity : null;
										const submittedAt = request.created_at
											? formatDate(request.created_at)
											: "";

										return (
											<div
												key={request.id}
												className={cn(
													"flex flex-col rounded-none border border-border border-l-4 bg-background p-4 transition-colors hover:bg-muted/30",
													theme.border,
												)}
											>
												<div className="flex items-start justify-between gap-2">
													<div className="flex flex-wrap items-center gap-2">
														<Badge
															variant={config.variant}
															className="gap-1 rounded-none"
														>
															<StatusIcon className="h-3 w-3" />
															{config.label}
														</Badge>
														<Badge variant="outline" className="rounded-none">
															Quantity: {request.quantity}
														</Badge>
													</div>
													<Button
														variant="ghost"
														size="icon"
														className="-mt-1 -mr-2 shrink-0"
														onClick={() =>
															handleDeleteRequest(
																request.id,
																request.description,
															)
														}
														disabled={isSubmitting}
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												</div>

												<p className="mt-2 line-clamp-3 border border-primary/30 bg-muted p-2 leading-snug">
													{request.description}
												</p>

												<div className="mt-auto flex items-end justify-between gap-2 pt-3">
													{submittedAt && (
														<p className="text-muted-foreground text-xs">
															Submitted {submittedAt}
														</p>
													)}
													{total !== null && (
														<div className="ml-auto text-right">
															<p className={cn("font-semibold", theme.accent)}>
																{formatCurrencyMYR(total)}
															</p>
															<p className="text-muted-foreground text-xs">
																{formatCurrencyMYR(unitPrice!)} / unit
															</p>
														</div>
													)}
												</div>

												{request.response_notes && (
													<div className="mt-3 rounded-none border bg-background/60 p-3">
														<p className="font-medium text-muted-foreground text-xs">
															Response
														</p>
														<p className="mt-1 line-clamp-2 text-sm">
															{request.response_notes}
														</p>
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						)}

						{pendingRequests.length > 0 && processedRequests.length > 0 && (
							<Separator />
						)}

						{processedRequests.length > 0 && (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<p className="font-semibold text-sm">Reviewed</p>
										<Badge variant="outline" className="rounded-none">
											{processedRequests.length}
										</Badge>
									</div>
									<p className="text-muted-foreground text-xs">
										Approved requests show the final pricing.
									</p>
								</div>

								<div className="grid gap-3 md:grid-cols-2">
									{processedRequests.map((request) => {
										const config = statusConfig[request.status];
										const theme = statusTheme[request.status];
										const StatusIcon = config.icon;
										const unitPrice = request.resolved_price ?? null;
										const total =
											unitPrice !== null ? unitPrice * request.quantity : null;
										const submittedAt = request.created_at
											? formatDate(request.created_at)
											: "";

										return (
											<div
												key={request.id}
												className={cn(
													"flex flex-col rounded-none border border-border border-l-4 bg-background p-4",
													theme.border,
												)}
											>
												<div className="flex flex-wrap items-center gap-2">
													<Badge
														variant={config.variant}
														className="gap-1 rounded-none"
													>
														<StatusIcon className="h-3 w-3" />
														{config.label}
													</Badge>
													<Badge variant="outline" className="rounded-none">
														Qty: {request.quantity}
													</Badge>
												</div>

												<p className="mt-2 line-clamp-3 font-medium leading-snug">
													{request.description}
												</p>

												<div className="mt-auto flex items-end justify-between gap-2 pt-3">
													{submittedAt && (
														<p className="text-muted-foreground text-xs">
															Submitted {submittedAt}
														</p>
													)}
													{total !== null && (
														<div className="ml-auto text-right">
															<p className={cn("font-semibold", theme.accent)}>
																{formatCurrencyMYR(total)}
															</p>
															<p className="text-muted-foreground text-xs">
																{formatCurrencyMYR(unitPrice!)} / unit
															</p>
														</div>
													)}
												</div>

												{request.response_notes && (
													<div className="mt-3 rounded-none border bg-background/60 p-3">
														<p className="font-medium text-muted-foreground text-xs">
															Response
														</p>
														<p className="mt-1 line-clamp-2 text-sm">
															{request.response_notes}
														</p>
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						)}
					</div>
				)}

				{existingRequests.length > 0 && <Separator />}

				<div className="space-y-4">
					<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
						<div>
							<p className="font-medium text-sm">Add New Request</p>
							<p className="text-muted-foreground text-xs">
								Only requests with a description will be submitted.
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="rounded-none">
								Ready: {validNewRequests.length}
							</Badge>
							<Button
								variant="outline"
								size="sm"
								onClick={addNewRequest}
								className="gap-2 rounded-none"
							>
								<Plus className="h-4 w-4" />
								Add Request
							</Button>
						</div>
					</div>

					{newRequests.length === 0 ? (
						<div className="rounded-none border border-dashed bg-muted/20 px-4 py-8 text-center">
							<p className="text-muted-foreground text-sm">No new requests.</p>
						</div>
					) : (
						<div className="grid gap-3">
							{newRequests.map((request, index) => (
								<div
									key={index}
									className="rounded-none border bg-background p-4"
								>
									<div className="flex items-center justify-between gap-2">
										<div className="flex items-center gap-2">
											<p className="font-semibold text-sm">
												Request #{index + 1}
											</p>
											{!request.description.trim() && (
												<Badge
													variant="outline"
													className="rounded-none text-muted-foreground"
												>
													Missing description
												</Badge>
											)}
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => removeNewRequest(index)}
											aria-label={`Remove request ${index + 1}`}
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									</div>

									<div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_180px] md:items-stretch md:gap-6">
										<div className="space-y-2">
											<Label htmlFor={`custom-request-description-${index}`}>
												Description
											</Label>
											<Textarea
												id={`custom-request-description-${index}`}
												placeholder="Describe what you need..."
												value={request.description}
												onChange={(e) =>
													updateNewRequest(index, "description", e.target.value)
												}
												className={cn(
													"min-h-[90px] rounded-none",
													!request.description.trim() &&
														"border-primary/50 focus-visible:ring-primary/20",
												)}
											/>
											<p className="text-muted-foreground text-xs">
												Include size, color, material, and any deadlines.
											</p>
										</div>

										<div className="flex h-full flex-col justify-between gap-3 rounded-none border bg-muted/10 p-3">
											<div className="space-y-2">
												<Label htmlFor={`custom-request-qty-${index}`}>
													Quantity
												</Label>
												<Input
													id={`custom-request-qty-${index}`}
													type="number"
													min={1}
													value={request.quantity}
													onChange={(e) =>
														updateNewRequest(index, "quantity", e.target.value)
													}
													className="rounded-none bg-background"
													placeholder="Enter amount"
												/>
											</div>
											<p className="text-muted-foreground text-xs">Minimum 1</p>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</CardContent>

			<CardFooter className="justify-between gap-3 border-t">
				<p className="text-muted-foreground text-xs">
					We’ll review your request(s) and respond with pricing.
				</p>
				{newRequests.length > 0 && (
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting || validNewRequests.length === 0}
						className="gap-2 rounded-none"
					>
						<Send className="h-4 w-4" />
						{isSubmitting
							? "Submitting..."
							: `Submit ${validNewRequests.length} Request${validNewRequests.length === 1 ? "" : "s"}`}
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
