"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarRange, CheckCircle2, Edit2, Loader2, Tags, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
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
	createExhibitorBoothPrice,
	deleteExhibitorBoothPrice,
	type ExhibitorBoothPrice,
	getExhibitorBoothPrices,
	updateExhibitorBoothPrice,
} from "@/lib/api/exhibitor-booth-price";
import { getEventById } from "@/lib/api/event";
import { getExhibitorZones } from "@/lib/api/exhibitor-zone";
import { BoothPriceTierDialog } from "./booth-price-tier-dialog";

interface BoothPricingDialogProps {
	eventId: number;
	trigger?: React.ReactNode;
}

type FormState = {
	boothType: string;
	exhibitorZoneId: string;
	label: string;
	price: string;
	quota: string;
};

const DEFAULT_FORM: FormState = {
	boothType: "",
	exhibitorZoneId: "",
	label: "",
	price: "",
	quota: "",
};

const BOOTH_TYPE_OPTIONS: Array<{
	value: string;
	label: string;
}> = [
	{ value: "shell_scheme", label: "Shell Scheme" },
	{ value: "raw_space", label: "Raw Space" },
];

const BOOTH_TYPE_LABEL_MAP: Record<string, string> = {
	shell_scheme: "Shell Scheme",
	raw_space: "Raw Space",
};

export function BoothPricingDialog({
	eventId,
	trigger,
}: BoothPricingDialogProps) {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = React.useState(false);
	const [editingItem, setEditingItem] =
		React.useState<ExhibitorBoothPrice | null>(null);
	const [tierBoothPrice, setTierBoothPrice] =
		React.useState<ExhibitorBoothPrice | null>(null);
	const [recentlyCreatedBoothPrice, setRecentlyCreatedBoothPrice] =
		React.useState<ExhibitorBoothPrice | null>(null);
	const [form, setForm] = React.useState<FormState>(DEFAULT_FORM);

	const { data: boothPrices = [], isLoading } = useQuery({
		queryKey: ["exhibitor-booth-prices", eventId],
		queryFn: () => getExhibitorBoothPrices(eventId),
		enabled: isOpen,
	});

	const { data: event } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId.toString()),
		enabled: isOpen,
	});

	const { data: zones = [] } = useQuery({
		queryKey: ["exhibitor-zones", eventId],
		queryFn: () => getExhibitorZones(eventId),
		enabled: isOpen,
	});

	const zoneOptions = React.useMemo(
		() =>
			zones.map((zone) => ({
				id: zone.id,
				zone: zone.zone,
				quota: zone.quota,
			})),
		[zones],
	);
	const hasZoneOptions = zoneOptions.length > 0;

	const boothTypeOptions = React.useMemo(() => {
		const options = [...BOOTH_TYPE_OPTIONS];
		const customTypes = event?.booth_types || [];
		for (const type of customTypes) {
			if (!options.some((o) => o.value === type)) {
				options.push({
					value: type,
					label:
						BOOTH_TYPE_LABEL_MAP[type] ||
						type
							.split("_")
							.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
							.join(" "),
				});
			}
		}
		return options;
	}, [event?.booth_types]);

	const allocatedQuotaByZoneId = React.useMemo(() => {
		const quotaMap = new Map<number, number>();

		for (const boothPrice of boothPrices) {
			if (boothPrice.exhibitorZoneId === null || boothPrice.quota === null) {
				continue;
			}

			const current = quotaMap.get(boothPrice.exhibitorZoneId) ?? 0;
			quotaMap.set(boothPrice.exhibitorZoneId, current + boothPrice.quota);
		}

		return quotaMap;
	}, [boothPrices]);

	const selectedZoneOption = React.useMemo(
		() =>
			form.exhibitorZoneId
				? zoneOptions.find((zone) => String(zone.id) === form.exhibitorZoneId)
				: null,
		[zoneOptions, form.exhibitorZoneId],
	);

	const selectedZoneMetrics = React.useMemo(() => {
		if (!selectedZoneOption || selectedZoneOption.quota === null) {
			return null;
		}

		const totalAllocated = allocatedQuotaByZoneId.get(selectedZoneOption.id) ?? 0;
		const editingQuotaInZone =
			editingItem && editingItem.exhibitorZoneId === selectedZoneOption.id
				? editingItem.quota ?? 0
				: 0;
		const availableForSelection = Math.max(
			selectedZoneOption.quota - (totalAllocated - editingQuotaInZone),
			0,
		);

		return {
			totalQuota: selectedZoneOption.quota,
			totalAllocated,
			totalRemaining: Math.max(selectedZoneOption.quota - totalAllocated, 0),
			availableForSelection,
		};
	}, [allocatedQuotaByZoneId, editingItem, selectedZoneOption]);

	React.useEffect(() => {
		if (!editingItem && zoneOptions.length > 0 && !form.exhibitorZoneId) {
			setForm((prev) => ({
				...prev,
				exhibitorZoneId: zoneOptions[0] ? String(zoneOptions[0].id) : "",
			}));
		}
	}, [editingItem, zoneOptions, form.exhibitorZoneId]);

	const invalidateBoothPrices = () => {
		queryClient.invalidateQueries({
			queryKey: ["exhibitor-booth-prices", eventId],
		});
	};

	const createMutation = useMutation({
		mutationFn: createExhibitorBoothPrice,
		onSuccess: ({ boothPrice }) => {
			invalidateBoothPrices();
			toast.success("Booth price added");
			setRecentlyCreatedBoothPrice(boothPrice);
			setForm(DEFAULT_FORM);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to add booth price");
		},
	});

	const updateMutation = useMutation({
		mutationFn: updateExhibitorBoothPrice,
		onSuccess: () => {
			invalidateBoothPrices();
			toast.success("Booth price updated");
			setEditingItem(null);
			setForm(DEFAULT_FORM);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update booth price");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteExhibitorBoothPrice,
		onSuccess: () => {
			invalidateBoothPrices();
			toast.success("Booth price removed");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove booth price");
		},
	});

	const isSaving = createMutation.isPending || updateMutation.isPending;

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!form.boothType) {
			toast.error("Please select a booth type");
			return;
		}

		if (hasZoneOptions && !form.exhibitorZoneId) {
			toast.error("Please select a zone");
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
			(Number.isNaN(parsedQuota) || parsedQuota < 0 || !Number.isInteger(parsedQuota))
		) {
			toast.error("Quota must be a whole number greater than or equal to 0");
			return;
		}

		const parsedZoneId = form.exhibitorZoneId
			? Number(form.exhibitorZoneId)
			: null;

		if (
			parsedZoneId !== null &&
			(Number.isNaN(parsedZoneId) || parsedZoneId <= 0)
		) {
			toast.error("Selected zone is invalid");
			return;
		}

		if (
			selectedZoneMetrics &&
			parsedQuota !== null &&
			parsedQuota > selectedZoneMetrics.availableForSelection
		) {
			toast.error(
				`Quota exceeds remaining allocation for this zone. Available: ${selectedZoneMetrics.availableForSelection}`,
			);
			return;
		}

		if (editingItem) {
			updateMutation.mutate({
				id: editingItem.id,
				booth_type: form.boothType,
				exhibitor_zone_id: parsedZoneId,
				label: form.label.trim(),
				price: parsedPrice,
				quota: parsedQuota,
			});
			return;
		}

		createMutation.mutate({
			event_id: eventId,
			booth_type: form.boothType,
			exhibitor_zone_id: parsedZoneId,
			label: form.label.trim(),
			price: parsedPrice,
			quota: parsedQuota,
		});
	};

	const onStartEdit = (item: ExhibitorBoothPrice) => {
		setRecentlyCreatedBoothPrice(null);
		setEditingItem(item);
		setForm({
			boothType: item.boothType,
			exhibitorZoneId: item.exhibitorZoneId
				? String(item.exhibitorZoneId)
				: "",
			label: item.label,
			price: item.price.toString(),
			quota: item.quota === null ? "" : String(item.quota),
		});
	};

	const onCancelEdit = () => {
		setEditingItem(null);
		setForm(DEFAULT_FORM);
	};

	const formatBoothType = (boothType: string) => {
		return (
			BOOTH_TYPE_LABEL_MAP[boothType] ||
			boothType
				.split("_")
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join(" ")
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" className="w-full rounded-none sm:w-auto">
						<Tags className="mr-2 h-4 w-4" />
						Booth Prices
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="!max-w-none sm:!max-w-none !w-screen !h-[100dvh] shadow-none !rounded-none !border-0 !p-0 flex flex-col !gap-0 bg-background duration-200">
				<div className="flex-none border-b px-6 py-4">
					<DialogHeader className="sm:text-left">
						<DialogTitle>Manage Exhibitor Booth Prices</DialogTitle>
						<DialogDescription>
							Set booth types and rates used by exhibitor registration.
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
					<div className="w-full flex-none overflow-y-auto border-r p-6 lg:w-[420px]">
						<form onSubmit={onSubmit} className="space-y-6">
							<div>
								<h3 className="mb-4 text-base font-semibold">{editingItem ? "Edit Booth Price" : "Add New Booth Price"}</h3>
								<div className="flex flex-col gap-4">
						<div className="space-y-2">
							<Label htmlFor="booth-type">Booth Type</Label>
							<Select
								value={form.boothType}
								onValueChange={(value) =>
									setForm((prev) => ({
										...prev,
										boothType: value,
									}))
								}
							>
								<SelectTrigger
									id="booth-type"
									className="h-9 w-full rounded-none"
								>
									<SelectValue placeholder="Select booth type" />
								</SelectTrigger>
								<SelectContent className="rounded-none">
									{boothTypeOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{hasZoneOptions && (
							<div className="space-y-2">
								<Label htmlFor="booth-zone">Zone</Label>
								<Select
									value={form.exhibitorZoneId}
									onValueChange={(value) =>
										setForm((prev) => ({ ...prev, exhibitorZoneId: value }))
									}
								>
									<SelectTrigger
										id="booth-zone"
										className="h-9 w-full rounded-none"
									>
										<SelectValue placeholder="Select zone" />
									</SelectTrigger>
									<SelectContent className="rounded-none">
										{zoneOptions.map((zoneOption) => (
											<SelectItem key={zoneOption.id} value={String(zoneOption.id)}>
												{zoneOption.zone}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="booth-label">Label</Label>
							<Input
								id="booth-label"
								placeholder="e.g. Corner Booth (3m x 3m)"
								value={form.label}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, label: e.target.value }))
								}
								required
								className="h-9 rounded-none"
							/>
						</div>
						<div className="space-y-2">
							<div className="space-y-1">
								<Label htmlFor="booth-price">Base Rate (RM)</Label>
								<p className="text-muted-foreground text-xs">
									Used as the fallback price when no active tier is running.
								</p>
							</div>
							<Input
								id="booth-price"
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
							<Label htmlFor="booth-quota">Quota</Label>
							<Input
								id="booth-quota"
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
								</div>
							</div>

							{selectedZoneOption && selectedZoneMetrics && (
								<div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
									<p className="font-semibold">
										{selectedZoneOption.zone} quota
									</p>
									<p className="mt-1 font-medium">
										Total: {selectedZoneMetrics.totalQuota} | Allocated: {selectedZoneMetrics.totalAllocated} | Remaining: {selectedZoneMetrics.totalRemaining}
									</p>
									{editingItem && (
										<p className="mt-1">
											Available for this edit: {selectedZoneMetrics.availableForSelection}
										</p>
									)}
								</div>
							)}

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
								<Button type="submit" className="w-full flex-1 rounded-none sm:w-auto" disabled={isSaving}>
									{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{editingItem ? "Update Booth Price" : "Add Booth Price"}
								</Button>
							</div>
						</form>
					</div>

					<div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-muted/10 p-6 lg:p-8">
						{recentlyCreatedBoothPrice && (
						<div className="flex flex-col gap-3 rounded-none border bg-muted/35 p-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="min-w-0">
								<p className="flex items-center gap-2 font-medium text-sm">
									<CheckCircle2 className="h-4 w-4 text-emerald-600" />
									{recentlyCreatedBoothPrice.label} is ready for pricing tiers
								</p>
								<p className="mt-1 text-muted-foreground text-sm">
									Base rate RM {recentlyCreatedBoothPrice.price.toFixed(2)}. Add a timed tier like Early Bird next.
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									type="button"
									className="rounded-none"
									onClick={() => {
										setTierBoothPrice(recentlyCreatedBoothPrice);
										setRecentlyCreatedBoothPrice(null);
									}}
								>
									<CalendarRange className="mr-2 h-4 w-4" />
									Add First Tier
								</Button>
								<Button
									type="button"
									variant="outline"
									className="rounded-none"
									onClick={() => setRecentlyCreatedBoothPrice(null)}
								>
									Later
								</Button>
							</div>
						</div>
					)}

						<div className="rounded-none border bg-background shadow-sm">
							<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Booth Type</TableHead>
								{hasZoneOptions && <TableHead>Zone</TableHead>}
								<TableHead>Label</TableHead>
								<TableHead>Rate</TableHead>
								<TableHead>Quota</TableHead>
								<TableHead>Price Tier</TableHead>
								<TableHead className="w-[100px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={hasZoneOptions ? 7 : 6} className="py-8 text-center">
										<Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
									</TableCell>
								</TableRow>
							) : boothPrices.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={hasZoneOptions ? 7 : 6}
										className="py-8 text-center text-muted-foreground"
									>
										No booth prices configured yet.
									</TableCell>
								</TableRow>
							) : (
								boothPrices.map((item) => (
									<TableRow key={item.id}>
										<TableCell className="font-medium">
											{formatBoothType(item.boothType)}
										</TableCell>
										{hasZoneOptions && <TableCell>{item.zone || "-"}</TableCell>}
										<TableCell>{item.label}</TableCell>
										<TableCell>
											<div className="space-y-1">
												{item.activePriceTierLabel ? (
													<div className="flex flex-col gap-1">
														<div className="flex items-center gap-2">
															<span className="font-medium text-emerald-600">
																RM {item.currentPrice.toFixed(2)}
															</span>
															<Badge variant="secondary" className="rounded-none bg-emerald-100/80 text-emerald-800 hover:bg-emerald-100/80 border-emerald-200">
																{item.activePriceTierLabel}
															</Badge>
														</div>
														<p className="text-muted-foreground text-xs">
															Normal Rate : RM {item.price.toFixed(2)}
														</p>
													</div>
												) : (
													<div className="font-medium">RM {item.price.toFixed(2)}</div>
												)}
											</div>
										</TableCell>
										<TableCell>{item.quota === null ? "Unlimited" : item.quota}</TableCell>
										<TableCell>
											<BoothPriceTierDialog
												boothPrice={item}
												trigger={
													<Button
														type="button"
														variant="outline"
														size="sm"
														className="h-8 rounded-none px-2 text-xs font-normal"
													>
														<CalendarRange className="mr-2 h-3.5 w-3.5" />
														<span>Price Tiers</span>
													</Button>
												}
											/>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => onStartEdit(item)}
													className="h-8 w-8 rounded-none p-0"
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => deleteMutation.mutate({ id: item.id })}
													disabled={deleteMutation.isPending}
													className="h-8 w-8 rounded-none p-0 text-destructive hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
										))
								)}
							</TableBody>
						</Table>
							</div>
						</div>
					</div>

					{tierBoothPrice && (
						<BoothPriceTierDialog
							boothPrice={tierBoothPrice}
							open={true}
							defaultAdding={true}
							onOpenChange={(open) => {
								if (!open) {
									setTierBoothPrice(null);
								}
							}}
							trigger={<span className="hidden" />}
						/>
					)}
				</DialogContent>
			</Dialog>
		);
}
