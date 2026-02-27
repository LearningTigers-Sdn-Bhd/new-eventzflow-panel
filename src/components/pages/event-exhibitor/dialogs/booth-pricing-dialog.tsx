"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Loader2, Tags, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
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
import { getExhibitorZones } from "@/lib/api/exhibitor-zone";

interface BoothPricingDialogProps {
	eventId: number;
	trigger?: React.ReactNode;
}

type FormState = {
	boothType: "" | "shell_scheme" | "raw_space";
	exhibitorZoneId: string;
	label: string;
	price: string;
};

const DEFAULT_FORM: FormState = {
	boothType: "",
	exhibitorZoneId: "",
	label: "",
	price: "",
};

const BOOTH_TYPE_OPTIONS: Array<{
	value: "shell_scheme" | "raw_space";
	label: string;
}> = [
	{ value: "shell_scheme", label: "Shell Scheme" },
	{ value: "raw_space", label: "Raw Space" },
];

const BOOTH_TYPE_LABEL_MAP: Record<"shell_scheme" | "raw_space", string> = {
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
	const [form, setForm] = React.useState<FormState>(DEFAULT_FORM);

	const { data: boothPrices = [], isLoading } = useQuery({
		queryKey: ["exhibitor-booth-prices", eventId],
		queryFn: () => getExhibitorBoothPrices(eventId),
		enabled: isOpen,
	});

	const { data: zones = [] } = useQuery({
		queryKey: ["exhibitor-zones", eventId],
		queryFn: () => getExhibitorZones(eventId),
		enabled: isOpen,
	});

	const zoneOptions = React.useMemo(
		() => zones.map((zone) => ({ id: zone.id, zone: zone.zone })),
		[zones],
	);
	const hasZoneOptions = zoneOptions.length > 0;

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
		onSuccess: () => {
			invalidateBoothPrices();
			toast.success("Booth price added");
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

		if (editingItem) {
			updateMutation.mutate({
				id: editingItem.id,
				booth_type: form.boothType,
				exhibitor_zone_id: parsedZoneId,
				label: form.label.trim(),
				price: parsedPrice,
			});
			return;
		}

		createMutation.mutate({
			event_id: eventId,
			booth_type: form.boothType,
			exhibitor_zone_id: parsedZoneId,
			label: form.label.trim(),
			price: parsedPrice,
		});
	};

	const onStartEdit = (item: ExhibitorBoothPrice) => {
		setEditingItem(item);
		setForm({
			boothType: item.boothType,
			exhibitorZoneId: item.exhibitorZoneId
				? String(item.exhibitorZoneId)
				: "",
			label: item.label,
			price: item.price.toString(),
		});
	};

	const onCancelEdit = () => {
		setEditingItem(null);
		setForm(DEFAULT_FORM);
	};

	const formatBoothType = (boothType: ExhibitorBoothPrice["boothType"]) => {
		return (
			BOOTH_TYPE_LABEL_MAP[boothType as "shell_scheme" | "raw_space"] ||
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
			<DialogContent className="rounded-none sm:max-w-[820px]">
				<DialogHeader>
					<DialogTitle>Manage Exhibitor Booth Prices</DialogTitle>
					<DialogDescription>
						Set booth types and rates used by exhibitor registration.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={onSubmit} className="space-y-4 rounded-none border p-4">
					<div className={`grid gap-3 ${hasZoneOptions ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
						<div className="space-y-2">
							<Label htmlFor="booth-type">Booth Type</Label>
							<Select
								value={form.boothType}
								onValueChange={(value) =>
									setForm((prev) => ({
										...prev,
										boothType: value as "shell_scheme" | "raw_space",
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
									{BOOTH_TYPE_OPTIONS.map((option) => (
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
							<Label htmlFor="booth-price">Rate (RM)</Label>
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
					</div>

					<DialogFooter>
						{editingItem && (
							<Button
								type="button"
								variant="outline"
								className="rounded-none"
								onClick={onCancelEdit}
							>
								Cancel Edit
							</Button>
						)}
						<Button type="submit" className="rounded-none" disabled={isSaving}>
							{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{editingItem ? "Update Booth Price" : "Add Booth Price"}
						</Button>
					</DialogFooter>
				</form>

				<div className="rounded-none border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Booth Type</TableHead>
								{hasZoneOptions && <TableHead>Zone</TableHead>}
								<TableHead>Label</TableHead>
								<TableHead>Rate</TableHead>
								<TableHead className="w-[120px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={hasZoneOptions ? 5 : 4} className="py-8 text-center">
										<Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
									</TableCell>
								</TableRow>
							) : boothPrices.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={hasZoneOptions ? 5 : 4}
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
										<TableCell>RM {item.price.toFixed(2)}</TableCell>
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
			</DialogContent>
		</Dialog>
	);
}
