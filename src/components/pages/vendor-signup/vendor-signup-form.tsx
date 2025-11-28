"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PatternedLayout } from "@/components/patterned-layout";
import { Button } from "@/components/ui/button";
import { registerInvitedVendor } from "@/lib/api/vendor-invitation";
import { useUserSessionStore } from "@/stores/new-auth-store";
import {
	AccountInfoSection,
	accountInfoValidators,
} from "./account-info-section";
import { BusinessDetailsSection } from "./business-details-section";
import { EventSettingsSection } from "./event-settings-section";
import { VendorSignupEventSidebar } from "./vendor-signup-event-sidebar";

interface EventInfo {
	id: number;
	title: string;
	description: string | null;
	start_date: string | null;
	end_date: string | null;
}

interface VendorSignupFormProps {
	token: string;
	event?: EventInfo;
	onSuccess: (eventTitle: string) => void;
	onBack: () => void;
}

export function VendorSignupForm({
	token,
	event,
	onSuccess,
	onBack,
}: VendorSignupFormProps) {
	const setUser = useUserSessionStore((state) => state.setUser);
	const setSessionCredentials = useUserSessionStore(
		(state) => state.setSessionCredentials,
	);

	const registerMutation = useMutation({
		mutationFn: registerInvitedVendor,
		onSuccess: (response) => {
			// Auto-login: Save user and session credentials to store
			const { user, access_token, refresh_token, expires_at } = response.data;
			
			setUser({
				id: user.id,
				email: user.email,
				full_name: user.full_name,
				role: user.role as "vendor",
				phone: user.phone,
				email_verified: user.email_verified,
			});

			setSessionCredentials({
				accessToken: access_token,
				refreshToken: refresh_token,
				expiresAt: new Date(expires_at).getTime(),
			});

			onSuccess(response.data.event_vendor.event_title);
			toast.success("Registration successful!", {
				description: "Your vendor account has been created and you're now logged in.",
			});
		},
		onError: (error: Error) => {
			toast.error("Registration failed", {
				description: error.message || "Please try again.",
			});
		},
	});

	const form = useForm({
		defaultValues: {
			full_name: "",
			email: "",
			phone: "",
			password: "",
			password_confirmation: "",
			vendor_description: "",
			vendor_category: "",
			custom_category: "",
			person_in_charge: "",
			vendor_address: "",
			vendor_notes: "",
			redirect_url: "",
			poster_url: "",
		},
		onSubmit: async ({ value }) => {
			if (value.password !== value.password_confirmation) {
				toast.error("Passwords do not match");
				return;
			}

			const finalCategory =
				value.vendor_category === "Others" && value.custom_category
					? value.custom_category
					: value.vendor_category;

			await registerMutation.mutateAsync({
				token,
				full_name: value.full_name,
				email: value.email,
				phone: value.phone || undefined,
				password: value.password,
				password_confirmation: value.password_confirmation,
				vendor_profile: {
					description: value.vendor_description || undefined,
					category: finalCategory || undefined,
					person_in_charge: value.person_in_charge || undefined,
					address: value.vendor_address || undefined,
					notes: value.vendor_notes || undefined,
				},
				event_vendor: {
					redirect_url: value.redirect_url || undefined,
					poster_url: value.poster_url || undefined,
				},
			});
		},
	});

	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			<VendorSignupEventSidebar event={event} />

			<PatternedLayout centered={false}>
				<div className="mx-auto w-full max-w-5xl py-6 lg:py-10">
					{/* Header */}
					<div className="mb-6 rounded-none border bg-background p-5">
						<p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
							Vendor Registration
						</p>
						<h1 className="text-2xl font-bold tracking-tight">
							Create your account
						</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							Enter your details below to register as a vendor.
						</p>
					</div>

					{/* Form */}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						{/* Account Information Section */}
						<div className="rounded-none border bg-background p-5">
							<form.Field
								name="full_name"
								validators={accountInfoValidators.fullName}
							>
								{(fullNameField) => (
									<form.Field name="email" validators={accountInfoValidators.email}>
										{(emailField) => (
											<form.Field
												name="phone"
												validators={accountInfoValidators.phone}
											>
												{(phoneField) => (
													<form.Field
														name="password"
														validators={accountInfoValidators.password}
													>
														{(passwordField) => (
															<form.Field
																name="password_confirmation"
																validators={accountInfoValidators.password}
															>
																{(passwordConfirmationField) => (
																	<AccountInfoSection
																		fullNameField={fullNameField}
																		emailField={emailField}
																		phoneField={phoneField}
																		passwordField={passwordField}
																		passwordConfirmationField={
																			passwordConfirmationField
																		}
																	/>
																)}
															</form.Field>
														)}
													</form.Field>
												)}
											</form.Field>
										)}
									</form.Field>
								)}
							</form.Field>
						</div>

						{/* Business Details Section */}
						<div className="rounded-none border bg-background p-5">
							<form.Field name="vendor_category">
								{(categoryField) => (
									<form.Field name="custom_category">
										{(customCategoryField) => (
											<form.Field name="person_in_charge">
												{(personInChargeField) => (
													<form.Field name="vendor_description">
														{(descriptionField) => (
															<form.Field name="vendor_address">
																{(addressField) => (
																	<form.Field name="vendor_notes">
																		{(notesField) => (
																			<BusinessDetailsSection
																				categoryField={categoryField}
																				customCategoryField={customCategoryField}
																				personInChargeField={personInChargeField}
																				descriptionField={descriptionField}
																				addressField={addressField}
																				notesField={notesField}
																			/>
																		)}
																	</form.Field>
																)}
															</form.Field>
														)}
													</form.Field>
												)}
											</form.Field>
										)}
									</form.Field>
								)}
							</form.Field>
						</div>

						{/* Event Settings Section */}
						<div className="rounded-none border bg-background p-5">
							<form.Field name="redirect_url">
								{(redirectUrlField) => (
									<form.Field name="poster_url">
										{(posterUrlField) => (
											<EventSettingsSection
												redirectUrlField={redirectUrlField}
												posterUrlField={posterUrlField}
											/>
										)}
									</form.Field>
								)}
							</form.Field>
						</div>

						{/* Submit Buttons */}
						<div className="flex items-center gap-3">
							<Button
								type="button"
								variant="outline"
								className="h-12 rounded-none"
								size="lg"
								onClick={onBack}
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
							<form.Subscribe>
								{(state) => (
									<Button
										type="submit"
										className="h-12 flex-1 rounded-none text-base font-medium"
										size="lg"
										disabled={!state.canSubmit || state.isSubmitting}
									>
										{state.isSubmitting ? (
											<>
												<span className="mr-2">Creating account</span>
												<span className="inline-block animate-pulse">...</span>
											</>
										) : (
											"Register as Vendor"
										)}
									</Button>
								)}
							</form.Subscribe>
						</div>
					</form>
				</div>
			</PatternedLayout>
		</div>
	);
}
