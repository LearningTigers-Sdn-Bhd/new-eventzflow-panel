"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Loader2, Package, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFullScreenDialogOpen } from "@/hooks/use-full-screen-dialog-open";
import { getExhibitorBoothPrices } from "@/lib/api/exhibitor-booth-price";
import {
	createExhibitorPackage,
	deleteExhibitorPackage,
	type ExhibitorPackage,
	getExhibitorPackages,
	updateExhibitorPackage,
} from "@/lib/api/exhibitor-package";

interface PackageDialogProps {
	eventId: number;
	trigger?: React.ReactNode;
}

type FormState = {
	exhibitorBoothPriceId: string;
	name: string;
	inclusions: string;
	price: string;
	quota: string;
};

const DEFAULT_FORM: FormState = {
	exhibitorBoothPriceId: "",
	name: "",
	inclusions: "",
	price: "",
	quota: "",
};

export function PackageDialog({ eventId, trigger }: PackageDialogProps) {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useFullScreenDialogOpen(
		`package-dialog-${eventId}`,
	);
	const [editingItem, setEditingItem] = React.useState<ExhibitorPackage | null>(
		null,
	);
	const [form, setForm] = React.useState<FormState>(DEFAULT_FORM);

	const { data: packages = [], isLoading } = useQuery({
		queryKey: ["exhibitor-packages", eventId],
		queryFn: () => getExhibitorPackages(eventId),
		enabled: isOpen,
	});

	const { data: boothPrices = [] } = useQuery({
		queryKey: ["exhibitor-booth-prices", eventId],
		queryFn: () => getExhibitorBoothPrices(eventId),
		enabled: isOpen,
	});

	const resetForm = () => {
		setForm(DEFAULT_FORM);
		setEditingItem(null);
	};

	const invalidatePackages = () =>
		queryClient.invalidateQueries({
			queryKey: ["exhibitor-packages", eventId],
		});

	const createMutation = useMutation({
		mutationFn: createExhibitorPackage,
		onSuccess: () => {
			invalidatePackages();
			toast.success("Package added");
			resetForm();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to add package");
		},
	});

	const updateMutation = useMutation({
		mutationFn: updateExhibitorPackage,
		onSuccess: () => {
			invalidatePackages();
			toast.success("Package updated");
			resetForm();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update package");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteExhibitorPackage,
		onSuccess: () => {
			invalidatePackages();
			toast.success("Package removed");
		},
		onError: () => {
			toast.error("Cannot delete a package that already has bookings");
		},
	});

	const isSaving = createMutation.isPending || updateMutation.isPending;

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!form.exhibitorBoothPriceId) {
			toast.error("Please select a booth price");
			return;
		}

		if (!form.name.trim()) {
			toast.error("Please enter a package name");
			return;
		}

		const parsedPrice = Number(form.price);
		if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
			toast.error("Price must be a valid value greater than or equal to 0");
			return;
		}

		const normalizedQuota = form.quota.trim();
		const parsedQuota = normalizedQuota === "" ? null : Number(normalizedQuota);
		if (
			parsedQuota !== null &&
			(Number.isNaN(parsedQuota) ||
				parsedQuota < 0 ||
				!Number.isInteger(parsedQuota))
		) {
			toast.error("Quota must be a whole number greater than or equal to 0");
			return;
		}

		const payload = {
			exhibitor_booth_price_id: Number(form.exhibitorBoothPriceId),
			name: form.name.trim(),
			inclusions: form.inclusions.trim() || null,
			price: parsedPrice,
			quota: parsedQuota,
		};

		if (editingItem) {
			updateMutation.mutate({ id: editingItem.id, ...payload });
			return;
		}

		createMutation.mutate({ event_id: eventId, ...payload });
	};

	const onStartEdit = (item: ExhibitorPackage) => {
		setEditingItem(item);
		setForm({
			exhibitorBoothPriceId: String(item.exhibitorBoothPriceId),
			name: item.name,
			inclusions: item.inclusions ?? "",
			price: item.price.toString(),
			quota: item.quota === null ? "" : String(item.quota),
		});
	};

	const onCancelEdit = () => {
		setEditingItem(null);
		setForm(DEFAULT_FORM);
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				if (!open) resetForm();
			}}
		>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" className="w-full rounded-none sm:w-auto">
						<Package className="mr-2 h-4 w-4" />
						Packages
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="!max-w-none sm:!max-w-none !w-screen !h-[100dvh] !rounded-none !border-0 !p-0 !gap-0 flex flex-col bg-background shadow-none duration-200">
				<div className="flex-none border-b px-6 py-4">
					<DialogHeader className="sm:text-left">
						<DialogTitle>Manage Exhibitor Packages</DialogTitle>
						<DialogDescription>
							A package is an all-in price for one booth type. The package price
							replaces the booth price — it is not added to it.
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
					<div className="w-full flex-none overflow-y-auto border-r p-6 lg:w-[420px]">
						<form onSubmit={onSubmit} className="space-y-6">
							<div>
								<h3 className="mb-4 font-semibold text-base">
									{editingItem ? "Edit Package" : "Add New Package"}
								</h3>
								<div className="flex flex-col gap-4">
									<div className="space-y-2">
										<Label htmlFor="package-booth-price">Booth Price</Label>
										<Select
											value={form.exhibitorBoothPriceId}
											onValueChange={(value) =>
												setForm((prev) => ({
													...prev,
													exhibitorBoothPriceId: value,
												}))
											}
										>
											<SelectTrigger
												id="package-booth-price"
												className="h-9 w-full rounded-none"
											>
												<SelectValue placeholder="Select a booth price" />
											</SelectTrigger>
											<SelectContent className="rounded-none">
												{boothPrices.map((price) => (
													<SelectItem key={price.id} value={String(price.id)}>
														{price.label}
														{price.zone ? ` (${price.zone})` : ""}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="package-name">Package Name</Label>
										<Input
											id="package-name"
											placeholder="Package A | Standard Booth"
											value={form.name}
											onChange={(e) =>
												setForm((prev) => ({ ...prev, name: e.target.value }))
											}
											required
											className="h-9 rounded-none"
										/>
									</div>

									<div className="space-y-2">
										<div className="space-y-1">
											<Label htmlFor="package-price">Price (RM)</Label>
											<p className="text-muted-foreground text-xs">
												Absolute price for this package — replaces the booth
												price, is never added to it.
											</p>
										</div>
										<Input
											id="package-price"
											type="number"
											step="0.01"
											min="0"
											placeholder="0.00"
											value={form.price}
											onChange={(e) =>
												setForm((prev) => ({ ...prev, price: e.target.value }))
											}
											required
											className="h-9 rounded-none"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="package-quota">Quota</Label>
										<Input
											id="package-quota"
											type="number"
											step="1"
											min="0"
											placeholder="Unlimited"
											value={form.quota}
											onChange={(e) =>
												setForm((prev) => ({ ...prev, quota: e.target.value }))
											}
											className="h-9 rounded-none"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="package-inclusions">Inclusions</Label>
										<Textarea
											id="package-inclusions"
											rows={5}
											placeholder={
												"6 Days / 5 Nights Twin-Sharing Accommodation\n3 Days Hosted Lunch & Dinner for 2 Delegates"
											}
											value={form.inclusions}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													inclusions: e.target.value,
												}))
											}
											className="rounded-none"
										/>
									</div>

									<div className="flex flex-col gap-3 pt-2 sm:flex-row">
										{editingItem && (
											<Button
												type="button"
												variant="outline"
												className="w-full rounded-none sm:w-auto"
												onClick={onCancelEdit}
											>
												Cancel Edit
											</Button>
										)}
										<Button
											type="submit"
											className="w-full flex-1 rounded-none sm:w-auto"
											disabled={isSaving}
										>
											{isSaving && (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											)}
											{editingItem ? "Update Package" : "Add Package"}
										</Button>
									</div>
								</div>
							</div>
						</form>
					</div>

					<div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-muted/10 p-6 lg:p-8">
						<div className="rounded-none border bg-background shadow-sm">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Package</TableHead>
										<TableHead>Booth Price</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Quota</TableHead>
										<TableHead className="w-[100px]">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableRow>
											<TableCell colSpan={5} className="py-8 text-center">
												<Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
											</TableCell>
										</TableRow>
									) : packages.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={5}
												className="py-8 text-center text-muted-foreground"
											>
												No packages configured yet.
											</TableCell>
										</TableRow>
									) : (
										packages.map((item) => (
											<TableRow key={item.id}>
												<TableCell className="font-medium">
													{item.name}
												</TableCell>
												<TableCell>
													{item.boothPriceLabel ?? "—"}
													{item.boothPriceZone
														? ` (${item.boothPriceZone})`
														: ""}
												</TableCell>
												<TableCell>
													<div className="font-medium">
														RM {item.price.toFixed(2)}
													</div>
												</TableCell>
												<TableCell>
													{item.quota === null ? "Unlimited" : item.quota}
												</TableCell>
												<TableCell>
													<TooltipProvider>
														<div className="flex items-center gap-1">
															<Tooltip>
																<TooltipTrigger asChild>
																	<Button
																		type="button"
																		variant="ghost"
																		size="sm"
																		onClick={() => onStartEdit(item)}
																		className="h-8 w-8 rounded-none p-0"
																		aria-label={`Edit ${item.name}`}
																	>
																		<Edit2 className="h-4 w-4" />
																	</Button>
																</TooltipTrigger>
																<TooltipContent className="rounded-none">
																	Edit package
																</TooltipContent>
															</Tooltip>
															<Tooltip>
																<TooltipTrigger asChild>
																	<Button
																		type="button"
																		variant="ghost"
																		size="sm"
																		onClick={() =>
																			deleteMutation.mutate({ id: item.id })
																		}
																		disabled={deleteMutation.isPending}
																		className="h-8 w-8 rounded-none p-0 text-destructive hover:text-destructive"
																		aria-label={`Delete ${item.name}`}
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</TooltipTrigger>
																<TooltipContent className="rounded-none">
																	Delete package
																</TooltipContent>
															</Tooltip>
														</div>
													</TooltipProvider>
												</TableCell>
											</TableRow>
										))
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
