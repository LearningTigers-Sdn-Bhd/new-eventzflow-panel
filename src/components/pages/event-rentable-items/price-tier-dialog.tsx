"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Loader2, Plus, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventRentableItem } from "@/lib/api/event-rentable-item";
import {
	createPriceTier,
	deletePriceTier,
	type EventRentableItemPriceTier,
	getPriceTiers,
	updatePriceTier,
} from "@/lib/api/event-rentable-item-price";
import { PriceTierTable } from "./price-tier-table";

interface PriceTierDialogProps {
	eventRentableItem: EventRentableItem;
}

export function PriceTierDialog({ eventRentableItem }: PriceTierDialogProps) {
	const queryClient = useQueryClient();
	const [isAdding, setIsAdding] = useState(false);
	const [formData, setFormData] = useState({
		label: "",
		price: "",
		start_date: undefined as Date | undefined,
		end_date: undefined as Date | undefined,
	});

	// Fetch price tiers
	const {
		data: priceTiers = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["price-tiers", eventRentableItem.id],
		queryFn: () => getPriceTiers(eventRentableItem.id),
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: createPriceTier,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["price-tiers", eventRentableItem.id],
			});
			queryClient.invalidateQueries({
				queryKey: ["event-rentable-items"],
			});
			toast.success("Price tier created successfully");
			setIsAdding(false);
			setFormData({
				label: "",
				price: "",
				start_date: undefined,
				end_date: undefined,
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create price tier");
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: deletePriceTier,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["price-tiers", eventRentableItem.id],
			});
			queryClient.invalidateQueries({
				queryKey: ["event-rentable-items"],
			});
			toast.success("Price tier deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete price tier");
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
			event_rentable_item_id: eventRentableItem.id,
			label: formData.label,
			price,
			start_date: formData.start_date.toISOString(),
			end_date: formData.end_date?.toISOString(),
		});
	};

	const handleDelete = (priceTierId: number) => {
		if (window.confirm("Are you sure you want to delete this price tier?")) {
			deleteMutation.mutate({
				event_rentable_item_id: eventRentableItem.id,
				id: priceTierId,
			});
		}
	};

	if (error) {
		return (
			<div className="py-8 text-center">
				<p className="text-destructive text-sm">
					{(error as Error).message || "Failed to load price tiers"}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Item Info */}
			<div className="rounded-none border bg-muted/50 p-4">
				<h4 className="mb-2 font-medium">
					{eventRentableItem.rentableItem?.name}
				</h4>
				<div className="flex items-center gap-4 text-muted-foreground text-sm">
					<span>Unit: {eventRentableItem.rentableItem?.unitOfMeasure}</span>
					<span>
						Default Price: RM{" "}
						{eventRentableItem.rentableItem?.defaultPrice != null
							? Number(eventRentableItem.rentableItem.defaultPrice).toFixed(2)
							: "0.00"}
					</span>
				</div>
			</div>

			{/* Price Tiers List */}
			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<PriceTierTable
					priceTiers={priceTiers}
					onDelete={handleDelete}
					isDeleting={deleteMutation.isPending}
				/>
			)}

			{/* Add New Tier Form */}
			{isAdding ? (
				<form
					onSubmit={handleSubmit}
					className="space-y-4 rounded-none border p-4"
				>
					<h4 className="font-medium">Add New Price Tier</h4>

					<div className="space-y-2">
						<Label htmlFor="label">
							<Tag className="mr-1 inline h-3 w-3" />
							Label
						</Label>
						<Input
							id="label"
							placeholder="e.g., Early Bird, Standard, Late"
							value={formData.label}
							onChange={(e) =>
								setFormData({ ...formData, label: e.target.value })
							}
							required
							className="h-9 rounded-none"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="price">
							<DollarSign className="mr-1 inline h-3 w-3" />
							Price
						</Label>
						<Input
							id="price"
							type="number"
							step="0.01"
							min="0"
							placeholder="0.00"
							value={formData.price}
							onChange={(e) =>
								setFormData({ ...formData, price: e.target.value })
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
									setFormData({ ...formData, start_date: date })
								}
								placeholder="Select start date"
							/>
						</div>

						<div className="space-y-2">
							<Label>End Date (Optional)</Label>
							<DateTimePicker
								date={formData.end_date}
								onDateChange={(date) =>
									setFormData({ ...formData, end_date: date })
								}
								placeholder="Select end date"
							/>
						</div>
					</div>

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setIsAdding(false);
								setFormData({
									label: "",
									price: "",
									start_date: undefined,
									end_date: undefined,
								});
							}}
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
		</div>
	);
}
