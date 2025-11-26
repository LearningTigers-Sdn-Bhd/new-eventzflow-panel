"use client";

import ImageUpload from "@/components/file-upload/image-upload";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
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
import { getEvents } from "@/lib/api/event";
import { updateVoucher, type Voucher } from "@/lib/api/voucher";
import { useAuth } from "@/hooks/use-auth";

interface EditVendorVoucherFormProps {
	voucher: Voucher;
	onClose?: () => void;
}

type VoucherType = "fixed_amount" | "percentage" | "free_item";

const VOUCHER_CATEGORIES = [
	"Food & Beverage",
	"Merchandise",
	"Services",
	"Entertainment",
	"Beauty & Wellness",
	"Travel & Transport",
	"Electronics",
	"Fashion & Apparel",
	"Health & Fitness",
	"Education",
	"Others",
] as const;

const PREDEFINED_CATEGORIES: string[] = VOUCHER_CATEGORIES.filter(
	(c): c is Exclude<typeof c, "Others"> => c !== "Others",
).map((c) => c as string);


export default function EditVendorVoucherForm({
	voucher,
	onClose,
}: EditVendorVoucherFormProps) {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	// Field IDs
	const eventField = useId();
	const voucherTitleField = useId();
	const descriptionField = useId();
	const voucherTypeField = useId();
	const voucherValueField = useId();
	const voucherCodeField = useId();
	const voucherCategoryField = useId();
	const statusField = useId();
	const startDateField = useId();
	const endDateField = useId();
	const globalLimitField = useId();
	const maxPerUserField = useId();

	// Form state
	const [selectedEventId, setSelectedEventId] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [voucherType, setVoucherType] = useState<VoucherType | "">("");
	const [voucherValue, setVoucherValue] = useState("");
	const [voucherCode, setVoucherCode] = useState("");
	const [voucherCategory, setVoucherCategory] = useState("");
	const [customCategory, setCustomCategory] = useState("");
	const [status, setStatus] = useState<"active" | "inactive">("active");
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);
	const [globalLimit, setGlobalLimit] = useState("");
	const [maxPerUser, setMaxPerUser] = useState("1");
	const [image, setImage] = useState<File | null>(null);
	const [imageRemoved, setImageRemoved] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Fetch events the vendor has access to
	const {
		data: events,
		isLoading: isLoadingEvents,
		error: eventsError,
	} = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
	});

	// Update voucher mutation
	const updateMutation = useMutation({
		mutationFn: updateVoucher,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["vendor-vouchers"] });
			queryClient.invalidateQueries({ queryKey: ["vouchers"] });
			if (selectedEventId) {
				queryClient.invalidateQueries({ queryKey: ["event", selectedEventId, "vouchers"] });
			}
			toast.success("Voucher updated successfully!");
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update voucher");
		},
	});

	// Pre-populate form with existing voucher data
	useEffect(() => {
		const parseDateTime = (
			dateStr: string | null | undefined,
			timeStr: string | null | undefined,
		): Date | undefined => {
			if (!dateStr) return undefined;
			try {
				if (timeStr) {
					const dateTime = new Date(`${dateStr}T${timeStr}`);
					if (!isNaN(dateTime.getTime())) return dateTime;
				}
				const date = new Date(dateStr);
				if (!isNaN(date.getTime())) return date;
				return undefined;
			} catch {
				return undefined;
			}
		};

		setSelectedEventId(voucher.eventId.toString());
		setTitle(voucher.title);
		setDescription(voucher.description || "");
		setVoucherType(voucher.voucherType);
		setVoucherValue(voucher.voucherValue.toString());
		setVoucherCode(voucher.voucherCode || "");
		
		const existingCategory = voucher.voucherCategory || "";
		if (!existingCategory) {
			setVoucherCategory("");
			setCustomCategory("");
		} else if (PREDEFINED_CATEGORIES.includes(existingCategory)) {
			setVoucherCategory(existingCategory);
			setCustomCategory("");
		} else {
			setVoucherCategory("Others");
			setCustomCategory(existingCategory);
		}
		
		setStatus(voucher.status as "active" | "inactive");
		setGlobalLimit(voucher.totalRedemptionAvailable.toString());
		setMaxPerUser(voucher.maxRedemptionsPerUser.toString());
		setStartDate(parseDateTime(voucher.startDate, voucher.startTime));
		setEndDate(parseDateTime(voucher.endDate, voucher.endTime));
		setErrors({});
		setImage(null);
		setImageRemoved(false);
	}, [voucher]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const newErrors: Record<string, string> = {};

		if (!selectedEventId) {
			newErrors.eventId = "Please select an event";
		}

		if (!title.trim()) {
			newErrors.title = "Voucher title is required";
		}

		if (!voucherType) {
			newErrors.voucherType = "Please select a voucher type";
		}

		if (voucherType !== "free_item") {
			if (!voucherValue || Number(voucherValue) <= 0) {
				newErrors.voucherValue = "Please enter a valid voucher value";
			}
			if (voucherType === "percentage" && Number(voucherValue) > 100) {
				newErrors.voucherValue = "Percentage cannot exceed 100";
			}
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

		if (voucherCategory === "Others" && !customCategory.trim()) {
			newErrors.customCategory = "Please enter a custom category";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		const formatDate = (date: Date) => date.toISOString().split("T")[0];
		const formatTime = (date: Date) => date.toTimeString().split(" ")[0];

		updateMutation.mutate({
			id: voucher.id,
			vendor_id: user!.id,
			event_id: Number(selectedEventId),
			title: title.trim(),
			description: description.trim() || undefined,
			voucher_code: voucherCode.trim() || null,
			status,
			start_date: formatDate(startDate!),
			end_date: formatDate(endDate!),
			start_time: startDate ? formatTime(startDate) : undefined,
			end_time: endDate ? formatTime(endDate) : undefined,
			total_redemption_available: Number(globalLimit),
			max_redemptions_per_user: Number(maxPerUser),
			voucher_type: voucherType as "fixed_amount" | "percentage" | "free_item",
			voucher_value: voucherType === "free_item" ? 0 : Number(voucherValue),
			voucher_category: voucherCategory === "Others" 
				? customCategory.trim() || undefined 
				: voucherCategory.trim() || undefined,
			image: image || undefined,
			remove_image: imageRemoved && !image ? true : undefined,
		});
	};

	if (isLoadingEvents) {
		return (
			<LoadingState
				title="Loading events..."
				description="Please wait..."
				height="h-[300px]"
			/>
		);
	}

	if (eventsError) {
		return (
			<ErrorState
				title="Failed to load events"
				description="Please try again later"
				height="h-[300px]"
			/>
		);
	}

	if (!events || events.length === 0) {
		return (
			<EmptyState
				title="No events available"
				description="You need to be assigned to an event before you can edit vouchers."
				icon={<Calendar className="size-8" />}
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

							<div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${
								voucherCategory === "Others" ? "lg:grid-cols-4" : "lg:grid-cols-3"
							}`}>
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

								{/* Event Selection */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={eventField}>Event *</FieldLabel>
									{errors.eventId && <FieldError>{errors.eventId}</FieldError>}
									<Select
										key={`event-${voucher.id}-${selectedEventId}`}
										value={selectedEventId}
										onValueChange={(value) => {
											setSelectedEventId(value);
											if (errors.eventId) {
												setErrors((prev) => {
													const newErrors = { ...prev };
													delete newErrors.eventId;
													return newErrors;
												});
											}
										}}
										disabled={updateMutation.isPending}
									>
										<SelectTrigger id={eventField}>
											<SelectValue placeholder="Select an event" />
										</SelectTrigger>
										<SelectContent>
											{events.map((event) => (
												<SelectItem key={event.id} value={event.id.toString()}>
													<div className="flex items-center gap-2">
														<Calendar className="h-4 w-4 text-muted-foreground" />
														<span>{event.title}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldDescription>
										Select the event for this voucher
									</FieldDescription>
								</Field>

								{/* Voucher Category */}
								<Field orientation="vertical">
									<FieldLabel htmlFor={voucherCategoryField}>
										Voucher Category
									</FieldLabel>
									<Select
										key={`category-${voucher.id}-${voucherCategory}`}
										value={voucherCategory}
										onValueChange={(value) => {
											setVoucherCategory(value);
											if (value !== "Others") {
												setCustomCategory("");
											}
										}}
										disabled={updateMutation.isPending}
									>
										<SelectTrigger id={voucherCategoryField}>
											<SelectValue placeholder="Select a category" />
										</SelectTrigger>
										<SelectContent>
											{VOUCHER_CATEGORIES.map((category) => (
												<SelectItem key={category} value={category}>
													{category}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldDescription>
										Category to organize vouchers
									</FieldDescription>
								</Field>

								{/* Custom Category Input */}
								{voucherCategory === "Others" && (
									<Field orientation="vertical">
										<FieldLabel htmlFor={`${voucherCategoryField}-custom`}>
											Custom Category *
										</FieldLabel>
										{errors.customCategory && (
											<FieldError>{errors.customCategory}</FieldError>
										)}
										<Input
											id={`${voucherCategoryField}-custom`}
											value={customCategory}
											onChange={(e) => {
												setCustomCategory(e.target.value);
												if (errors.customCategory) {
													setErrors((prev) => {
														const newErrors = { ...prev };
														delete newErrors.customCategory;
														return newErrors;
													});
												}
											}}
											placeholder="Enter your custom category"
											disabled={updateMutation.isPending}
										/>
										<FieldDescription>
											Enter a custom category name
										</FieldDescription>
									</Field>
								)}
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

							<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
								{/* Left Column: Form Fields */}
								<div className="space-y-4 lg:col-span-2">
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										{/* Voucher Type */}
										<Field orientation="vertical">
											<FieldLabel htmlFor={voucherTypeField}>
												Voucher Type *
											</FieldLabel>
											{errors.voucherType && (
												<FieldError>{errors.voucherType}</FieldError>
											)}
											<Select
												key={`type-${voucher.id}-${voucherType}`}
												value={voucherType}
												onValueChange={(value: VoucherType) => {
													setVoucherType(value);
													if (value === "free_item") {
														setVoucherValue("0");
													}
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
											<FieldDescription>
												Choose the type of voucher
											</FieldDescription>
										</Field>

										{/* Voucher Value */}
										{voucherType !== "free_item" && (
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
														: "Enter amount in RM"}
												</FieldDescription>
											</Field>
										)}

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
									</div>

									{/* Description */}
									<Field orientation="vertical">
										<FieldLabel htmlFor={descriptionField}>
											Description
										</FieldLabel>
										<Textarea
											id={descriptionField}
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="Describe the voucher details..."
											disabled={updateMutation.isPending}
											className="min-h-[100px]"
										/>
										<FieldDescription>
											Additional details about this voucher
										</FieldDescription>
									</Field>
								</div>

								{/* Right Column: Image Upload */}
								<div className="lg:col-span-1">
									<Field orientation="vertical">
										<FieldLabel>Voucher Image - Optional</FieldLabel>
										<ImageUpload
											value={imageRemoved ? undefined : (image || voucher.imagePath || undefined)}
											onChange={(file) => {
												if (file) {
													setImage(file);
													setImageRemoved(false);
												} else {
													setImage(null);
													setImageRemoved(true);
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

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
									<FieldDescription>
										When the voucher expires.
									</FieldDescription>
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

						{/* Submit Buttons */}
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
