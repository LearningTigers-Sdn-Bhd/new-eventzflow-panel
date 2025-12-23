"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDialog } from "@/hooks/use-dialog"; // Import useDialog
import { createBooking } from "@/lib/api/business-matching";

interface CreateBookingFormProps {
	bmEventId: string;
	eventId: string;
	initialDate?: string;
	initialTime?: string;
	onClose: () => void;
}

export default function CreateBookingForm({
	bmEventId,
	eventId,
	initialDate,
	initialTime,
	onClose,
}: CreateBookingFormProps) {
	const { closeDialog } = useDialog(); // Use the hook
	const queryClient = useQueryClient();
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const dateId = useId();
	const timeId = useId();

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		date: initialDate || "",
		time: initialTime || "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (initialDate) setFormData((prev) => ({ ...prev, date: initialDate }));
		if (initialTime) setFormData((prev) => ({ ...prev, time: initialTime }));
	}, [initialDate, initialTime]);

	const createBookingMutation = useMutation({
		mutationFn: (data: typeof formData) =>
			createBooking(bmEventId, eventId, data),
		onSuccess: () => {
			toast.success("Booking created successfully!");
			queryClient.invalidateQueries({
				queryKey: ["business-matching-bookings", bmEventId, eventId],
			});
			queryClient.invalidateQueries({
				queryKey: ["business-matching-availability", bmEventId, eventId],
			});
			onClose(); // Resets the selected slot in AvailabilityDialog
			closeDialog(); // Closes the main UniversalDialog
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create booking");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) newErrors.name = "Name is required";
		if (!formData.date.trim()) newErrors.date = "Date is required";
		if (!formData.time.trim()) newErrors.time = "Time is required";

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		createBookingMutation.mutate(formData);
	};

	const handleChange = (field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<FieldSet>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor={nameId}>Name *</FieldLabel>
						{errors.name && <FieldError>{errors.name}</FieldError>}
						<Input
							id={nameId}
							value={formData.name}
							onChange={(e) => handleChange("name", e.target.value)}
							placeholder="Enter attendee name"
							autoFocus
						/>
					</Field>

					<div className="grid grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor={emailId}>Email</FieldLabel>
							<Input
								id={emailId}
								type="email"
								value={formData.email}
								onChange={(e) => handleChange("email", e.target.value)}
								placeholder="Enter email"
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor={phoneId}>Phone</FieldLabel>
							<Input
								id={phoneId}
								type="tel"
								value={formData.phone}
								onChange={(e) => handleChange("phone", e.target.value)}
								placeholder="Enter phone number"
							/>
						</Field>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor={dateId}>Date *</FieldLabel>
							{errors.date && <FieldError>{errors.date}</FieldError>}
							<Input
								id={dateId}
								value={formData.date}
								onChange={(e) => handleChange("date", e.target.value)}
								placeholder="Select a date"
								disabled
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor={timeId}>Time *</FieldLabel>
							{errors.time && <FieldError>{errors.time}</FieldError>}
							<Input
								id={timeId}
								value={formData.time}
								onChange={(e) => handleChange("time", e.target.value)}
								placeholder="Select a time"
								disabled
							/>
						</Field>
					</div>
				</FieldGroup>

				<div className="mt-4 flex justify-end gap-2">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" disabled={createBookingMutation.isPending}>
						{createBookingMutation.isPending ? "Creating..." : "Create Booking"}
					</Button>
				</div>
			</FieldSet>
		</form>
	);
}
