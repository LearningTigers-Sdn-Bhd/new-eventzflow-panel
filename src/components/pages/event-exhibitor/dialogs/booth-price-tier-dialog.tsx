"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, DollarSign, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { ExhibitorBoothPrice } from "@/lib/api/exhibitor-booth-price";
import {
	createExhibitorBoothPriceTier,
	deleteExhibitorBoothPriceTier,
	type ExhibitorBoothPriceTier,
	getExhibitorBoothPriceTiers,
} from "@/lib/api/exhibitor-booth-price-tier";

interface BoothPriceTierDialogProps {
	boothPrice: ExhibitorBoothPrice;
	trigger: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultAdding?: boolean;
}

export function BoothPriceTierDialog({
	boothPrice,
	trigger,
	open: controlledOpen,
	onOpenChange: onControlledOpenChange,
	defaultAdding = false,
}: BoothPriceTierDialogProps) {
	const queryClient = useQueryClient();
	const [internalOpen, setInternalOpen] = useState(false);
	const [isAdding, setIsAdding] = useState(defaultAdding);
	const [formData, setFormData] = useState({
		label: "",
		price: "",
		start_date: undefined as Date | undefined,
		end_date: undefined as Date | undefined,
	});
	const isControlled = controlledOpen !== undefined;
	const isOpen = isControlled ? controlledOpen : internalOpen;

	const setOpen = (open: boolean) => {
		if (!isControlled) {
			setInternalOpen(open);
		}
		onControlledOpenChange?.(open);
	};

	const queryKey = ["exhibitor-booth-price-tiers", boothPrice.id];

	const {
		data: priceTiers = [],
		isLoading,
		error,
	} = useQuery({
		queryKey,
		queryFn: () => getExhibitorBoothPriceTiers(boothPrice.id),
		enabled: isOpen,
	});

	const resetForm = () => {
		setIsAdding(defaultAdding);
		setFormData({
			label: "",
			price: "",
			start_date: undefined,
			end_date: undefined,
		});
	};

	const createMutation = useMutation({
		mutationFn: createExhibitorBoothPriceTier,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			queryClient.invalidateQueries({
				queryKey: ["exhibitor-booth-prices", boothPrice.eventId],
			});
			toast.success("Booth price tier created");
			resetForm();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create booth price tier");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteExhibitorBoothPriceTier,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			queryClient.invalidateQueries({
				queryKey: ["exhibitor-booth-prices", boothPrice.eventId],
			});
			toast.success("Booth price tier deleted");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete booth price tier");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const price = Number.parseFloat(formData.price);
		if (Number.isNaN(price) || price < 0) {
			toast.error("Please enter a valid price");
			return;
		}

		if (!formData.start_date) {
			toast.error("Please select a start date");
			return;
		}

		createMutation.mutate({
			exhibitor_booth_price_id: boothPrice.id,
			label: formData.label,
			price,
			start_date: formData.start_date.toISOString(),
			end_date: formData.end_date?.toISOString(),
		});
	};

	const handleDelete = (tier: ExhibitorBoothPriceTier) => {
		if (window.confirm(`Delete price tier '${tier.label}'?`)) {
			deleteMutation.mutate({
				exhibitor_booth_price_id: boothPrice.id,
				id: tier.id,
			});
		}
	};

	const sortedTiers = [...priceTiers].sort(
		(a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
	);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				setOpen(open);
				if (!open) resetForm();
				if (open && defaultAdding) setIsAdding(true);
			}}
		>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto rounded-none sm:max-w-[760px]">
				<DialogHeader>
					<DialogTitle>Manage Booth Price Tiers</DialogTitle>
					<DialogDescription>
						{boothPrice.label} - base rate RM {boothPrice.price.toFixed(2)}
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-none border bg-muted/40 p-4 text-sm">
					<div className="flex flex-wrap items-center gap-2">
						<span className="font-medium">
							Current rate: RM {boothPrice.currentPrice.toFixed(2)}
						</span>
						{boothPrice.activePriceTierLabel && (
							<Badge className="rounded-none">
								{boothPrice.activePriceTierLabel}
							</Badge>
						)}
					</div>
					<p className="mt-1 text-muted-foreground">
						Use tiers for promos like Early Bird while keeping the base rate as
						fallback.
					</p>
				</div>

				{error ? (
					<div className="py-8 text-center text-destructive text-sm">
						{(error as Error).message || "Failed to load booth price tiers"}
					</div>
				) : isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : sortedTiers.length === 0 ? (
					<div className="rounded-none border p-8 text-center">
						<Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
						<p className="text-muted-foreground text-sm">
							No price tiers configured yet. Add your first tier to get started.
						</p>
					</div>
				) : (
					<div className="rounded-none border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Label</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Start Date</TableHead>
									<TableHead>End Date</TableHead>
									<TableHead className="w-[70px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedTiers.map((tier) => (
									<TableRow key={tier.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												<span className="font-medium">{tier.label}</span>
												{tier.active && (
													<Badge className="rounded-none">Active</Badge>
												)}
											</div>
										</TableCell>
										<TableCell className="font-medium">
											RM {tier.price.toFixed(2)}
										</TableCell>
										<TableCell>
											<div className="text-sm">
												{format(new Date(tier.startDate), "MMM d, yyyy")}
												<div className="text-muted-foreground text-xs">
													{format(new Date(tier.startDate), "h:mm a")}
												</div>
											</div>
										</TableCell>
										<TableCell>
											{tier.endDate ? (
												<div className="text-sm">
													{format(new Date(tier.endDate), "MMM d, yyyy")}
													<div className="text-muted-foreground text-xs">
														{format(new Date(tier.endDate), "h:mm a")}
													</div>
												</div>
											) : (
												<span className="text-muted-foreground text-sm">
													No end date
												</span>
											)}
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(tier)}
												disabled={deleteMutation.isPending}
												className="h-8 w-8 rounded-none p-0 text-destructive hover:text-destructive"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}

				{isAdding ? (
					<form
						onSubmit={handleSubmit}
						className="space-y-4 rounded-none border p-4"
					>
						<h4 className="font-medium">Add New Price Tier</h4>

						<div className="space-y-2">
							<Label htmlFor={`tier-label-${boothPrice.id}`}>
								<Tag className="mr-1 inline h-3 w-3" />
								Label
							</Label>
							<Input
								id={`tier-label-${boothPrice.id}`}
								placeholder="e.g. Early Bird"
								value={formData.label}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, label: e.target.value }))
								}
								required
								className="h-9 rounded-none"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={`tier-price-${boothPrice.id}`}>
								<DollarSign className="mr-1 inline h-3 w-3" />
								Price
							</Label>
							<Input
								id={`tier-price-${boothPrice.id}`}
								type="number"
								step="0.01"
								min="0"
								placeholder="0.00"
								value={formData.price}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, price: e.target.value }))
								}
								required
								className="h-9 rounded-none"
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>Start Date</Label>
								<DateTimePicker
									date={formData.start_date}
									onDateChange={(date) =>
										setFormData((prev) => ({ ...prev, start_date: date }))
									}
									placeholder="Select start date"
								/>
							</div>

							<div className="space-y-2">
								<Label>End Date (Optional)</Label>
								<DateTimePicker
									date={formData.end_date}
									onDateChange={(date) =>
										setFormData((prev) => ({ ...prev, end_date: date }))
									}
									placeholder="Select end date"
								/>
							</div>
						</div>

						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={resetForm}
								className="rounded-none"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={createMutation.isPending}
								className="rounded-none"
							>
								{createMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									"Create Tier"
								)}
							</Button>
						</div>
					</form>
				) : (
					<Button
						onClick={() => setIsAdding(true)}
						variant="outline"
						className="w-full rounded-none"
					>
						<Plus className="mr-2 h-4 w-4" />
						Add Price Tier
					</Button>
				)}
			</DialogContent>
		</Dialog>
	);
}
