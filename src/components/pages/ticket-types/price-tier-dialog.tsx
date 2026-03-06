"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, DollarSign, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
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
import type { TicketType } from "@/lib/api/ticket-type";
import {
	createTicketTypePriceTier,
	deleteTicketTypePriceTier,
	getTicketTypePriceTiers,
} from "@/lib/api/ticket-type-price-tier";

interface PriceTierDialogProps {
	ticketType: TicketType;
	eventId: string;
}

export function PriceTierDialog({ ticketType, eventId }: PriceTierDialogProps) {
	const queryClient = useQueryClient();
	const [isAdding, setIsAdding] = useState(false);
	const [formData, setFormData] = useState({
		label: "",
		price: "",
		starts_at: undefined as Date | undefined,
		ends_at: undefined as Date | undefined,
	});

	// Fetch price tiers
	const {
		data: priceTiers = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["ticket-type-price-tiers", ticketType.id],
		queryFn: () => getTicketTypePriceTiers(ticketType.id),
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: createTicketTypePriceTier,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["ticket-type-price-tiers", ticketType.id],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "ticket-types"],
			});
			toast.success("Price tier created successfully");
			setIsAdding(false);
			setFormData({
				label: "",
				price: "",
				starts_at: undefined,
				ends_at: undefined,
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create price tier");
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: deleteTicketTypePriceTier,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["ticket-type-price-tiers", ticketType.id],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "ticket-types"],
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

		if (!formData.starts_at) {
			toast.error("Please select a start date");
			return;
		}

		if (!formData.ends_at) {
			toast.error("Please select an end date");
			return;
		}

		createMutation.mutate({
			ticketTypeId: ticketType.id,
			label: formData.label,
			price,
			starts_at: formData.starts_at.toISOString(),
			ends_at: formData.ends_at.toISOString(),
		});
	};

	const handleDelete = (priceTierId: number) => {
		if (window.confirm("Are you sure you want to delete this price tier?")) {
			deleteMutation.mutate({
				ticketTypeId: ticketType.id,
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

	// Sort tiers by start date
	const sortedTiers = [...priceTiers].sort(
		(a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
	);

	return (
		<div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
			{/* Ticket Type Info */}
			<div className="rounded-none border bg-muted/50 p-4">
				<h4 className="mb-2 font-medium">{ticketType.name}</h4>
				<div className="flex items-center gap-4 text-muted-foreground text-sm">
					<span>Base Price: RM {ticketType.price.toFixed(2)}</span>
					<Badge
						variant="outline"
						className="rounded-none font-bold capitalize"
					>
						{ticketType.status}
					</Badge>
				</div>
			</div>

			{/* Price Tiers List */}
			{isLoading ? (
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
				<div className="overflow-hidden rounded-none border">
					<div className="w-full overflow-x-auto">
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
										<TableCell className="min-w-[220px] max-w-[300px] align-top">
											<div className="flex items-start gap-2">
												<span
													className="whitespace-normal break-words font-medium"
													title={tier.label}
												>
													{tier.label}
												</span>
												{tier.active && (
													<Badge
														variant="default"
														className="shrink-0 rounded-none"
													>
														Active
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell className="min-w-[120px] font-medium">
											RM {tier.price.toFixed(2)}
										</TableCell>
										<TableCell className="min-w-[140px]">
											<div className="text-sm">
												{format(new Date(tier.startsAt), "MMM d, yyyy")}
												<div className="text-muted-foreground text-xs">
													{format(new Date(tier.startsAt), "h:mm a")}
												</div>
											</div>
										</TableCell>
										<TableCell className="min-w-[140px]">
											<div className="text-sm">
												{format(new Date(tier.endsAt), "MMM d, yyyy")}
												<div className="text-muted-foreground text-xs">
													{format(new Date(tier.endsAt), "h:mm a")}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(tier.id)}
												disabled={deleteMutation.isPending}
												className="h-8 w-8 rounded-none p-0 text-destructive hover:text-destructive"
											>
												<Trash2 className="h-4 w-4" />
												<span className="sr-only">Delete</span>
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
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
								date={formData.starts_at}
								onDateChange={(date) =>
									setFormData({ ...formData, starts_at: date })
								}
								placeholder="Select start date"
							/>
						</div>

						<div className="space-y-2">
							<Label>End Date</Label>
							<DateTimePicker
								date={formData.ends_at}
								onDateChange={(date) =>
									setFormData({ ...formData, ends_at: date })
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
									starts_at: undefined,
									ends_at: undefined,
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
