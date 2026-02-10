"use client";

import { useForm } from "@tanstack/react-form";
import { UserIcon } from "lucide-react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSeatReservation } from "../seat-reservation-session-provider";
import CheckoutActions from "./checkout-actions";
import SeatSummary from "./seat-summary";

export default function SeatReservationCheckoutPage() {
	const router = useRouter();
	const params = useParams();
	const eventSlug = params.slug as string | undefined;
	const sessionIdentifier = params["slug-or-public-id"] as string | undefined;
	const { selectedSeats, totalPrice, checkout, isProcessing, session } =
		useSeatReservation();

	const form = useForm({
		defaultValues: {
			full_name: "",
			email: "",
			phone: "",
		},
		onSubmit: async ({ value }) => {
			await checkout(value);
		},
	});

	const handleBackToSeats = () => {
		if (!eventSlug || !sessionIdentifier) return;
		router.push(
			`/events/${eventSlug}/seat-reservations/${sessionIdentifier}` as Route,
		);
	};

	if (selectedSeats.size === 0) {
		return (
			<main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
				<div className="max-w-md w-full bg-white border border-slate-200 p-8 text-center shadow-sm">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
						🪑
					</div>
					<h2 className="text-xl font-bold text-slate-900 mb-2">
						No seats locked
					</h2>
					<p className="text-slate-600 mb-6">
						Select seats on the session page before checking out.
					</p>
					<Button
						type="button"
						className="h-11 w-full rounded-none bg-brand-green text-white hover:bg-brand-green/90"
						onClick={handleBackToSeats}
					>
						Back to seat selection
					</Button>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-slate-50 px-4 py-10">
			<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
				<header className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
						Seat Reservation Checkout
					</p>
					<h1 className="text-2xl font-black text-slate-900 md:text-3xl">
						Confirm your reservation
					</h1>
				</header>

				<section className="bg-white border shadow-sm p-6">
					<h2 className="text-lg font-bold text-slate-900 mb-4">
						Locked Seats ({selectedSeats.size})
					</h2>
					<SeatSummary selectedSeats={selectedSeats} session={session} />
				</section>

				<section className="bg-white border shadow-sm p-6">
					<h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
						<UserIcon className="h-4 w-4" />
						Visitor Information
					</h3>
					<Separator className="my-4" />
					<form
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="full_name">Full Name</Label>
							<form.Field
								name="full_name"
								// biome-ignore lint: handled by form library render prop
								children={(field) => (
									<Input
										id="full_name"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Enter your full name"
										required
										className="rounded-none focus-visible:ring-brand-green"
									/>
								)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<form.Field
								name="email"
								// biome-ignore lint: handled by form library render prop
								children={(field) => (
									<Input
										id="email"
										type="email"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Enter your email"
										required
										className="rounded-none focus-visible:ring-brand-green"
									/>
								)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
							<form.Field
								name="phone"
								// biome-ignore lint: handled by form library render prop
								children={(field) => (
									<Input
										id="phone"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Enter your phone number"
										required
										className="rounded-none focus-visible:ring-brand-green"
									/>
								)}
							/>
						</div>

						<CheckoutActions
							totalPrice={totalPrice}
							isProcessing={isProcessing}
							onCancel={handleBackToSeats}
						/>
					</form>
				</section>
			</div>
		</main>
	);
}
