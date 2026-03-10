"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { Button } from "@/components/ui/button";
import { usePublicSeatReservation } from "../session-page/hooks/use-public-seat-reservation";
import { useReservationCheckout } from "../session-page/hooks/use-reservation-checkout";

const checkoutSchema = z.object({
	full_name: z.string().min(2, "Full name is required"),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(10, "Phone number is required"),
});

interface CheckoutActionsProps {
	totalPrice: number;
}

function getErrorMessage(error: unknown) {
	if (typeof error === "string") return error;
	if (
		error &&
		typeof error === "object" &&
		"message" in error &&
		typeof (error as { message?: unknown }).message === "string"
	) {
		return (error as { message: string }).message;
	}
	return "Invalid value";
}

export default function CheckoutActions({ totalPrice }: CheckoutActionsProps) {
	const { selectedSeats } = usePublicSeatReservation();
	const { checkout, isProcessing } = useReservationCheckout();

	const form = useForm({
		defaultValues: {
			full_name: "",
			email: "",
			phone: "",
		},
		validators: {
			onChange: checkoutSchema,
		},
		onSubmit: async ({ value }) => {
			await checkout(value);
		},
	});

	const hasSelection = Object.keys(selectedSeats).length > 0;

	return (
		<div className="flex flex-1 flex-col">
			<div className="mb-8 border-b border-slate-200 pb-6 px-6 md:px-8">
				<h2 className="font-black text-2xl text-slate-900 uppercase tracking-tight">
					Guest Details
				</h2>
				<p className="font-semibold text-slate-500 text-sm">
					Please provide your information to secure your seats
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="flex flex-1 flex-col justify-between px-6 md:px-8"
			>
				<div className="space-y-6">
					<form.Field name="full_name">
						{(field) => (
							<InputLabel
								label="Full Name"
								htmlFor={field.name}
								value={field.state.value}
								onChange={field.handleChange}
								onBlur={field.handleBlur}
								isInvalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
								errors={field.state.meta.errors.map((err) => ({
									message: getErrorMessage(err),
								}))}
								placeholder="Enter your full name"
								disabled={isProcessing}
								required
								className="rounded-none border-2 border-slate-200 focus-visible:ring-0 focus-visible:border-brand-green"
							/>
						)}
					</form.Field>

					<form.Field name="email">
						{(field) => (
							<InputLabel
								label="Email Address"
								htmlFor={field.name}
								value={field.state.value}
								onChange={field.handleChange}
								onBlur={field.handleBlur}
								isInvalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
								errors={field.state.meta.errors.map((err) => ({
									message: getErrorMessage(err),
								}))}
								placeholder="you@example.com"
								disabled={isProcessing}
								required
								className="rounded-none border-2 border-slate-200 focus-visible:ring-0 focus-visible:border-brand-green"
							/>
						)}
					</form.Field>

					<form.Field name="phone">
						{(field) => (
							<InputLabel
								label="Phone Number"
								htmlFor={field.name}
								value={field.state.value}
								onChange={field.handleChange}
								onBlur={field.handleBlur}
								isInvalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
								errors={field.state.meta.errors.map((err) => ({
									message: getErrorMessage(err),
								}))}
								placeholder="+6012 345 6789"
								disabled={isProcessing}
								required
								className="rounded-none border-2 border-slate-200 focus-visible:ring-0 focus-visible:border-brand-green"
							/>
						)}
					</form.Field>
				</div>

				<div className="pt-12 pb-4">
					<Button
						type="submit"
						className="h-16 w-full rounded-none bg-brand-green text-lg font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-green/20 transition-all hover:bg-brand-green/90 active:translate-y-[2px]"
						disabled={isProcessing || !hasSelection}
					>
						{isProcessing ? "Processing..." : "Confirm Reservation"}
					</Button>
					<p className="mt-4 text-center font-bold text-[10px] text-slate-400 uppercase tracking-widest">
						By confirming, you agree to our Terms of Service
					</p>
				</div>
			</form>
		</div>
	);
}
