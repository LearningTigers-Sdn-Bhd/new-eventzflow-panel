"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CreditCard, Eye, EyeOff, Pencil, Shield, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	createEventPaymentGateway,
	deleteEventPaymentGateway,
	getEventPaymentGateway,
	updateEventPaymentGateway,
} from "@/lib/api/event/payment-gateway";
import { queryClient } from "@/utils/rest-api";

interface PaymentGatewayFormProps {
	eventId: number;
	onClose?: () => void;
}

export default function PaymentGatewayForm({
	eventId,
}: PaymentGatewayFormProps) {
	const [keyId, setKeyId] = useState("");
	const [keySecret, setKeySecret] = useState("");
	const [showSecret, setShowSecret] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const queryKey = ["event", eventId, "payment-gateway"];

	const {
		data: gatewayData,
		isLoading,
		error,
	} = useQuery({
		queryKey,
		queryFn: () => getEventPaymentGateway(eventId.toString()),
	});

	const hasCustomGateway = gatewayData?.payment_gateway_type === "custom";

	useEffect(() => {
		if (gatewayData?.data) {
			setKeyId(gatewayData.data.key_id);
		}
	}, [gatewayData]);

	const saveMutation = useMutation({
		mutationFn: () => {
			const data = {
				provider: "razorpay" as const,
				key_id: keyId,
				key_secret: keySecret,
			};

			if (hasCustomGateway) {
				return updateEventPaymentGateway(eventId.toString(), data);
			}
			return createEventPaymentGateway(eventId.toString(), data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			setIsEditing(false);
			setKeySecret("");
			setShowSecret(false);
			toast.success("Payment gateway saved successfully");
		},
		onError: (err: Error) => {
			toast.error(err.message || "Failed to save payment gateway");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteEventPaymentGateway(eventId.toString()),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			setKeyId("");
			setKeySecret("");
			setIsEditing(false);
			setShowSecret(false);
			toast.success("Custom gateway removed. Using default gateway.");
		},
		onError: (err: Error) => {
			toast.error(err.message || "Failed to remove payment gateway");
		},
	});

	const handleEdit = () => {
		if (gatewayData?.data) {
			setKeyId(gatewayData.data.key_id);
		}
		setKeySecret("");
		setShowSecret(false);
		setIsEditing(true);
	};

	const handleCancel = () => {
		setKeyId(gatewayData?.data?.key_id || "");
		setKeySecret("");
		setShowSecret(false);
		setIsEditing(false);
	};

	if (isLoading) {
		return (
			<LoadingState
				title="Loading payment gateway..."
				description="Please wait while we fetch payment gateway settings."
			/>
		);
	}

	if (error) {
		return (
			<div className="text-destructive">
				Failed to load payment gateway settings. Please try again.
			</div>
		);
	}

	return (
		<section className="h-full w-full px-0 pb-8 md:px-6">
			<FormGroupContainer
				title={{
					icon: CreditCard,
					label: "Payment Gateway",
					description:
						"Configure a custom Razorpay payment gateway for this event. If not configured, the system default gateway will be used.",
				}}
				actions={
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">Status:</span>
						<Badge variant={hasCustomGateway ? "default" : "secondary"} className="rounded-none">
							{hasCustomGateway ? "Custom Gateway" : "Default Gateway"}
						</Badge>
					</div>
				}
			>
				<div className="flex flex-col gap-6">
					{/* Default state - no custom gateway, not editing */}
					{!hasCustomGateway && !isEditing && (
						<div className="space-y-4">
							<div className="flex items-start gap-3 rounded-none border p-4 bg-muted/50">
								<Shield className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
								<div className="space-y-1">
									<p className="text-sm font-medium">Using Default Payment Gateway</p>
									<p className="text-sm text-muted-foreground">
										This event uses the system default Razorpay payment gateway.
										Configure a custom gateway if this event requires a different
										Razorpay account.
									</p>
								</div>
							</div>
							<Button
								className="rounded-none"
								onClick={() => setIsEditing(true)}
							>
								Configure Custom Gateway
							</Button>
						</div>
					)}

					{/* Custom gateway view - not editing */}
					{hasCustomGateway && !isEditing && (
						<div className="space-y-5">
							{/* Credentials display - horizontal row */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-none border p-4">
								<div className="space-y-1.5">
									<Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Provider
									</Label>
									<p className="text-sm font-semibold capitalize">
										{gatewayData?.data?.provider}
									</p>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Key ID
									</Label>
									<p className="text-sm font-semibold font-mono">
										{gatewayData?.data?.key_id}
									</p>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Key Secret
									</Label>
									<p className="text-sm font-semibold">
										{gatewayData?.data?.has_key_secret
											? "Configured (encrypted)"
											: "Not configured"}
									</p>
								</div>
							</div>

							{/* Action buttons at bottom right */}
							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									size="sm"
									className="rounded-none"
									onClick={handleEdit}
								>
									<Pencil className="mr-2 h-3.5 w-3.5" />
									Update Credentials
								</Button>
								<Button
									variant="destructive"
									size="sm"
									className="rounded-none"
									onClick={() => deleteMutation.mutate()}
									disabled={deleteMutation.isPending}
								>
									<Trash2 className="mr-2 h-3.5 w-3.5" />
									Remove
								</Button>
							</div>
						</div>
					)}

					{/* Edit form */}
					{isEditing && (
						<div className="space-y-4">
							<div className="grid gap-4">
								<div className="space-y-2">
									<Label htmlFor="key_id">Razorpay Key ID</Label>
									<Input
										id="key_id"
										className="rounded-none"
										placeholder="rzp_live_xxxxxxxxxxxxxxx"
										value={keyId}
										onChange={(e) => setKeyId(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="key_secret">
										Razorpay Key Secret
										{hasCustomGateway && (
											<span className="text-muted-foreground font-normal ml-2">
												(leave blank to keep existing)
											</span>
										)}
									</Label>
									<div className="relative">
										<Input
											id="key_secret"
											type={showSecret ? "text" : "password"}
											className="rounded-none pr-10"
											placeholder="Enter key secret"
											value={keySecret}
											onChange={(e) => setKeySecret(e.target.value)}
										/>
										<button
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
											onClick={() => setShowSecret(!showSecret)}
											tabIndex={-1}
										>
											{showSecret ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>
							</div>
							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									className="rounded-none"
									onClick={handleCancel}
								>
									Cancel
								</Button>
								<Button
									className="rounded-none"
									onClick={() => saveMutation.mutate()}
									disabled={
										saveMutation.isPending ||
										!keyId ||
										(!hasCustomGateway && !keySecret)
									}
								>
									{saveMutation.isPending ? "Saving..." : "Save Gateway"}
								</Button>
							</div>
						</div>
					)}
				</div>
			</FormGroupContainer>
		</section>
	);
}
