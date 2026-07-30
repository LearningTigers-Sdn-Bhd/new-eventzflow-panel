"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2 } from "lucide-react";
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
import { createEventVendor, getEventVendors } from "@/lib/api/event-vendor";
import { getExhibitorBoothPrices } from "@/lib/api/exhibitor-booth-price";
import { getExhibitorPackages } from "@/lib/api/exhibitor-package";
import { getVendors } from "@/lib/api/vendor";

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

export default function ManualAddForm({
	eventId,
	onClose,
}: ManualAddFormProps) {
	const vendorIdField = useId();
	const redirectUrlField = useId();
	const posterUrlField = useId();
	const qrUrlField = useId();
	const boothPriceField = useId();
	const boothTypeField = useId();
	const boothQuantityField = useId();
	const boothNumberField = useId();
	const companyNameField = useId();
	const picFullNameField = useId();
	const picContactNumberField = useId();
	const picEmailField = useId();
	const specialRequirementsField = useId();

	const [vendorId, setVendorId] = useState<string>("");
	const [redirectUrl, setRedirectUrl] = useState("");
	const [posterUrl, setPosterUrl] = useState("");
	const [qrUrl, setQrUrl] = useState("");

	// Exhibitor kit fields
	const [boothPriceId, setBoothPriceId] = useState<string>("");
	const [packageId, setPackageId] = useState("");
	const [boothType, setBoothType] = useState<string>("");
	const [boothQuantity, setBoothQuantity] = useState<string>("1");
	const [boothNumber, setBoothNumber] = useState("");
	const [companyName, setCompanyName] = useState("");
	const [picFullName, setPicFullName] = useState("");
	const [picContactNumber, setPicContactNumber] = useState("");
	const [picEmail, setPicEmail] = useState("");
	const [specialRequirements, setSpecialRequirements] = useState("");

	const [errors, setErrors] = useState<Record<string, string>>({});

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

	const availablePackages = packages.filter(
		(item) => String(item.exhibitorBoothPriceId) === boothPriceId,
	);

	// Booth price drives which packages are valid; a stale selection is rejected server-side.
	useEffect(() => {
		setPackageId("");
	}, [boothPriceId]);

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

	const hasBoothPrices = (boothPrices?.length ?? 0) > 0;
	const eventBoothTypes = event?.booth_types ?? [];
	const showBoothTypeFallback = !hasBoothPrices;

	const queryClient = useQueryClient();
	const createExhibitorMutation = useMutation({
		mutationFn: (data: Parameters<typeof createEventVendor>[1]) =>
			createEventVendor(eventId, data),
		onSuccess: () => {
			toast.success("Exhibitor added to event successfully!");
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

		const newErrors: Record<string, string> = {};

		if (!vendorId) {
			newErrors.vendorId = "Please select a vendor";
		}

		if (hasBoothPrices && !boothPriceId) {
			newErrors.boothPriceId = "Please select a booth price";
		}
		if (showBoothTypeFallback && !boothType.trim()) {
			newErrors.boothType = "Please select or enter a booth type";
		}

		const qty = Number(boothQuantity);
		if (!Number.isInteger(qty) || qty < 1) {
			newErrors.boothQuantity = "Booth quantity must be at least 1";
		}

		if (!picFullName.trim()) {
			newErrors.picFullName = "PIC full name is required";
		}
		if (!picContactNumber.trim()) {
			newErrors.picContactNumber = "PIC contact number is required";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			const data: Parameters<typeof createEventVendor>[1] = {
				vendor_id: Number(vendorId),
			};

			const trimmedRedirectUrl = redirectUrl.trim();
			if (trimmedRedirectUrl) data.redirect_url = trimmedRedirectUrl;

			const trimmedPosterUrl = posterUrl.trim();
			if (trimmedPosterUrl) data.poster_url = trimmedPosterUrl;

			const trimmedQrUrl = qrUrl.trim();
			if (trimmedQrUrl) data.qr_url = trimmedQrUrl;

			const kit: NonNullable<
				Parameters<typeof createEventVendor>[1]["exhibitor_kit_attributes"]
			> = {
				pic_full_name: picFullName.trim(),
				pic_contact_number: picContactNumber.trim(),
			};

			if (hasBoothPrices && boothPriceId) {
				kit.exhibitor_booth_price_id = Number(boothPriceId);
			}
			if (packageId) {
				kit.exhibitor_package_id = Number(packageId);
			}
			if (showBoothTypeFallback && boothType.trim()) {
				kit.booth_type = boothType.trim();
			}

			if (Number.isInteger(qty) && qty > 0) {
				kit.booth_quantity = qty;
			}

			const trimmedBoothNumber = boothNumber.trim();
			if (trimmedBoothNumber) kit.booth_number = trimmedBoothNumber;

			const selectedVendor = vendors?.find((v) => v.id.toString() === vendorId);
			const trimmedCompany = companyName.trim();
			kit.company_name = trimmedCompany || selectedVendor?.full_name || "";

			const trimmedPicEmail = picEmail.trim();
			if (trimmedPicEmail) kit.pic_email_address = trimmedPicEmail;

			const trimmedSpecial = specialRequirements.trim();
			if (trimmedSpecial) kit.special_requirements = trimmedSpecial;

			data.exhibitor_kit_attributes = kit;

			await createExhibitorMutation.mutateAsync(data);
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

	const submitting = createExhibitorMutation.isPending;

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

						{/* Booth Details */}
						<div className="rounded-none border border-dashed bg-muted/30 p-4">
							<p className="mb-4 font-medium text-sm">Booth Details</p>

							{hasBoothPrices ? (
								<>
									<Field orientation="vertical" className="mb-4">
										<FieldLabel htmlFor={boothPriceField}>
											Booth Price *
										</FieldLabel>
										{errors.boothPriceId && (
											<FieldError>{errors.boothPriceId}</FieldError>
										)}
										<Select
											value={boothPriceId}
											onValueChange={(value) => {
												setBoothPriceId(value);
												clearError("boothPriceId");
											}}
											disabled={submitting}
										>
											<SelectTrigger id={boothPriceField}>
												<SelectValue placeholder="Select a booth price" />
											</SelectTrigger>
											<SelectContent>
												{boothPrices?.map((bp) => (
													<SelectItem key={bp.id} value={bp.id.toString()}>
														{humanizeBoothType(bp.boothType)} — {bp.label}
														{bp.zone ? ` (${bp.zone})` : ""} — RM
														{bp.currentPrice}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldDescription>
											Booth type and amount are derived from the selected price.
										</FieldDescription>
									</Field>
									{availablePackages.length > 0 && (
										<Field orientation="vertical" className="mb-4">
											<FieldLabel htmlFor="manual-package">
												Package (optional)
											</FieldLabel>
											<Select value={packageId} onValueChange={setPackageId}>
												<SelectTrigger id="manual-package">
													<SelectValue placeholder="Local — booth only" />
												</SelectTrigger>
												<SelectContent>
													{availablePackages.map((item) => (
														<SelectItem key={item.id} value={String(item.id)}>
															{item.name} — RM {item.price.toFixed(2)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</Field>
									)}
								</>
							) : (
								<Field orientation="vertical" className="mb-4">
									<FieldLabel htmlFor={boothTypeField}>Booth Type *</FieldLabel>
									{errors.boothType && (
										<FieldError>{errors.boothType}</FieldError>
									)}
									{eventBoothTypes.length > 0 ? (
										<Select
											value={boothType}
											onValueChange={(value) => {
												setBoothType(value);
												clearError("boothType");
											}}
											disabled={submitting}
										>
											<SelectTrigger id={boothTypeField}>
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
											id={boothTypeField}
											value={boothType}
											onChange={(e) => {
												setBoothType(e.target.value);
												clearError("boothType");
											}}
											placeholder="e.g. Shell Scheme"
											disabled={submitting}
											className="rounded-none"
										/>
									)}
									<FieldDescription>
										No booth prices configured. Enter or select a booth type.
									</FieldDescription>
								</Field>
							)}

							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<Field orientation="vertical">
									<FieldLabel htmlFor={boothQuantityField}>
										Booth Quantity
									</FieldLabel>
									{errors.boothQuantity && (
										<FieldError>{errors.boothQuantity}</FieldError>
									)}
									<Input
										id={boothQuantityField}
										type="number"
										min={1}
										value={boothQuantity}
										onChange={(e) => {
											setBoothQuantity(e.target.value);
											clearError("boothQuantity");
										}}
										disabled={submitting}
										className="rounded-none"
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={boothNumberField}>
										Booth Number (Optional)
									</FieldLabel>
									<Input
										id={boothNumberField}
										value={boothNumber}
										onChange={(e) => setBoothNumber(e.target.value)}
										placeholder="e.g. A-12"
										disabled={submitting}
										className="rounded-none"
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={companyNameField}>
										Company Name (Optional)
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
