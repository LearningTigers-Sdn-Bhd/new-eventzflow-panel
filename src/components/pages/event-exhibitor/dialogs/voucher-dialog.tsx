"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, TicketPercent, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFullScreenDialogOpen } from "@/hooks/use-full-screen-dialog-open";
import { getExhibitorBoothPrices } from "@/lib/api/exhibitor-booth-price";
import { getExhibitorPackages } from "@/lib/api/exhibitor-package";
import {
	createExhibitorVoucher,
	deleteExhibitorVoucher,
	type ExhibitorVoucher,
	getExhibitorVouchers,
} from "@/lib/api/exhibitor-voucher";

interface VoucherDialogProps {
	eventId: number;
	trigger?: React.ReactNode;
}

type DiscountType = "percentage_off" | "fixed_amount_off" | "flat_price";

type FormState = {
	discountType: DiscountType;
	discountValue: string;
	exhibitorBoothPriceId: string;
	exhibitorPackageId: string;
};

const ANY_SCOPE = "any";
const DEFAULT_FORM: FormState = {
	discountType: "percentage_off",
	discountValue: "",
	exhibitorBoothPriceId: ANY_SCOPE,
	exhibitorPackageId: ANY_SCOPE,
};

function formatAmount(value: number) {
	return new Intl.NumberFormat("en-MY", {
		maximumFractionDigits: 2,
	}).format(value);
}

function formatDiscount(voucher: ExhibitorVoucher) {
	switch (voucher.discountType) {
		case "percentage_off":
			return `${formatAmount(voucher.discountValue)}% off`;
		case "fixed_amount_off":
			return `RM ${formatAmount(voucher.discountValue)} off`;
		case "flat_price":
			return `Flat RM ${formatAmount(voucher.discountValue)}`;
	}
}

function formatScope(voucher: ExhibitorVoucher) {
	if (voucher.packageName) {
		return voucher.boothPriceLabel
			? `${voucher.boothPriceLabel} / ${voucher.packageName}`
			: voucher.packageName;
	}

	return voucher.boothPriceLabel ?? "Any";
}

export function VoucherDialog({ eventId, trigger }: VoucherDialogProps) {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useFullScreenDialogOpen(
		`voucher-dialog-${eventId}`,
	);
	const [form, setForm] = React.useState<FormState>(DEFAULT_FORM);

	const {
		data: vouchers = [],
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ["exhibitor-vouchers", eventId],
		queryFn: () => getExhibitorVouchers(eventId),
		enabled: isOpen,
	});

	const { data: boothPrices = [] } = useQuery({
		queryKey: ["exhibitor-booth-prices", eventId],
		queryFn: () => getExhibitorBoothPrices(eventId),
		enabled: isOpen,
	});

	const { data: packages = [] } = useQuery({
		queryKey: ["exhibitor-packages", eventId],
		queryFn: () => getExhibitorPackages(eventId),
		enabled: isOpen,
	});

	const scopedPackages =
		form.exhibitorBoothPriceId === ANY_SCOPE
			? []
			: packages.filter(
					(item) =>
						item.exhibitorBoothPriceId === Number(form.exhibitorBoothPriceId),
				);

	const invalidateVouchers = () =>
		queryClient.invalidateQueries({
			queryKey: ["exhibitor-vouchers", eventId],
		});

	const createMutation = useMutation({
		mutationFn: createExhibitorVoucher,
		onSuccess: () => {
			invalidateVouchers();
			toast.success("Voucher created");
			setForm(DEFAULT_FORM);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create voucher");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteExhibitorVoucher,
		onSuccess: () => {
			invalidateVouchers();
			toast.success("Voucher deleted");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete voucher");
		},
	});

	const onSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		const discountValue = Number(form.discountValue);
		if (!Number.isFinite(discountValue) || discountValue <= 0) {
			toast.error("Discount value must be greater than 0");
			return;
		}

		if (form.discountType === "percentage_off" && discountValue > 100) {
			toast.error("Percentage discount cannot exceed 100");
			return;
		}

		createMutation.mutate({
			event_id: eventId,
			exhibitor_booth_price_id:
				form.exhibitorBoothPriceId === ANY_SCOPE
					? null
					: Number(form.exhibitorBoothPriceId),
			exhibitor_package_id:
				form.exhibitorPackageId === ANY_SCOPE
					? null
					: Number(form.exhibitorPackageId),
			discount_type: form.discountType,
			discount_value: discountValue,
		});
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				if (!open) setForm(DEFAULT_FORM);
			}}
		>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" className="w-full rounded-none sm:w-auto">
						<TicketPercent className="mr-2 h-4 w-4" />
						Vouchers
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="!max-w-none sm:!max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 !p-0 !gap-0 flex flex-col bg-background shadow-none duration-200">
				<div className="flex-none border-b px-6 py-4">
					<DialogHeader className="sm:text-left">
						<DialogTitle>Manage Exhibitor Vouchers</DialogTitle>
						<DialogDescription>
							Create discount codes and control which booth prices or packages
							can redeem them.
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="flex min-h-0 flex-1 flex-col lg:flex-row">
					<div className="flex-none border-b bg-muted/30 lg:w-[420px] lg:border-r lg:border-b-0">
						<form onSubmit={onSubmit} className="h-full overflow-y-auto">
							<div className="p-6">
								<div className="space-y-5">
									<div className="space-y-2">
										<Label htmlFor="voucher-discount-type">Discount Type</Label>
										<Select
											value={form.discountType}
											onValueChange={(value: DiscountType) =>
												setForm((previous) => ({
													...previous,
													discountType: value,
												}))
											}
										>
											<SelectTrigger
												id="voucher-discount-type"
												className="w-full rounded-none"
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent className="rounded-none">
												<SelectItem value="percentage_off">
													Percentage off
												</SelectItem>
												<SelectItem value="fixed_amount_off">
													Fixed amount off
												</SelectItem>
												<SelectItem value="flat_price">Flat price</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="voucher-discount-value">
											Discount Value
										</Label>
										<Input
											id="voucher-discount-value"
											type="number"
											min="0.01"
											max={
												form.discountType === "percentage_off"
													? "100"
													: undefined
											}
											step="0.01"
											value={form.discountValue}
											onChange={(event) =>
												setForm((previous) => ({
													...previous,
													discountValue: event.target.value,
												}))
											}
											placeholder={
												form.discountType === "percentage_off" ? "10" : "50.00"
											}
											required
											className="h-9 rounded-none"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="voucher-booth-price">Booth Price</Label>
										<Select
											value={form.exhibitorBoothPriceId}
											onValueChange={(value) =>
												setForm((previous) => ({
													...previous,
													exhibitorBoothPriceId: value,
													exhibitorPackageId: ANY_SCOPE,
												}))
											}
										>
											<SelectTrigger
												id="voucher-booth-price"
												className="w-full rounded-none"
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent className="rounded-none">
												<SelectItem value={ANY_SCOPE}>
													Any booth price
												</SelectItem>
												{boothPrices.map((boothPrice) => (
													<SelectItem
														key={boothPrice.id}
														value={String(boothPrice.id)}
													>
														{boothPrice.label}
														{boothPrice.zone ? ` (${boothPrice.zone})` : ""}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="voucher-package">Package</Label>
										<Select
											value={form.exhibitorPackageId}
											onValueChange={(value) =>
												setForm((previous) => ({
													...previous,
													exhibitorPackageId: value,
												}))
											}
											disabled={form.exhibitorBoothPriceId === ANY_SCOPE}
										>
											<SelectTrigger
												id="voucher-package"
												className="w-full rounded-none"
											>
												<SelectValue
													placeholder={
														form.exhibitorBoothPriceId === ANY_SCOPE
															? "Select a booth price first"
															: "Any package"
													}
												/>
											</SelectTrigger>
											<SelectContent className="rounded-none">
												<SelectItem value={ANY_SCOPE}>Any package</SelectItem>
												{scopedPackages.map((item) => (
													<SelectItem key={item.id} value={String(item.id)}>
														{item.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<Button
										type="submit"
										className="w-full rounded-none"
										disabled={createMutation.isPending}
									>
										{createMutation.isPending && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Create Voucher
									</Button>
								</div>
							</div>
						</form>
					</div>

					<div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-muted/10 p-6 lg:p-8">
						<div className="rounded-none border bg-background shadow-sm">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Code</TableHead>
										<TableHead>Discount</TableHead>
										<TableHead>Scope</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="w-[80px]">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableRow>
											<TableCell colSpan={5} className="py-8 text-center">
												<Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
											</TableCell>
										</TableRow>
									) : isError ? (
										<TableRow>
											<TableCell colSpan={5} className="py-8 text-center">
												<p className="text-muted-foreground">
													Failed to load vouchers.
												</p>
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="mt-3 rounded-none"
													onClick={() => refetch()}
												>
													Try again
												</Button>
											</TableCell>
										</TableRow>
									) : vouchers.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={5}
												className="py-8 text-center text-muted-foreground"
											>
												No vouchers configured yet.
											</TableCell>
										</TableRow>
									) : (
										vouchers.map((voucher) => {
											const isRedeemed = voucher.status === "redeemed";

											return (
												<TableRow key={voucher.id}>
													<TableCell className="font-medium font-mono">
														{voucher.code}
													</TableCell>
													<TableCell>{formatDiscount(voucher)}</TableCell>
													<TableCell>{formatScope(voucher)}</TableCell>
													<TableCell>
														<Badge
															variant={isRedeemed ? "secondary" : "default"}
															className="rounded-none capitalize"
														>
															{voucher.status}
														</Badge>
													</TableCell>
													<TableCell>
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<span className="inline-flex">
																		<Button
																			type="button"
																			variant="ghost"
																			size="sm"
																			onClick={() =>
																				deleteMutation.mutate({
																					id: voucher.id,
																				})
																			}
																			disabled={
																				isRedeemed || deleteMutation.isPending
																			}
																			className="h-8 w-8 rounded-none p-0 text-destructive hover:text-destructive"
																			aria-label={`Delete ${voucher.code}`}
																		>
																			<Trash2 className="h-4 w-4" />
																		</Button>
																	</span>
																</TooltipTrigger>
																<TooltipContent className="rounded-none">
																	{isRedeemed
																		? "Already redeemed"
																		: "Delete voucher"}
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													</TableCell>
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
