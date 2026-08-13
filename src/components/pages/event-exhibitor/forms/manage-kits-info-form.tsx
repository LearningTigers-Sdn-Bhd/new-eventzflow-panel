"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getEventById } from "@/lib/api/event";
import type { EventVendor } from "@/lib/api/event-vendor";
import {
	assignExhibitorBooth,
	getExhibitorBooths,
	releaseExhibitorBooth,
} from "@/lib/api/exhibitor-booth";
import { getExhibitorBoothPrices } from "@/lib/api/exhibitor-booth-price";
import {
	type ExhibitorKit,
	getExhibitorKit,
	updateExhibitorKit,
} from "@/lib/api/exhibitor-kit";
import { getExhibitorPackages } from "@/lib/api/exhibitor-package";
import { extractErrorMessage } from "@/utils/error-handler";

function formatVoucherDiscount(
	discountType: ExhibitorKit["exhibitor_voucher_discount_type"],
	discountValue: ExhibitorKit["exhibitor_voucher_discount_value"],
): string {
	if (!discountType || discountValue === null || discountValue === undefined) {
		return "";
	}
	const value = Number(discountValue);
	switch (discountType) {
		case "percentage_off":
			return `${value}% off`;
		case "fixed_amount_off":
			return `RM${value} off`;
		case "flat_price":
			return `RM${value} flat`;
		default:
			return "";
	}
}

export interface ManageKitsInfoFormProps {
	vendor: EventVendor;
	kitId: number;
	onClose?: () => void;
}

export function ManageKitsInfoForm({ vendor, kitId }: ManageKitsInfoFormProps) {
	const params = useParams();
	const eventId = Number(params.event_id);
	const kit = vendor.exhibitor_kits.find((candidate) => candidate.id === kitId);

	// Form field IDs
	const boothNumberField = useId();
	const boothTypeField = useId();
	const boothDimensionsField = useId();
	const nameOnFasciaField = useId();
	const companyNameField = useId();
	const companyAddressField = useId();
	const picFullNameField = useId();
	const picContactNumberField = useId();
	const picEmailField = useId();
	const countryField = useId();
	const specialRequirementsField = useId();
	const paymentStatusField = useId();
	const amountPaidField = useId();
	const paymentNoteField = useId();

	// Form state
	const [boothNumber, setBoothNumber] = useState(kit?.booth_number || "");
	const [boothType, setBoothType] = useState<string>(kit?.booth_type || "");
	const [boothDimensions, setBoothDimensions] = useState(
		kit?.booth_dimensions || "",
	);
	const [sideWallLeftRequired, setSideWallLeftRequired] = useState(
		kit?.side_wall_left_required || false,
	);
	const [sideWallRightRequired, setSideWallRightRequired] = useState(
		kit?.side_wall_right_required || false,
	);
	const [nameOnFascia, setNameOnFascia] = useState(kit?.name_on_fascia || "");
	const [fasciaUpgradeRequired, setFasciaUpgradeRequired] = useState(
		kit?.fascia_upgrade_required || false,
	);
	const [companyName, setCompanyName] = useState(kit?.company_name || "");
	const [companyAddress, setCompanyAddress] = useState(
		kit?.company_address || "",
	);
	const [country, setCountry] = useState(kit?.country || "");
	const [picFullName, setPicFullName] = useState(kit?.pic_full_name || "");
	const [picContactNumber, setPicContactNumber] = useState(
		kit?.pic_contact_number || "",
	);
	const [picEmail, setPicEmail] = useState(kit?.pic_email_address || "");
	const [specialRequirements, setSpecialRequirements] = useState(
		kit?.special_requirements || "",
	);
	const [paymentStatus, setPaymentStatus] = useState<string>(
		kit?.payment_status || "unpaid",
	);
	const [amountPaid, setAmountPaid] = useState(kit?.amount_paid || "");
	const [paymentNote, setPaymentNote] = useState(kit?.payment_note || "");

	const queryClient = useQueryClient();

	const { data: event } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId.toString()),
	});
	const exhibitorLabels = event?.exhibitor_labels_data ?? {};
	const [customFieldValues, setCustomFieldValues] = useState<
		Record<string, string>
	>({});
	// Seeded in an effect (not useState's lazy initializer) because
	// event.exhibitor_labels_data resolves from its own query after mount —
	// an initializer would run before that data exists and end up empty.
	const labelsFromEvent = event?.exhibitor_labels_data;
	useEffect(() => {
		const values: Record<string, string> = {};
		for (const key of Object.keys(labelsFromEvent ?? {})) {
			const existing = kit?.custom_fields_data?.[key];
			values[key] = typeof existing === "string" ? existing : "";
		}
		setCustomFieldValues(values);
	}, [kit, labelsFromEvent]);
	const { data: kitDetails, isPending: isKitDetailsPending } = useQuery({
		queryKey: ["event", eventId, "exhibitor-kit", kitId],
		queryFn: () => getExhibitorKit(eventId, kitId),
	});
	// Scoped to the kit's own booth price — a kit billed at one price tier must
	// only ever see (and be assignable to) booths from that same tier.
	const kitBoothPriceId = kitDetails?.exhibitor_booth_price_id;
	const boothsQueryEnabled = Boolean(kitBoothPriceId);
	const {
		data: booths = [],
		isPending: isBoothsPendingRaw,
		isError: isBoothsError,
	} = useQuery({
		queryKey: ["event", eventId, "exhibitor-booths", kitBoothPriceId],
		queryFn: () =>
			getExhibitorBooths({
				event_id: eventId,
				exhibitor_booth_price_id: kitBoothPriceId,
			}),
		enabled: boothsQueryEnabled,
	});
	const isBoothsPending = boothsQueryEnabled && isBoothsPendingRaw;
	const hasBoothInventory = booths.length > 0;
	const linkedBoothId = kitDetails?.exhibitor_booth_id ?? null;
	const selectableBooths = booths.filter(
		(booth) => booth.status === "available" || booth.id === linkedBoothId,
	);

	// Booth price / package / voucher can be changed until the kit is settled — after
	// that there's no refund/reconciliation flow, so the backend rejects it (see
	// ExhibitorKitService#update_booking_selection) and this UI mirrors that gate.
	const isSettled =
		kitDetails?.payment_status === "paid" ||
		kitDetails?.payment_status === "waived" ||
		kitDetails?.payment_status === "sponsored";
	const { data: boothPrices = [] } = useQuery({
		queryKey: ["event", eventId, "exhibitor-booth-prices"],
		queryFn: () => getExhibitorBoothPrices(eventId),
	});
	const { data: packages = [] } = useQuery({
		queryKey: ["event", eventId, "exhibitor-packages"],
		queryFn: () => getExhibitorPackages(eventId),
	});
	const [selectedBoothPriceId, setSelectedBoothPriceId] = useState<
		number | undefined
	>(undefined);
	const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
		null,
	);
	const [voucherCode, setVoucherCode] = useState("");
	useEffect(() => {
		if (!kitDetails) return;
		setSelectedBoothPriceId(kitDetails.exhibitor_booth_price_id);
		setSelectedPackageId(kitDetails.exhibitor_package_id ?? null);
		setVoucherCode(kitDetails.exhibitor_voucher_code ?? "");
	}, [kitDetails]);
	// The kit's currently assigned price/package may have been archived/deactivated
	// since booking — it won't be in the fetch-for-new-bookings list, but the Select
	// still needs an option to render so the current value doesn't fall back to the
	// placeholder. Synthesize one from kitDetails' own label when that happens.
	const boothPriceOptions =
		kitDetails?.exhibitor_booth_price_id &&
		!boothPrices.some(
			(price) => price.id === kitDetails.exhibitor_booth_price_id,
		)
			? [
					{
						id: kitDetails.exhibitor_booth_price_id,
						label: kitDetails.exhibitor_booth_price_label || "Current price",
						zone: kitDetails.exhibitor_booth_price_zone ?? null,
					},
					...boothPrices,
				]
			: boothPrices;
	const packageOptions =
		kitDetails?.exhibitor_package_id &&
		kitDetails.exhibitor_package_id === selectedPackageId &&
		!packages.some((pkg) => pkg.id === kitDetails.exhibitor_package_id)
			? [
					{
						id: kitDetails.exhibitor_package_id,
						name: kitDetails.exhibitor_package_name || "Current package",
						exhibitorBoothPriceId: selectedBoothPriceId ?? -1,
					},
					...packages,
				]
			: packages;
	const packagesForSelectedBoothPrice = packageOptions.filter(
		(pkg) => pkg.exhibitorBoothPriceId === selectedBoothPriceId,
	);
	const bookingSelectionChanged =
		kitDetails !== undefined &&
		(selectedBoothPriceId !== kitDetails.exhibitor_booth_price_id ||
			selectedPackageId !== (kitDetails.exhibitor_package_id ?? null) ||
			voucherCode !== (kitDetails.exhibitor_voucher_code ?? ""));
	// Base-price preview only — voucher math needs server-side validation (does the
	// code even apply to this selection?), so it's excluded here rather than guessed.
	const selectedPackageForPreview = packages.find(
		(pkg) => pkg.id === selectedPackageId,
	);
	const previewBasePrice =
		selectedPackageForPreview?.price ??
		boothPrices.find((price) => price.id === selectedBoothPriceId)
			?.currentPrice;

	const boothTypeOptions = useMemo(() => {
		const defaults = [
			{ value: "shell_scheme", label: "Shell Scheme" },
			{ value: "raw_space", label: "Raw Space" },
		];
		const customTypes = event?.booth_types || [];
		for (const type of customTypes) {
			if (!defaults.some((o) => o.value === type)) {
				defaults.push({
					value: type,
					label: type
						.split("_")
						.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
						.join(" "),
				});
			}
		}
		return defaults;
	}, [event?.booth_types]);

	const updateKitMutation = useMutation({
		mutationFn: (data: Parameters<typeof updateExhibitorKit>[2]) => {
			if (!kitId) {
				throw new Error("No exhibitor kit found");
			}

			return updateExhibitorKit(eventId, kitId, data);
		},
		onSuccess: () => {
			toast.success("Exhibitor kit updated successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "exhibitor-kit", kitId],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "exhibitor-booths"],
			});
		},
		onError: async (error: unknown) => {
			toast.error(await extractErrorMessage(error));
		},
	});

	const assignBoothMutation = useMutation({
		mutationFn: (newBoothId: number | null) => {
			if (newBoothId === null) {
				if (!linkedBoothId) throw new Error("No booth to release");
				return releaseExhibitorBooth({ id: linkedBoothId });
			}
			return assignExhibitorBooth({
				id: newBoothId,
				exhibitor_kit_id: kitId,
			});
		},
		onSuccess: (result, newBoothId) => {
			setBoothNumber(newBoothId === null ? "" : result.booth.number);
			queryClient.setQueryData(
				["event", eventId, "exhibitor-kit", kitId],
				(old: ExhibitorKit | undefined) =>
					old ? { ...old, exhibitor_booth_id: newBoothId } : old,
			);
			toast.success("Booth updated");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "exhibitor-booths"],
			});
			queryClient.invalidateQueries({ queryKey: ["exhibitor-booths"] });
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "exhibitor-kit", kitId],
			});
		},
		onError: async (error: unknown) => {
			toast.error(await extractErrorMessage(error));
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!kit) {
			toast.error("No exhibitor kit found");
			return;
		}
		// custom_fields_data is a full-replace column that also carries internal
		// bookkeeping keys (dedup fingerprints, batch ids — see
		// ExhibitorKit::SYSTEM_CUSTOM_FIELD_KEYS on the backend). Overlay only the
		// configured label keys on top of the kit's existing data so those keys
		// survive the update untouched.
		const hasCustomFields = Object.keys(exhibitorLabels).length > 0;

		await updateKitMutation.mutateAsync({
			...(!hasBoothInventory ? { booth_number: boothNumber || undefined } : {}),
			...(bookingSelectionChanged
				? {
						exhibitor_booth_price_id: selectedBoothPriceId,
						exhibitor_package_id: selectedPackageId,
						voucher_code: voucherCode,
					}
				: {}),
			booth_type: boothType || undefined,
			booth_dimensions: boothDimensions || undefined,
			side_wall_left_required: sideWallLeftRequired,
			side_wall_right_required: sideWallRightRequired,
			name_on_fascia: nameOnFascia || undefined,
			fascia_upgrade_required: fasciaUpgradeRequired,
			company_name: companyName || undefined,
			company_address: companyAddress || undefined,
			country: country || undefined,
			pic_full_name: picFullName || undefined,
			pic_contact_number: picContactNumber || undefined,
			pic_email_address: picEmail || undefined,
			special_requirements: specialRequirements || undefined,
			payment_status: paymentStatus as
				| "unpaid"
				| "paid"
				| "waived"
				| "sponsored"
				| "deposit",
			amount_paid: amountPaid || undefined,
			payment_note: paymentNote || undefined,
			custom_fields_data: hasCustomFields
				? { ...kit.custom_fields_data, ...customFieldValues }
				: undefined,
		});
	};

	if (!kit) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				No exhibitor kit found.
			</div>
		);
	}

	return (
		<section className="w-full border border-dashed p-4">
			<form onSubmit={handleSubmit}>
				<FieldGroup className="gap-3 md:gap-4">
					{/* Booth Information */}
					<p className="font-medium text-xs md:text-sm">Booth Information</p>
					<div className="grid grid-cols-2 items-start gap-3 md:grid-cols-4 md:gap-4">
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={boothNumberField}
								className="text-xs md:text-sm"
							>
								Booth Number
							</FieldLabel>
							{hasBoothInventory ? (
								<Select
									value={linkedBoothId ? String(linkedBoothId) : "none"}
									onValueChange={(value) => {
										if (value === "none") {
											assignBoothMutation.mutate(null);
											return;
										}
										const parsed = Number(value);
										if (!Number.isInteger(parsed) || parsed < 1) return;
										assignBoothMutation.mutate(parsed);
									}}
									disabled={
										assignBoothMutation.isPending || isKitDetailsPending
									}
								>
									<SelectTrigger
										id={boothNumberField}
										className="rounded-none text-sm"
									>
										<SelectValue placeholder="Select a booth" />
									</SelectTrigger>
									<SelectContent className="rounded-none">
										<SelectItem value="none">No Booth</SelectItem>
										{selectableBooths.map((booth) => (
											<SelectItem key={booth.id} value={String(booth.id)}>
												{booth.number}
												{booth.label ? ` — ${booth.label}` : ""}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							) : (
								<Input
									id={boothNumberField}
									value={boothNumber}
									onChange={(e) => setBoothNumber(e.target.value)}
									placeholder="e.g., A-101"
									disabled={updateKitMutation.isPending || isBoothsPending}
									className="rounded-none text-sm"
								/>
							)}
							{isBoothsError && (
								<FieldDescription className="text-destructive text-xs">
									Failed to load booth inventory. Refresh to try again.
								</FieldDescription>
							)}
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={boothTypeField}
								className="text-xs md:text-sm"
							>
								Booth Type
							</FieldLabel>
							<Select
								value={boothType}
								onValueChange={setBoothType}
								disabled={updateKitMutation.isPending}
							>
								<SelectTrigger
									id={boothTypeField}
									className="rounded-none text-sm"
								>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent className="rounded-none">
									{boothTypeOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={boothDimensionsField}
								className="text-xs md:text-sm"
							>
								Dimensions
							</FieldLabel>
							<Input
								id={boothDimensionsField}
								value={boothDimensions}
								onChange={(e) => setBoothDimensions(e.target.value)}
								placeholder="e.g., 3m x 3m"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel className="text-xs md:text-sm">Side Walls</FieldLabel>
							<div className="flex h-9 items-center gap-3 rounded-none border border-dashed bg-accent px-2 py-2 md:gap-4 md:px-3">
								<div className="flex items-center gap-1.5">
									<Switch
										checked={sideWallLeftRequired}
										onCheckedChange={setSideWallLeftRequired}
										disabled={updateKitMutation.isPending}
									/>
									<span className="text-xs md:text-sm">L</span>
								</div>
								<div className="flex items-center gap-1.5">
									<Switch
										checked={sideWallRightRequired}
										onCheckedChange={setSideWallRightRequired}
										disabled={updateKitMutation.isPending}
									/>
									<span className="text-xs md:text-sm">R</span>
								</div>
							</div>
						</Field>
					</div>

					{kitDetails && (
						<div className="grid grid-cols-2 items-start gap-3 rounded-none border border-dashed bg-accent/50 p-3 md:grid-cols-3 md:gap-4">
							<Field orientation="vertical">
								<FieldLabel className="text-xs md:text-sm">
									Booth Price
								</FieldLabel>
								{isSettled ? (
									<p className="text-sm">
										{kitDetails.exhibitor_booth_price_label
											? `${kitDetails.exhibitor_booth_price_label}${
													kitDetails.exhibitor_booth_price_zone
														? ` (${kitDetails.exhibitor_booth_price_zone})`
														: ""
												}`
											: "—"}
									</p>
								) : (
									<Select
										value={
											selectedBoothPriceId ? String(selectedBoothPriceId) : ""
										}
										onValueChange={(value) => {
											// Radix can fire onValueChange("") from its hidden native
											// <select> bridge while options are still registering —
											// an empty value is never a real selection, so ignore it
											// rather than let Number("") (0) clobber the real id.
											if (!value) return;
											const parsed = Number(value);
											setSelectedBoothPriceId(parsed);
											// Package is scoped to a single booth price — clear it if
											// it no longer matches the newly selected one.
											setSelectedPackageId((current) => {
												const pkg = packages.find((p) => p.id === current);
												return pkg && pkg.exhibitorBoothPriceId === parsed
													? current
													: null;
											});
										}}
										disabled={updateKitMutation.isPending}
									>
										<SelectTrigger className="rounded-none text-sm">
											<SelectValue placeholder="Select booth price" />
										</SelectTrigger>
										<SelectContent className="rounded-none">
											{boothPriceOptions.map((price) => (
												<SelectItem key={price.id} value={String(price.id)}>
													{price.label}
													{price.zone ? ` (${price.zone})` : ""}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</Field>
							<Field orientation="vertical">
								<FieldLabel className="text-xs md:text-sm">Package</FieldLabel>
								{isSettled ? (
									<p className="text-sm">
										{kitDetails.exhibitor_package_name || "—"}
									</p>
								) : (
									<Select
										value={
											selectedPackageId ? String(selectedPackageId) : "none"
										}
										onValueChange={(value) =>
											setSelectedPackageId(
												value === "none" ? null : Number(value),
											)
										}
										disabled={updateKitMutation.isPending}
									>
										<SelectTrigger className="rounded-none text-sm">
											<SelectValue placeholder="No package" />
										</SelectTrigger>
										<SelectContent className="rounded-none">
											<SelectItem value="none">No Package</SelectItem>
											{packagesForSelectedBoothPrice.map((pkg) => (
												<SelectItem key={pkg.id} value={String(pkg.id)}>
													{pkg.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</Field>
							<Field orientation="vertical">
								<FieldLabel className="text-xs md:text-sm">Voucher</FieldLabel>
								{isSettled ? (
									<p className="text-sm">
										{kitDetails.exhibitor_voucher_code
											? `${kitDetails.exhibitor_voucher_code} (${formatVoucherDiscount(
													kitDetails.exhibitor_voucher_discount_type,
													kitDetails.exhibitor_voucher_discount_value,
												)})`
											: "—"}
									</p>
								) : (
									<Input
										value={voucherCode}
										onChange={(e) => setVoucherCode(e.target.value)}
										placeholder="Voucher code (optional)"
										disabled={updateKitMutation.isPending}
										className="rounded-none text-sm"
									/>
								)}
							</Field>
							{isSettled && (
								<FieldDescription className="col-span-2 text-xs md:col-span-3">
									Kit is settled ({kitDetails.payment_status}) — booth price,
									package, and voucher can no longer be changed.
								</FieldDescription>
							)}
							{!isSettled &&
								bookingSelectionChanged &&
								previewBasePrice !== undefined && (
									<FieldDescription className="col-span-2 text-xs md:col-span-3">
										New price on save: RM{previewBasePrice.toFixed(2)}
										{voucherCode
											? " (before voucher — applied and validated on save)"
											: ""}
									</FieldDescription>
								)}
						</div>
					)}

					<FieldSeparator />

					{/* Fascia & Company Information */}
					<p className="font-medium text-xs md:text-sm">Fascia & Company</p>
					<div className="grid grid-cols-2 items-start gap-3 md:grid-cols-4 md:gap-4">
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={nameOnFasciaField}
								className="text-xs md:text-sm"
							>
								Name on Fascia
							</FieldLabel>
							<Input
								id={nameOnFasciaField}
								value={nameOnFascia}
								onChange={(e) => setNameOnFascia(e.target.value)}
								placeholder="Max 30 chars"
								maxLength={30}
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
							<FieldDescription className="text-xs">
								{nameOnFascia.length}/30
							</FieldDescription>
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={companyNameField}
								className="text-xs md:text-sm"
							>
								Company Name
							</FieldLabel>
							<Input
								id={companyNameField}
								value={companyName}
								onChange={(e) => setCompanyName(e.target.value)}
								placeholder="Company name"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={companyAddressField}
								className="text-xs md:text-sm"
							>
								Company Address
							</FieldLabel>
							<Input
								id={companyAddressField}
								value={companyAddress}
								onChange={(e) => setCompanyAddress(e.target.value)}
								placeholder="Address"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel className="text-xs md:text-sm">
								Fascia Upgrade
							</FieldLabel>
							<div className="flex h-9 items-center gap-2 rounded-none border border-dashed bg-accent px-2 py-2 md:px-3">
								<Switch
									checked={fasciaUpgradeRequired}
									onCheckedChange={setFasciaUpgradeRequired}
									disabled={updateKitMutation.isPending}
								/>
								<span className="text-xs md:text-sm">
									{fasciaUpgradeRequired ? "Yes" : "No"}
								</span>
							</div>
						</Field>
					</div>

					<FieldSeparator />

					{/* PIC Information */}
					<p className="font-medium text-xs md:text-sm">
						Person In Charge (PIC)
					</p>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-4 md:gap-4">
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={picFullNameField}
								className="text-xs md:text-sm"
							>
								Full Name
							</FieldLabel>
							<Input
								id={picFullNameField}
								value={picFullName}
								onChange={(e) => setPicFullName(e.target.value)}
								placeholder="Full name"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={picContactNumberField}
								className="text-xs md:text-sm"
							>
								Contact Number
							</FieldLabel>
							<Input
								id={picContactNumberField}
								type="tel"
								value={picContactNumber}
								onChange={(e) => setPicContactNumber(e.target.value)}
								placeholder="Phone number"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={picEmailField}
								className="text-xs md:text-sm"
							>
								Email
							</FieldLabel>
							<Input
								id={picEmailField}
								type="email"
								value={picEmail}
								onChange={(e) => setPicEmail(e.target.value)}
								placeholder="Email address"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel htmlFor={countryField} className="text-xs md:text-sm">
								Country
							</FieldLabel>
							<Input
								id={countryField}
								value={country}
								onChange={(e) => setCountry(e.target.value)}
								placeholder="Country"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
					</div>
					<Field orientation="vertical">
						<FieldLabel
							htmlFor={specialRequirementsField}
							className="text-xs md:text-sm"
						>
							Special Requirements
						</FieldLabel>
						<Textarea
							id={specialRequirementsField}
							value={specialRequirements}
							onChange={(e) => setSpecialRequirements(e.target.value)}
							placeholder="Any special requirements..."
							disabled={updateKitMutation.isPending}
							className="min-h-[60px] rounded-none text-sm md:min-h-[80px]"
						/>
					</Field>

					{Object.keys(exhibitorLabels).length > 0 && (
						<>
							<FieldSeparator />
							<p className="font-medium text-xs md:text-sm">Additional Info</p>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-4 md:gap-4">
								{Object.entries(exhibitorLabels).map(([key, label]) => (
									<Field orientation="vertical" key={key}>
										<FieldLabel
											htmlFor={`custom-${key}`}
											className="text-xs md:text-sm"
										>
											{label}
										</FieldLabel>
										<Input
											id={`custom-${key}`}
											value={customFieldValues[key] ?? ""}
											onChange={(e) =>
												setCustomFieldValues((prev) => ({
													...prev,
													[key]: e.target.value,
												}))
											}
											disabled={updateKitMutation.isPending}
											className="rounded-none text-sm"
										/>
									</Field>
								))}
							</div>
						</>
					)}

					<FieldSeparator />

					{/* Payment Information */}
					<p className="font-medium text-xs md:text-sm">Payment</p>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={paymentStatusField}
								className="text-xs md:text-sm"
							>
								Status
							</FieldLabel>
							<Select
								value={paymentStatus}
								onValueChange={setPaymentStatus}
								disabled={updateKitMutation.isPending}
							>
								<SelectTrigger
									id={paymentStatusField}
									className="rounded-none text-sm"
								>
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent className="rounded-none">
									<SelectItem value="unpaid">Unpaid</SelectItem>
									<SelectItem value="paid">Paid</SelectItem>
									<SelectItem value="waived">Waived</SelectItem>
									<SelectItem value="sponsored">Sponsored</SelectItem>
									<SelectItem value="deposit">Deposit</SelectItem>
								</SelectContent>
							</Select>
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={amountPaidField}
								className="text-xs md:text-sm"
							>
								Amount Paid
							</FieldLabel>
							<Input
								id={amountPaidField}
								type="number"
								value={amountPaid}
								onChange={(e) => setAmountPaid(e.target.value)}
								placeholder="0.00"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical" className="col-span-2 sm:col-span-1">
							<FieldLabel
								htmlFor={paymentNoteField}
								className="text-xs md:text-sm"
							>
								Note
							</FieldLabel>
							<Textarea
								id={paymentNoteField}
								value={paymentNote}
								onChange={(e) => setPaymentNote(e.target.value)}
								placeholder="Payment notes..."
								disabled={updateKitMutation.isPending}
								className="min-h-[60px] rounded-none text-sm md:min-h-[80px]"
							/>
						</Field>
					</div>

					<FieldSeparator />

					{/* Buttons */}
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={updateKitMutation.isPending || isBoothsPending}
							className="w-full sm:w-auto"
						>
							{updateKitMutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</FieldGroup>
			</form>
		</section>
	);
}
