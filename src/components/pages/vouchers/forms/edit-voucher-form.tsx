"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
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
import { getEventVendors } from "@/lib/api/event-vendor";
import { updateVoucher, type Voucher } from "@/lib/api/voucher";
import { useAuth } from "@/hooks/use-auth";

interface EditVoucherFormProps {
	eventId: number;
	voucher: Voucher;
	onClose?: () => void;
}

type VoucherType = "fixed_amount" | "percentage" | "free_item";

export default function EditVoucherForm({
	eventId,
	voucher,
	onClose,
}: EditVoucherFormProps) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const voucherTitleField = useId();
	const descriptionField = useId();
	const merchantField = useId();
	const voucherTypeField = useId();
	const voucherValueField = useId();
	const voucherCodeField = useId();
	const voucherCategoryField = useId();
	const statusField = useId();
	const startDateField = useId();
	const endDateField = useId();
	const globalLimitField = useId();
	const maxPerUserField = useId();
	const imageField = useId();

	// Check if user is a vendor
	const isVendor = user?.role === "vendor";

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [merchantId, setMerchantId] = useState("");
	const [voucherType, setVoucherType] = useState<VoucherType | "">("");
	const [voucherValue, setVoucherValue] = useState("");
	const [voucherCode, setVoucherCode] = useState("");
	const [voucherCategory, setVoucherCategory] = useState("");
	const [status, setStatus] = useState<"active" | "inactive">("active");
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);
	const [globalLimit, setGlobalLimit] = useState("");
	const [maxPerUser, setMaxPerUser] = useState("1");
	const [image, setImage] = useState<File | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Fetch event vendors (merchants)
	const {
		data: merchants,
		isLoading: isLoadingMerchants,
		error: merchantsError,
	} = useQuery({
		queryKey: ["event", eventId.toString(), "vendors"],
		queryFn: () => getEventVendors(eventId),
	});

	// Update voucher mutation
	const updateMutation = useMutation({
		mutationFn: updateVoucher,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["vouchers"] });
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vouchers"],
			});
			toast.success("Voucher updated successfully!");
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update voucher");
		},
	});

	// Pre-populate form with existing voucher data
	useEffect(() => {
		// Parse dates safely
		const parseDateTime = (
			dateStr: string | null | undefined,
			timeStr: string | null | undefined,
		): Date | undefined => {
			if (!dateStr) return undefined;

			try {
				// If we have a time, combine date and time
				if (timeStr) {
					const dateTime = new Date(`${dateStr}T${timeStr}`);
					// Check if date is valid
					if (!isNaN(dateTime.getTime())) {
						return dateTime;
					}
				}

				// Try parsing just the date
				const date = new Date(dateStr);
				// Check if date is valid
				if (!isNaN(date.getTime())) {
					return date;
				}

				return undefined;
			} catch (error) {
				console.error("Error parsing date:", error);
				return undefined;
			}
		};

		// Always reset form with voucher data
		setTitle(voucher.title);
		setDescription(voucher.description || "");
		setMerchantId(voucher.vendorId.toString());
		setVoucherType(voucher.voucherType);
		setVoucherValue(voucher.voucherValue.toString());
		setVoucherCode(voucher.voucherCode || "");
		setVoucherCategory(voucher.voucherCategory || "");
		setStatus(voucher.status as "active" | "inactive");
		setGlobalLimit(voucher.totalRedemptionAvailable.toString());
		setMaxPerUser(voucher.maxRedemptionsPerUser.toString());
		setStartDate(parseDateTime(voucher.startDate, voucher.startTime));
		setEndDate(parseDateTime(voucher.endDate, voucher.endTime));
		setErrors({});
		setImage(null);
	}, [voucher.id, voucher.title, voucher.description, voucher.vendorId, voucher.voucherType, voucher.voucherValue, voucher.voucherCode, voucher.voucherCategory, voucher.status, voucher.totalRedemptionAvailable, voucher.maxRedemptionsPerUser, voucher.startDate, voucher.startTime, voucher.endDate, voucher.endTime]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validation
		const newErrors: Record<string, string> = {};

		if (!title.trim()) {
			newErrors.title = "Voucher title is required";
		}

		// Only validate merchantId for non-vendor users
		if (!isVendor && !merchantId) {
			newErrors.merchantId = "Please select a merchant";
		}

		if (!voucherType) {
			newErrors.voucherType = "Please select a voucher type";
		}

		if (!voucherValue || Number(voucherValue) <= 0) {
			newErrors.voucherValue = "Please enter a valid voucher value";
		}

		if (voucherType === "percentage" && Number(voucherValue) > 100) {
			newErrors.voucherValue = "Percentage cannot exceed 100";
		}

		if (!startDate) {
			newErrors.startDate = "Start date is required";
		}

		if (!endDate) {
			newErrors.endDate = "End date is required";
		}

		if (startDate && endDate && startDate >= endDate) {
			newErrors.endDate = "End date must be after start date";
		}

		if (!globalLimit || Number(globalLimit) <= 0) {
			newErrors.globalLimit = "Please enter a valid global usage limit";
		}

		if (!maxPerUser || Number(maxPerUser) <= 0) {
			newErrors.maxPerUser = "Please enter a valid max redemptions per user";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		// Format dates to YYYY-MM-DD
		const formatDate = (date: Date) => date.toISOString().split("T")[0];
		const formatTime = (date: Date) => date.toTimeString().split(" ")[0];

		updateMutation.mutate({
			id: voucher.id,
			vendor_id: Number(merchantId),
			event_id: eventId,
			title: title.trim(),
			description: description.trim() || undefined,
			voucher_code: voucherCode.trim() || undefined,
			status,
			start_date: formatDate(startDate!),
			end_date: formatDate(endDate!),
			start_time: startDate ? formatTime(startDate) : undefined,
			end_time: endDate ? formatTime(endDate) : undefined,
			total_redemption_available: Number(globalLimit),
			max_redemptions_per_user: Number(maxPerUser),
			voucher_type: voucherType as "fixed_amount" | "percentage" | "free_item",
			voucher_value: Number(voucherValue),
			voucher_category: voucherCategory.trim() || undefined,
			image: image || undefined,
		});
	};

	if (isLoadingMerchants) {
		return (
			<LoadingState
				title="Loading merchants..."
				description="Please wait..."
				height="h-[300px]"
			/>
		);
	}

	if (merchantsError) {
		return (
			<ErrorState
				title="Failed to load merchants"
				description="Please try again later"
				height="h-[300px]"
			/>
		);
	}

	if (!merchants || merchants.length === 0) {
		return (
			<EmptyState
				title="No merchants available"
				description="Please add merchants to this event first before editing vouchers."
				icon={<Building2 className="size-8" />}
				height="h-[300px]"
				action={
					<Button onClick={onClose} variant="outline">
						Close
					</Button>
				}
			/>
		);
	}

	return (
		<div className="mx-auto w-full max-w-8xl px-8">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldSeparator />
					<FieldGroup>
						{/* Voucher Details Section */}
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold text-lg">Voucher Details</h3>
								<p className="text-muted-foreground text-sm">
									Basic information attendees will see on the voucher
								</p>
							</div>

							<div className={`grid grid-cols-1 gap-4 ${isVendor ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
								{/* Voucher Title */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={voucherTitleField}>
										Voucher Title *
									</FieldLabel>
									{errors.title && <FieldError>{errors.title}</FieldError>}
									<Input
										id={voucherTitleField}
										value={title}
										onChange={(e) => {
											setTitle(e.target.value);
											if (errors.title) {
												setErrors((prev) => {
													const newErrors = { ...prev };
													delete newErrors.title;
													return newErrors;
												});
											}
										}}
										placeholder="e.g., Free Drink Combo, Buy 2 Get 1 Free"
										disabled={updateMutation.isPending}
									/>
									<FieldDescription>
										A descriptive title for the voucher
									</FieldDescription>
								</Field>

								{/* Merchant Selection - Hidden for vendors */}
								{!isVendor && (
									<Field orientation="vertical">
										<FieldLabel htmlFor={merchantField}>Merchant *</FieldLabel>
										{errors.merchantId && (
											<FieldError>{errors.merchantId}</FieldError>
										)}
										<Select
											key={`merchant-${voucher.id}-${merchantId}`}
											value={merchantId}
											onValueChange={(value) => {
												setMerchantId(value);
												if (errors.merchantId) {
													setErrors((prev) => {
														const newErrors = { ...prev };
														delete newErrors.merchantId;
														return newErrors;
													});
												}
											}}
											disabled={updateMutation.isPending}
										>
											<SelectTrigger id={merchantField}>
												<SelectValue placeholder="Select a merchant" />
											</SelectTrigger>
											<SelectContent>
												{merchants.map((merchant) => (
													<SelectItem
														key={merchant.id}
														value={merchant.vendor_id.toString()}
													>
														<div className="flex items-center gap-2">
															<Building2 className="h-4 w-4 text-muted-foreground" />
															<span>{merchant.vendor.full_name}</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldDescription>
											Select the merchant offering this voucher
										</FieldDescription>
									</Field>
								)}

								{/* Voucher Category */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={voucherCategoryField}>
										Voucher Category
									</FieldLabel>
									<Input
										id={voucherCategoryField}
										value={voucherCategory}
										onChange={(e) => setVoucherCategory(e.target.value)}
										placeholder="e.g., Food & Beverage, Merchandise"
										disabled={updateMutation.isPending}
									/>
									<FieldDescription>
										Category to organize vouchers
									</FieldDescription>
								</Field>
							</div>
						</div>

						<FieldSeparator />

						{/* Voucher Configuration Section */}
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold text-lg">Voucher Configuration</h3>
								<p className="text-muted-foreground text-sm">
									Define the voucher type and value
								</p>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								{/* Voucher Type */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={voucherTypeField}>
										Voucher Type *
									</FieldLabel>
									{errors.voucherType && (
										<FieldError>{errors.voucherType}</FieldError>
									)}
									<Select
										key={`voucher-type-${voucher.id}-${voucherType}`}
										value={voucherType}
										onValueChange={(value: VoucherType) => {
											setVoucherType(value);
											if (errors.voucherType) {
												setErrors((prev) => {
													const newErrors = { ...prev };
													delete newErrors.voucherType;
													return newErrors;
												});
											}
										}}
										disabled={updateMutation.isPending}
									>
										<SelectTrigger id={voucherTypeField}>
											<SelectValue placeholder="Select voucher type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="percentage">
												Percentage Discount
											</SelectItem>
											<SelectItem value="fixed_amount">Fixed Amount</SelectItem>
											<SelectItem value="free_item">Free Item</SelectItem>
										</SelectContent>
									</Select>
									<FieldDescription>Choose the type of voucher</FieldDescription>
								</Field>

								{/* Voucher Value */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={voucherValueField}>
										Voucher Value *
									</FieldLabel>
									{errors.voucherValue && (
										<FieldError>{errors.voucherValue}</FieldError>
									)}
									<Input
										id={voucherValueField}
										type="number"
										min="0"
										step="0.01"
										value={voucherValue}
										onChange={(e) => {
											setVoucherValue(e.target.value);
											if (errors.voucherValue) {
												setErrors((prev) => {
													const newErrors = { ...prev };
													delete newErrors.voucherValue;
													return newErrors;
												});
											}
										}}
										placeholder={
											voucherType === "percentage"
												? "e.g., 10, 20, 50"
												: "e.g., 10.00, 50.00"
										}
										disabled={updateMutation.isPending}
									/>
									<FieldDescription>
										{voucherType === "percentage"
											? "Enter percentage (1-100)"
											: voucherType === "fixed_amount"
												? "Enter amount in RM"
												: "Enter value (e.g., 1 for 1 free item)"}
									</FieldDescription>
								</Field>

								{/* Voucher Code */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={voucherCodeField}>
										Voucher Code
									</FieldLabel>
									<Input
										id={voucherCodeField}
										value={voucherCode}
										onChange={(e) => setVoucherCode(e.target.value)}
										placeholder="e.g., SAVE20"
										disabled={updateMutation.isPending}
									/>
									<FieldDescription>
										Custom code for this voucher
									</FieldDescription>
								</Field>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								{/* Description */}
								<Field orientation="vertical" className="md:col-span-2">
									<FieldLabel htmlFor={descriptionField}>
										Description
									</FieldLabel>
									<Textarea
										id={descriptionField}
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Describe the voucher details..."
										disabled={updateMutation.isPending}
										className="min-h-[80px]"
									/>
									<FieldDescription>
										Additional details about this voucher
									</FieldDescription>
								</Field>

								{/* Status */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={statusField}>Status *</FieldLabel>
									<Select
										key={`status-${voucher.id}-${status}`}
										value={status}
										onValueChange={(value: "active" | "inactive") =>
											setStatus(value)
										}
										disabled={updateMutation.isPending}
									>
										<SelectTrigger id={statusField}>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="active">Active</SelectItem>
											<SelectItem value="inactive">Inactive</SelectItem>
										</SelectContent>
									</Select>
									<FieldDescription>Set voucher status</FieldDescription>
								</Field>

								{/* Image Upload */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={imageField}>
										Voucher Image - Optional
									</FieldLabel>
									<Input
										id={imageField}
										type="file"
										accept="image/*"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												setImage(file);
											}
										}}
										disabled={updateMutation.isPending}
									/>
									<FieldDescription>
										Upload a new image for this voucher
									</FieldDescription>
								</Field>
							</div>
						</div>

						<FieldSeparator />

						{/* Validity and Usage Section */}
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold text-lg">Validity & Usage</h3>
								<p className="text-muted-foreground text-sm">
									Control when this voucher can be used and how often
								</p>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								{/* Start Date/Time */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={startDateField}>
										Start Date & Time *
									</FieldLabel>
									{errors.startDate && (
										<FieldError>{errors.startDate}</FieldError>
									)}
									<DateTimePicker
										date={startDate}
										onDateChange={(date: Date | undefined) => {
											setStartDate(date);
											if (errors.startDate) {
												setErrors((prev) => {
													const newErrors = { ...prev };
													delete newErrors.startDate;
													return newErrors;
												});
											}
										}}
										disabled={updateMutation.isPending}
										placeholder="Select start date and time"
									/>
									<FieldDescription>
										When the voucher becomes valid.
									</FieldDescription>
								</Field>

								{/* End Date/Time */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={endDateField}>
										End Date & Time *
									</FieldLabel>
									{errors.endDate && (
										<FieldError>{errors.endDate}</FieldError>
									)}
									<DateTimePicker
										date={endDate}
										onDateChange={(date: Date | undefined) => {
											setEndDate(date);
											if (errors.endDate) {
												setErrors((prev) => {
													const newErrors = { ...prev };
													delete newErrors.endDate;
													return newErrors;
												});
											}
										}}
										disabled={updateMutation.isPending}
										placeholder="Select end date and time"
									/>
									<FieldDescription>When the voucher expires.</FieldDescription>
								</Field>

								{/* Global Usage Limit */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={globalLimitField}>
										Global Usage Limit *
									</FieldLabel>
									{errors.globalLimit && (
										<FieldError>{errors.globalLimit}</FieldError>
									)}
									<Input
										id={globalLimitField}
										type="number"
										min="1"
										value={globalLimit}
										onChange={(e) => {
											setGlobalLimit(e.target.value);
											if (errors.globalLimit) {
												setErrors((prev) => {
													const newErrors = { ...prev };
													delete newErrors.globalLimit;
													return newErrors;
												});
											}
										}}
										placeholder="e.g., 100"
										disabled={updateMutation.isPending}
									/>
									<FieldDescription>
										Total number of times this voucher can be redeemed.
									</FieldDescription>
								</Field>

								{/* Max Redemptions Per User */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={maxPerUserField}>
										Max Redemptions Per User *
									</FieldLabel>
									{errors.maxPerUser && (
										<FieldError>{errors.maxPerUser}</FieldError>
									)}
									<Input
										id={maxPerUserField}
										type="number"
										min="1"
										value={maxPerUser}
										onChange={(e) => {
											setMaxPerUser(e.target.value);
											if (errors.maxPerUser) {
												setErrors((prev) => {
													const newErrors = { ...prev };
													delete newErrors.maxPerUser;
													return newErrors;
												});
											}
										}}
										placeholder="e.g., 1, 3, 5"
										disabled={updateMutation.isPending}
									/>
									<FieldDescription>
										Maximum times a single user can redeem this voucher.
									</FieldDescription>
								</Field>
							</div>
						</div>

						<FieldSeparator />

						{/* Submit Buttons - Right Aligned */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={updateMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateMutation.isPending}>
								{updateMutation.isPending ? "Updating..." : "Update Voucher"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
