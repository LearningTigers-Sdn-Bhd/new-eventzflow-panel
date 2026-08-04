"use client";

import {
	useMutation,
	useQueries,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { Building2, CheckCircle2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getEventById } from "@/lib/api/event";
import {
	createEventVendorBatch,
	getEventVendors,
} from "@/lib/api/event-vendor";
import { getExhibitorBooths } from "@/lib/api/exhibitor-booth";
import type { ExhibitorBooth } from "@/lib/api/exhibitor-booth/response";
import { getExhibitorBoothPrices } from "@/lib/api/exhibitor-booth-price";
import { getExhibitorPackages } from "@/lib/api/exhibitor-package";
import { previewExhibitorVoucher } from "@/lib/api/exhibitor-voucher";
import { getVendors } from "@/lib/api/vendor";
import {
	createManualBoothRow,
	hasDuplicateBoothNumbers,
	type ManualBoothRow,
	normalizeBoothNumber,
	toBatchBooths,
} from "./manual-add-form-utils";

interface ManualAddFormProps {
	eventId: number;
	onClose?: () => void;
}

function humanizeBoothType(value: string): string {
	return value
		.replace(/[_-]+/g, " ")
		.trim()
		.split(/\s+/)
		.map((word) =>
			word.length === 0
				? word
				: word[0].toUpperCase() + word.slice(1).toLowerCase(),
		)
		.join(" ");
}

interface VoucherPreviewState {
	price: number;
}

export default function ManualAddForm({
	eventId,
	onClose,
}: ManualAddFormProps) {
	const vendorIdField = useId();
	const redirectUrlField = useId();
	const posterUrlField = useId();
	const qrUrlField = useId();
	const companyNameField = useId();
	const nameOnFasciaField = useId();
	const picFullNameField = useId();
	const picContactNumberField = useId();
	const picEmailField = useId();
	const specialRequirementsField = useId();

	const [vendorId, setVendorId] = useState<string>("");
	const [redirectUrl, setRedirectUrl] = useState("");
	const [posterUrl, setPosterUrl] = useState("");
	const [qrUrl, setQrUrl] = useState("");

	const [boothRows, setBoothRows] = useState<ManualBoothRow[]>([
		createManualBoothRow("booth-1"),
	]);
	const [voucherPreviews, setVoucherPreviews] = useState<
		Record<string, VoucherPreviewState>
	>({});
	const [voucherErrors, setVoucherErrors] = useState<Record<string, string>>(
		{},
	);

	const [companyName, setCompanyName] = useState("");
	const [nameOnFascia, setNameOnFascia] = useState("");
	const [picFullName, setPicFullName] = useState("");
	const [picContactNumber, setPicContactNumber] = useState("");
	const [picEmail, setPicEmail] = useState("");
	const [specialRequirements, setSpecialRequirements] = useState("");

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

	const eventIdStr = eventId.toString();

	// Fetch event for booth_types fallback + use_exhibitor_kit/use_ticket detection
	const { data: event, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", eventIdStr],
		queryFn: () => getEventById(eventIdStr),
	});

	const isExhibitorEvent = Boolean(
		event?.use_ticket || event?.use_exhibitor_kit,
	);

	// Fetch booth prices configured for the event
	const { data: boothPrices, isLoading: isLoadingBoothPrices } = useQuery({
		queryKey: ["event", eventIdStr, "exhibitor-booth-prices"],
		queryFn: () => getExhibitorBoothPrices(eventId),
		enabled: isExhibitorEvent,
	});

	const { data: packages = [] } = useQuery({
		queryKey: ["exhibitor-packages", eventId],
		queryFn: () => getExhibitorPackages(eventId),
	});

	const hasBoothPrices = (boothPrices?.length ?? 0) > 0;
	const eventBoothTypes = event?.booth_types ?? [];

	// Per-row inventory lookups, one query per row keyed on its selected booth price
	const boothInventoryQueries = useQueries({
		queries: boothRows.map((row) => ({
			queryKey: ["event", eventIdStr, "exhibitor-booths", row.boothPriceId],
			queryFn: () =>
				getExhibitorBooths({
					event_id: eventId,
					exhibitor_booth_price_id: Number(row.boothPriceId),
				}),
			enabled: Boolean(row.boothPriceId),
		})),
	});

	const inventoryByRowId = useMemo(() => {
		const map: Record<string, ExhibitorBooth[]> = {};
		boothRows.forEach((row, index) => {
			map[row.id] = boothInventoryQueries[index]?.data ?? [];
		});
		return map;
	}, [boothRows, boothInventoryQueries]);

	// Booth numbers already selected in other rows are excluded, in addition to server status
	const selectedBoothNumbersByRowId = useMemo(() => {
		const map: Record<string, Set<string>> = {};
		boothRows.forEach((row) => {
			const others = boothRows.filter((other) => other.id !== row.id);
			map[row.id] = new Set(
				others
					.map((other) => normalizeBoothNumber(other.boothNumber))
					.filter(Boolean),
			);
		});
		return map;
	}, [boothRows]);

	const updateBoothRow = (id: string, patch: Partial<ManualBoothRow>) => {
		setBoothRows((prev) =>
			prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
		);
		setRowErrors((prev) => {
			if (!(id in prev)) return prev;
			const next = { ...prev };
			delete next[id];
			return next;
		});
	};

	const addBoothRow = () => {
		setBoothRows((prev) => [
			...prev,
			createManualBoothRow(`booth-${Date.now()}-${prev.length}`),
		]);
	};

	const removeBoothRow = (id: string) => {
		setBoothRows((prev) =>
			prev.length > 1 ? prev.filter((row) => row.id !== id) : prev,
		);
		setVoucherPreviews((prev) => {
			if (!(id in prev)) return prev;
			const next = { ...prev };
			delete next[id];
			return next;
		});
		setVoucherErrors((prev) => {
			if (!(id in prev)) return prev;
			const next = { ...prev };
			delete next[id];
			return next;
		});
	};

	const changeBoothPrice = (id: string, value: string) => {
		updateBoothRow(id, { boothPriceId: value, packageId: "", boothNumber: "" });
		setVoucherPreviews((prev) => {
			if (!(id in prev)) return prev;
			const next = { ...prev };
			delete next[id];
			return next;
		});
	};

	// Per-row debounced voucher preview
	// biome-ignore lint/correctness/useExhaustiveDependencies: keying on a joined string, not boothRows itself, avoids re-running every render on array identity
	useEffect(() => {
		const timeouts = boothRows.map((row) => {
			const code = row.voucherCode.trim();
			if (!code || !row.boothPriceId) {
				setVoucherPreviews((prev) => {
					if (!(row.id in prev)) return prev;
					const next = { ...prev };
					delete next[row.id];
					return next;
				});
				setVoucherErrors((prev) => {
					if (!(row.id in prev)) return prev;
					const next = { ...prev };
					delete next[row.id];
					return next;
				});
				return null;
			}

			return setTimeout(async () => {
				try {
					const result = await previewExhibitorVoucher({
						eventId,
						code,
						exhibitorBoothPriceId: Number(row.boothPriceId),
						exhibitorPackageId: row.packageId ? Number(row.packageId) : null,
					});
					setVoucherPreviews((prev) => ({
						...prev,
						[row.id]: { price: result.price },
					}));
					setVoucherErrors((prev) => {
						if (!(row.id in prev)) return prev;
						const next = { ...prev };
						delete next[row.id];
						return next;
					});
				} catch (error) {
					setVoucherPreviews((prev) => {
						if (!(row.id in prev)) return prev;
						const next = { ...prev };
						delete next[row.id];
						return next;
					});
					setVoucherErrors((prev) => ({
						...prev,
						[row.id]:
							error instanceof Error ? error.message : "Invalid voucher code",
					}));
				}
			}, 400);
		});

		return () => {
			for (const timeout of timeouts) {
				if (timeout) clearTimeout(timeout);
			}
		};
	}, [
		boothRows
			.map(
				(row) =>
					`${row.id}:${row.voucherCode}:${row.boothPriceId}:${row.packageId}`,
			)
			.join("|"),
		eventId,
	]);

	// Fetch available vendors
	const {
		data: vendors,
		isLoading: isLoadingVendors,
		error: vendorsError,
	} = useQuery({
		queryKey: ["vendors"],
		queryFn: getVendors,
	});

	// Fetch existing event vendors to check which are already added
	const { data: eventVendors, isLoading: isLoadingEventVendors } = useQuery({
		queryKey: ["event", eventIdStr, "vendors"],
		queryFn: () => getEventVendors(eventId),
	});

	const addedVendorIds = useMemo(() => {
		if (!eventVendors) return new Set<number>();
		return new Set(eventVendors.map((ev) => ev.vendor_id));
	}, [eventVendors]);

	const queryClient = useQueryClient();
	const createBatchMutation = useMutation({
		mutationFn: (data: Parameters<typeof createEventVendorBatch>[1]) =>
			createEventVendorBatch(eventId, data, crypto.randomUUID()),
		onSuccess: (result) => {
			toast.success(
				`Exhibitor assigned with ${result.exhibitor_kits.length} booth(s)`,
			);
			queryClient.invalidateQueries({
				queryKey: ["event", eventIdStr, "vendors"],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to assign exhibitor");
		},
	});

	const clearError = (key: string) => {
		setErrors((prev) => {
			if (!(key in prev)) return prev;
			const next = { ...prev };
			delete next[key];
			return next;
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setRowErrors({});

		const newErrors: Record<string, string> = {};
		const newRowErrors: Record<string, string> = {};

		if (!vendorId) {
			newErrors.vendorId = "Please select a vendor";
		}

		if (!picFullName.trim()) {
			newErrors.picFullName = "PIC full name is required";
		}
		if (!picContactNumber.trim()) {
			newErrors.picContactNumber = "PIC contact number is required";
		}

		for (const row of boothRows) {
			if (hasBoothPrices) {
				if (!row.boothPriceId) {
					newRowErrors[row.id] = "Please select a booth price";
					continue;
				}
				const inventory = inventoryByRowId[row.id] ?? [];
				if (inventory.length > 0 && !row.boothNumber.trim()) {
					newRowErrors[row.id] = "Please select a booth number";
				}
			} else if (!row.boothType.trim()) {
				newRowErrors[row.id] = "Please select or enter a booth type";
			}
		}

		if (hasDuplicateBoothNumbers(boothRows)) {
			newErrors.boothRows = "Each booth number can only be selected once";
		}

		if (
			Object.keys(newErrors).length > 0 ||
			Object.keys(newRowErrors).length > 0
		) {
			setErrors(newErrors);
			setRowErrors(newRowErrors);
			return;
		}

		const selectedVendor = vendors?.find((v) => v.id.toString() === vendorId);

		const data: Parameters<typeof createEventVendorBatch>[1] = {
			vendor_id: Number(vendorId),
			exhibitor: {
				pic_full_name: picFullName.trim(),
				pic_contact_number: picContactNumber.trim(),
				company_name: companyName.trim() || selectedVendor?.full_name || "",
				name_on_fascia: nameOnFascia.trim() || undefined,
				pic_email_address: picEmail.trim() || undefined,
				special_requirements: specialRequirements.trim() || undefined,
			},
			booths: toBatchBooths(boothRows, hasBoothPrices),
		};

		const trimmedRedirectUrl = redirectUrl.trim();
		if (trimmedRedirectUrl) data.redirect_url = trimmedRedirectUrl;

		const trimmedPosterUrl = posterUrl.trim();
		if (trimmedPosterUrl) data.poster_url = trimmedPosterUrl;

		const trimmedQrUrl = qrUrl.trim();
		if (trimmedQrUrl) data.qr_url = trimmedQrUrl;

		try {
			await createBatchMutation.mutateAsync(data);
		} catch {
			// handled by onError
		}
	};

	if (
		isLoadingVendors ||
		isLoadingEventVendors ||
		isLoadingEvent ||
		(isExhibitorEvent && isLoadingBoothPrices)
	) {
		return (
			<LoadingState
				title="Loading..."
				description="Please wait..."
				height="h-[300px]"
			/>
		);
	}

	if (vendorsError) {
		return (
			<ErrorState
				title="Failed to load vendors"
				description="Please try again later"
				height="h-[300px]"
			/>
		);
	}

	if (!vendors || vendors.length === 0) {
		return (
			<EmptyState
				title="No vendors available"
				description="There are no vendors in the system. Create vendors first from the Vendors page."
				icon={<Building2 className="size-8" />}
				height="h-[300px]"
				action={
					<div className="flex gap-2">
						<Button onClick={onClose} variant="outline">
							Close
						</Button>
						<Button asChild>
							<Link href="/vendor">Go to Vendors</Link>
						</Button>
					</div>
				}
			/>
		);
	}

	const activeVendors = vendors.filter((v) => v.status === "active");

	if (activeVendors.length === 0) {
		return (
			<EmptyState
				title="No active vendors available"
				description="All vendors are currently inactive. Activate vendors from the Vendors page."
				icon={<Building2 className="size-8" />}
				height="h-[300px]"
				action={
					<div className="flex gap-2">
						<Button onClick={onClose} variant="outline">
							Close
						</Button>
						<Button asChild>
							<Link href="/vendor">Go to Vendors</Link>
						</Button>
					</div>
				}
			/>
		);
	}

	const submitting = createBatchMutation.isPending;

	return (
		<section className="w-full">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldLegend className="font-bold text-xl">
						Assign Individual Exhibitor
					</FieldLegend>
					<FieldDescription>
						Select a vendor and configure their exhibitor details for this
						event.
					</FieldDescription>
					<FieldSeparator />
					<FieldGroup>
						{/* Vendor Selection */}
						<Field orientation="vertical">
							<FieldLabel htmlFor={vendorIdField}>Vendor *</FieldLabel>
							{errors.vendorId && <FieldError>{errors.vendorId}</FieldError>}
							<Select
								value={vendorId}
								onValueChange={(value) => {
									setVendorId(value);
									clearError("vendorId");
									const selected = activeVendors.find(
										(v) => v.id.toString() === value,
									);
									if (selected) {
										setCompanyName(selected.full_name || "");
										setPicFullName(
											selected.vendorProfile?.person_in_charge ||
												selected.full_name ||
												"",
										);
										setPicContactNumber(selected.phone || "");
										setPicEmail(selected.email || "");
										clearError("picFullName");
										clearError("picContactNumber");
									}
								}}
								disabled={submitting}
							>
								<SelectTrigger id={vendorIdField}>
									<SelectValue placeholder="Select a vendor" />
								</SelectTrigger>
								<SelectContent>
									{activeVendors.map((vendor) => {
										const isAlreadyAdded = addedVendorIds.has(
											Number(vendor.id),
										);
										return (
											<SelectItem
												key={vendor.id}
												value={vendor.id.toString()}
												disabled={isAlreadyAdded}
											>
												<div className="flex w-full items-center gap-2">
													<Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
													<div className="flex min-w-0 flex-1 items-center gap-2">
														<span className="truncate font-medium">
															{vendor.full_name}
														</span>
														<span className="text-muted-foreground">•</span>
														<span className="truncate text-muted-foreground text-sm">
															{vendor.email}
														</span>
													</div>
													{isAlreadyAdded && (
														<CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
													)}
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							<FieldDescription>
								Select a vendor to assign as exhibitor to this event.
							</FieldDescription>
						</Field>

						<FieldSeparator />

						{/* URL Fields */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<Field orientation="vertical">
								<FieldLabel htmlFor={redirectUrlField}>
									Redirect URL (Optional)
								</FieldLabel>
								<Input
									id={redirectUrlField}
									type="url"
									value={redirectUrl}
									onChange={(e) => setRedirectUrl(e.target.value)}
									placeholder="https://example.com"
									disabled={submitting}
									className="rounded-none"
								/>
							</Field>

							<Field orientation="vertical">
								<FieldLabel htmlFor={posterUrlField}>
									Poster URL (Optional)
								</FieldLabel>
								<Input
									id={posterUrlField}
									type="url"
									value={posterUrl}
									onChange={(e) => setPosterUrl(e.target.value)}
									placeholder="https://example.com/poster.jpg"
									disabled={submitting}
									className="rounded-none"
								/>
							</Field>

							<Field orientation="vertical">
								<FieldLabel htmlFor={qrUrlField}>
									QR Code URL (Optional)
								</FieldLabel>
								<Input
									id={qrUrlField}
									type="url"
									value={qrUrl}
									onChange={(e) => setQrUrl(e.target.value)}
									placeholder="https://example.com"
									disabled={submitting}
									className="rounded-none"
								/>
							</Field>
						</div>

						<FieldSeparator />

						{/* Booths */}
						<div className="rounded-none border border-dashed bg-muted/30 p-4">
							<div className="mb-4 flex items-center justify-between">
								<p className="font-medium text-sm">Booths</p>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addBoothRow}
									disabled={submitting}
								>
									<Plus className="mr-1 h-4 w-4" />
									Add Booth
								</Button>
							</div>

							{errors.boothRows && (
								<FieldError className="mb-4">{errors.boothRows}</FieldError>
							)}

							<div className="flex flex-col gap-4">
								{boothRows.map((row, index) => {
									const availablePackages = packages.filter(
										(item) =>
											String(item.exhibitorBoothPriceId) === row.boothPriceId,
									);
									const boothsForPrice = inventoryByRowId[row.id] ?? [];
									const excludedNumbers =
										selectedBoothNumbersByRowId[row.id] ?? new Set<string>();
									const availableBoothNumbers = boothsForPrice.filter(
										(booth) =>
											booth.status === "available" &&
											!excludedNumbers.has(normalizeBoothNumber(booth.number)),
									);
									const hasBoothInventoryForPrice = boothsForPrice.length > 0;
									const voucherPreview = voucherPreviews[row.id];
									const voucherError = voucherErrors[row.id];

									return (
										<div
											key={row.id}
											className="rounded-none border bg-background p-4"
										>
											<div className="mb-3 flex items-center justify-between">
												<p className="font-medium text-sm">Booth {index + 1}</p>
												{boothRows.length > 1 && (
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => removeBoothRow(row.id)}
														disabled={submitting}
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												)}
											</div>

											{rowErrors[row.id] && (
												<FieldError className="mb-3">
													{rowErrors[row.id]}
												</FieldError>
											)}

											{hasBoothPrices ? (
												<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
													<Field orientation="vertical">
														<FieldLabel>Booth Price *</FieldLabel>
														<Select
															value={row.boothPriceId}
															onValueChange={(value) =>
																changeBoothPrice(row.id, value)
															}
															disabled={submitting}
														>
															<SelectTrigger>
																<SelectValue placeholder="Select a booth price" />
															</SelectTrigger>
															<SelectContent>
																{boothPrices?.map((bp) => (
																	<SelectItem
																		key={bp.id}
																		value={bp.id.toString()}
																	>
																		{humanizeBoothType(bp.boothType)} —{" "}
																		{bp.label}
																		{bp.zone ? ` (${bp.zone})` : ""} — RM
																		{bp.currentPrice}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FieldDescription>
															Booth type and amount are derived from the
															selected price.
														</FieldDescription>
													</Field>
													{availablePackages.length > 0 && (
														<Field orientation="vertical">
															<FieldLabel>Package (optional)</FieldLabel>
															<Select
																value={row.packageId || "none"}
																onValueChange={(value) =>
																	updateBoothRow(row.id, {
																		packageId: value === "none" ? "" : value,
																	})
																}
																disabled={submitting}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Local — booth only" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="none">
																		No package (booth only)
																	</SelectItem>
																	{availablePackages.map((item) => (
																		<SelectItem
																			key={item.id}
																			value={String(item.id)}
																		>
																			{item.name} — RM {item.price.toFixed(2)}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</Field>
													)}
													<Field orientation="vertical">
														<FieldLabel>Voucher Code (optional)</FieldLabel>
														<Input
															value={row.voucherCode}
															onChange={(e) =>
																updateBoothRow(row.id, {
																	voucherCode: e.target.value.toUpperCase(),
																})
															}
															placeholder="e.g. A7K2M9XQ"
															disabled={submitting}
															className="rounded-none font-mono"
														/>
														{voucherPreview && (
															<FieldDescription className="text-emerald-600">
																Voucher applied — price becomes RM{" "}
																{voucherPreview.price.toFixed(2)}
															</FieldDescription>
														)}
														{voucherError && (
															<FieldError>{voucherError}</FieldError>
														)}
													</Field>
													<Field orientation="vertical">
														<FieldLabel>Booth Number (Optional)</FieldLabel>
														{hasBoothInventoryForPrice ? (
															<Select
																value={row.boothNumber || "none"}
																onValueChange={(value) =>
																	updateBoothRow(row.id, {
																		boothNumber: value === "none" ? "" : value,
																	})
																}
																disabled={
																	submitting ||
																	availableBoothNumbers.length === 0
																}
															>
																<SelectTrigger>
																	<SelectValue
																		placeholder={
																			availableBoothNumbers.length === 0
																				? "No booths available"
																				: "Select a booth number"
																		}
																	/>
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="none">
																		Unassigned
																	</SelectItem>
																	{availableBoothNumbers.map((booth) => (
																		<SelectItem
																			key={booth.id}
																			value={booth.number}
																		>
																			{booth.number}
																			{booth.label ? ` — ${booth.label}` : ""}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														) : (
															<Input
																value={row.boothNumber}
																onChange={(e) =>
																	updateBoothRow(row.id, {
																		boothNumber: e.target.value,
																	})
																}
																placeholder="e.g. A-12"
																disabled={submitting}
																className="rounded-none"
															/>
														)}
														{hasBoothInventoryForPrice &&
															availableBoothNumbers.length === 0 && (
																<FieldDescription className="text-destructive">
																	All booths for this price are currently taken.
																</FieldDescription>
															)}
													</Field>
												</div>
											) : (
												<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
													<Field orientation="vertical">
														<FieldLabel>Booth Type *</FieldLabel>
														{eventBoothTypes.length > 0 ? (
															<Select
																value={row.boothType}
																onValueChange={(value) =>
																	updateBoothRow(row.id, { boothType: value })
																}
																disabled={submitting}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Select a booth type" />
																</SelectTrigger>
																<SelectContent>
																	{eventBoothTypes.map((bt) => (
																		<SelectItem key={bt} value={bt}>
																			{humanizeBoothType(bt)}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														) : (
															<Input
																value={row.boothType}
																onChange={(e) =>
																	updateBoothRow(row.id, {
																		boothType: e.target.value,
																	})
																}
																placeholder="e.g. Shell Scheme"
																disabled={submitting}
																className="rounded-none"
															/>
														)}
														<FieldDescription>
															No booth prices configured. Enter or select a
															booth type.
														</FieldDescription>
													</Field>
													<Field orientation="vertical">
														<FieldLabel>Booth Number (Optional)</FieldLabel>
														<Input
															value={row.boothNumber}
															onChange={(e) =>
																updateBoothRow(row.id, {
																	boothNumber: e.target.value,
																})
															}
															placeholder="e.g. A-12"
															disabled={submitting}
															className="rounded-none"
														/>
													</Field>
												</div>
											)}
										</div>
									);
								})}
							</div>

							<FieldSeparator className="my-4" />

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Field orientation="vertical">
									<FieldLabel htmlFor={companyNameField}>
										Company Name
									</FieldLabel>
									<Input
										id={companyNameField}
										value={companyName}
										onChange={(e) => setCompanyName(e.target.value)}
										placeholder="Enter company name"
										disabled={submitting}
										className="rounded-none"
									/>
								</Field>
								<Field orientation="vertical">
									<FieldLabel htmlFor={nameOnFasciaField}>
										Name on Fascia
									</FieldLabel>
									<Input
										id={nameOnFasciaField}
										value={nameOnFascia}
										onChange={(e) => setNameOnFascia(e.target.value)}
										placeholder="e.g. Acme Sdn Bhd"
										maxLength={30}
										disabled={submitting}
										className="rounded-none"
									/>
									<FieldDescription>
										Applied to every booth in this batch.
									</FieldDescription>
								</Field>
							</div>
						</div>

						<FieldSeparator />

						{/* PIC Information */}
						<div className="rounded-none border border-dashed bg-muted/30 p-4">
							<p className="mb-4 font-medium text-sm">
								Person In Charge (PIC) Information
							</p>

							<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
								<Field orientation="vertical">
									<FieldLabel htmlFor={picFullNameField}>
										Full Name *
									</FieldLabel>
									{errors.picFullName && (
										<FieldError>{errors.picFullName}</FieldError>
									)}
									<Input
										id={picFullNameField}
										type="text"
										value={picFullName}
										onChange={(e) => {
											setPicFullName(e.target.value);
											clearError("picFullName");
										}}
										placeholder="Enter full name"
										disabled={submitting}
										className="rounded-none"
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={picContactNumberField}>
										Contact Number *
									</FieldLabel>
									{errors.picContactNumber && (
										<FieldError>{errors.picContactNumber}</FieldError>
									)}
									<Input
										id={picContactNumberField}
										type="tel"
										value={picContactNumber}
										onChange={(e) => {
											setPicContactNumber(e.target.value);
											clearError("picContactNumber");
										}}
										placeholder="Enter contact number"
										disabled={submitting}
										className="rounded-none"
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={picEmailField}>
										Email Address (Optional)
									</FieldLabel>
									<Input
										id={picEmailField}
										type="email"
										value={picEmail}
										onChange={(e) => setPicEmail(e.target.value)}
										placeholder="Enter email address"
										disabled={submitting}
										className="rounded-none"
									/>
								</Field>
							</div>

							<Field orientation="vertical">
								<FieldLabel htmlFor={specialRequirementsField}>
									Special Requirements (Optional)
								</FieldLabel>
								<Textarea
									id={specialRequirementsField}
									value={specialRequirements}
									onChange={(e) => setSpecialRequirements(e.target.value)}
									placeholder="Enter any special requirements..."
									disabled={submitting}
									className="min-h-[80px] rounded-none"
								/>
							</Field>
						</div>

						<FieldSeparator />

						{/* Buttons */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={submitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={submitting}>
								{submitting ? "Assigning..." : "Assign Exhibitor"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</section>
	);
}
