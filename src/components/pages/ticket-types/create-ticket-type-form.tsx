"use client";

import { addDays, eachDayOfInterval, format, isSameDay, parseISO } from "date-fns";
import { CalendarDays, CalendarRange, Settings2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { NumberInputLabel } from "@/components/admin-ui/form/number-input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventById } from "@/lib/api/event";
import { createTicketType } from "@/lib/api/ticket-type";
import { cn } from "@/lib/utils";

interface CreateTicketTypeFormProps {
	eventId: string;
	onClose: () => void;
}

type ValidityMode = "all" | "single" | "custom";

export function CreateTicketTypeForm({
	eventId,
	onClose,
}: CreateTicketTypeFormProps) {
	const nameId = useId();
	const priceId = useId();
	const quantityId = useId();
	const maxPerOrderId = useId();
	const statusId = useId();

	// Fetch event to get start_date and end_date
	const { data: event, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	const [formData, setFormData] = useState({
		name: "",
		price: 0,
		quantity: 0,
		max_per_order: 10,
		status: "draft" as "draft" | "published" | "archived",
	});

	const [validityMode, setValidityMode] = useState<ValidityMode>("all");
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [validFromDate, setValidFromDate] = useState<Date | null>(null);
	const [validToDate, setValidToDate] = useState<Date | null>(null);

	const [errors, setErrors] = useState<Record<string, string>>({});

	const queryClient = useQueryClient();
	const createMutation = useMutation({
		mutationFn: createTicketType,
		onSuccess: () => {
			toast.success("Ticket type created successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "ticket-types"],
			});
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create ticket type");
		},
	});

	// Generate event days from start_date to end_date
	const eventDays = event?.start_date && event?.end_date
		? eachDayOfInterval({
			start: parseISO(event.start_date),
			end: parseISO(event.end_date),
		})
		: [];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const newErrors: Record<string, string> = {};

		if (!formData.name || formData.name.length < 1) {
			newErrors.name = "Name is required";
		}

		if (formData.price < 0) {
			newErrors.price = "Price must be a valid positive number";
		}

		if (formData.quantity < 0) {
			newErrors.quantity = "Quantity must be a valid positive number";
		}

		if (formData.max_per_order < 1) {
			newErrors.max_per_order = "Max per order must be at least 1";
		}

		if (validityMode === "single" && !selectedDate) {
			newErrors.selectedDate = "Please select a day";
		}

		if (validityMode === "custom") {
			if (!validFromDate) {
				newErrors.validFromDate = "Start date is required";
			}
			if (!validToDate) {
				newErrors.validToDate = "End date is required";
			}
			if (validFromDate && validToDate && validFromDate > validToDate) {
				newErrors.validToDate = "End date must be after start date";
			}
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		// Determine the dates to submit
		let submitFromDate: string | null = null;
		let submitToDate: string | null = null;

		if (validityMode === "single" && selectedDate) {
			submitFromDate = format(selectedDate, "yyyy-MM-dd");
			submitToDate = format(selectedDate, "yyyy-MM-dd");
		} else if (validityMode === "custom" && validFromDate && validToDate) {
			submitFromDate = format(validFromDate, "yyyy-MM-dd");
			submitToDate = format(validToDate, "yyyy-MM-dd");
		}

		createMutation.mutate({
			eventId,
			name: formData.name,
			price: formData.price,
			quantity: formData.quantity,
			max_per_order: formData.max_per_order,
			status: formData.status,
			valid_from_date: submitFromDate,
			valid_to_date: submitToDate,
		});
	};

	const handleChange = (field: string, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const handleDaySelect = (date: Date) => {
		setSelectedDate(date);
		if (errors.selectedDate) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors.selectedDate;
				return newErrors;
			});
		}
	};

	const isMultiDayEvent = eventDays.length > 1;

	return (
		<div className="h-full w-full p-0 md:p-4">
			<form onSubmit={handleSubmit} className="h-full">
				<div className="flex h-full flex-col justify-between gap-8">
					<div className="space-y-6">
						<InputLabel
							label="Name"
							htmlFor={nameId}
							value={formData.name}
							onChange={(value) => handleChange("name", value)}
							errors={errors.name ? [{ message: errors.name }] : undefined}
							isInvalid={!!errors.name}
							placeholder="VIP Ticket"
							required
							disabled={createMutation.isPending}
						/>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<NumberInputLabel
								label="Price"
								htmlFor={priceId}
								value={formData.price}
								onChange={(value) => handleChange("price", value)}
								errors={errors.price ? [{ message: errors.price }] : undefined}
								isInvalid={!!errors.price}
								min={0}
								step={0.01}
								placeholder="0.00"
								required
								disabled={createMutation.isPending}
							/>

							<NumberInputLabel
								label="Quantity"
								htmlFor={quantityId}
								value={formData.quantity}
								onChange={(value) => handleChange("quantity", value)}
								errors={
									errors.quantity ? [{ message: errors.quantity }] : undefined
								}
								isInvalid={!!errors.quantity}
								min={0}
								placeholder="100"
								required
								disabled={createMutation.isPending}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<NumberInputLabel
								label="Max Per Order"
								htmlFor={maxPerOrderId}
								value={formData.max_per_order}
								onChange={(value) => handleChange("max_per_order", value)}
								errors={
									errors.max_per_order
										? [{ message: errors.max_per_order }]
										: undefined
								}
								isInvalid={!!errors.max_per_order}
								min={1}
								placeholder="10"
								required
								disabled={createMutation.isPending}
							/>

							<SelectLabel
								label="Status"
								htmlFor={statusId}
								value={formData.status}
								onChange={(value) => handleChange("status", value)}
								options={[
									{ value: "draft", label: "Draft" },
									{ value: "published", label: "Published" },
									{ value: "archived", label: "Archived" },
								]}
								placeholder="Select status"
								required
								disabled={createMutation.isPending}
							/>
						</div>

						{/* Ticket Validity Section */}
						<div className="space-y-4">
							<div>
								<Label className="text-sm font-medium">Ticket Validity</Label>
								<p className="text-xs text-muted-foreground">
									Choose when this ticket can be used for check-in
								</p>
							</div>

							{isLoadingEvent ? (
								<div className="space-y-3">
									<Skeleton className="h-16 w-full" />
									<Skeleton className="h-16 w-full" />
								</div>
							) : (
								<>
									{/* Mode Selection */}
									<div className={cn(
										"grid gap-3",
										isMultiDayEvent ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
									)}>
										<button
											type="button"
											onClick={() => setValidityMode("all")}
											disabled={createMutation.isPending}
											className={cn(
												"flex items-center gap-3 rounded-none border-2 p-4 text-left transition-colors",
												validityMode === "all"
													? "border-primary bg-primary/5"
													: "border-border hover:border-primary/50"
											)}
										>
											<CalendarDays className={cn(
												"h-5 w-5",
												validityMode === "all" ? "text-primary" : "text-muted-foreground"
											)} />
											<div>
												<p className={cn(
													"font-medium text-sm",
													validityMode === "all" ? "text-primary" : "text-foreground"
												)}>
													All Event Days
												</p>
												<p className="text-xs text-muted-foreground">
													Valid for any day of the event
												</p>
											</div>
										</button>

										{isMultiDayEvent && (
											<button
												type="button"
												onClick={() => setValidityMode("single")}
												disabled={createMutation.isPending}
												className={cn(
													"flex items-center gap-3 rounded-none border-2 p-4 text-left transition-colors",
													validityMode === "single" || validityMode === "custom"
														? "border-primary bg-primary/5"
														: "border-border hover:border-primary/50"
												)}
											>
												<CalendarRange className={cn(
													"h-5 w-5",
													validityMode === "single" || validityMode === "custom" ? "text-primary" : "text-muted-foreground"
												)} />
												<div>
													<p className={cn(
														"font-medium text-sm",
														validityMode === "single" || validityMode === "custom" ? "text-primary" : "text-foreground"
													)}>
														Specific Day
													</p>
													<p className="text-xs text-muted-foreground">
														Valid only on a selected day
													</p>
												</div>
											</button>
										)}
									</div>

									{/* Day Selection Buttons */}
									{validityMode === "single" && isMultiDayEvent && (
										<div className="space-y-4">
											<div className={cn(
												"grid gap-2",
												eventDays.length <= 3 && "grid-cols-3",
												eventDays.length === 4 && "grid-cols-4",
												eventDays.length === 5 && "grid-cols-5",
												eventDays.length === 6 && "grid-cols-6",
												eventDays.length >= 7 && "grid-cols-7"
											)}>
												{eventDays.map((day, index) => (
													<button
														key={day.toISOString()}
														type="button"
														onClick={() => handleDaySelect(day)}
														disabled={createMutation.isPending}
														className={cn(
															"flex flex-col items-center rounded-none border-2 px-2 py-3 transition-colors",
															selectedDate && isSameDay(selectedDate, day)
																? "border-primary bg-primary text-primary-foreground"
																: "border-border hover:border-primary/50"
														)}
													>
														<span className="text-xs font-medium">Day {index + 1}</span>
														<span className="text-[10px] opacity-80">
															{format(day, "MMM d")}
														</span>
													</button>
												))}
											</div>

											{/* Custom Range Toggle - More prominent */}
											<button
												type="button"
												onClick={() => setValidityMode("custom")}
												disabled={createMutation.isPending}
												className="flex w-full items-center justify-center gap-2 rounded-none border border-dashed border-muted-foreground/50 py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
											>
												<Settings2 className="h-4 w-4" />
												<span>Need a custom date range?</span>
											</button>

											{errors.selectedDate && (
												<p className="text-sm text-destructive">{errors.selectedDate}</p>
											)}
										</div>
									)}

									{/* Custom Date Range */}
									{validityMode === "custom" && (
										<div className="space-y-4">
											<div className="grid grid-cols-1 gap-4 rounded-none border-2 border-dashed p-4 sm:grid-cols-2">
												<div className="space-y-2">
													<Label>Valid From</Label>
													<DatePicker
														date={validFromDate}
														onDateChange={(date) => {
															setValidFromDate(date ?? null);
															if (errors.validFromDate) {
																setErrors((prev) => {
																	const newErrors = { ...prev };
																	delete newErrors.validFromDate;
																	return newErrors;
																});
															}
														}}
														placeholder="Select start date"
														disabled={createMutation.isPending}
													/>
													{errors.validFromDate && (
														<p className="text-sm text-destructive">{errors.validFromDate}</p>
													)}
												</div>
												<div className="space-y-2">
													<Label>Valid Until</Label>
													<DatePicker
														date={validToDate}
														onDateChange={(date) => {
															setValidToDate(date ?? null);
															if (errors.validToDate) {
																setErrors((prev) => {
																	const newErrors = { ...prev };
																	delete newErrors.validToDate;
																	return newErrors;
																});
															}
														}}
														placeholder="Select end date"
														minDate={validFromDate ?? undefined}
														disabled={createMutation.isPending}
													/>
													{errors.validToDate && (
														<p className="text-sm text-destructive">{errors.validToDate}</p>
													)}
												</div>
											</div>

											{/* Back to day selection - Same design as custom range toggle */}
											{isMultiDayEvent && (
												<button
													type="button"
													onClick={() => setValidityMode("single")}
													disabled={createMutation.isPending}
													className="flex w-full items-center justify-center gap-2 rounded-none border border-dashed border-muted-foreground/50 py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
												>
													<CalendarRange className="h-4 w-4" />
													<span>Back to day selection</span>
												</button>
											)}
										</div>
									)}
								</>
							)}
						</div>
					</div>
					<div className="flex w-full flex-col gap-2 md:flex-row md:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={createMutation.isPending}
							className="rounded-none py-6 md:py-4"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={createMutation.isPending}
							className="rounded-none py-6 md:py-4"
						>
							{createMutation.isPending ? "Creating..." : "Create Ticket Type"}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
