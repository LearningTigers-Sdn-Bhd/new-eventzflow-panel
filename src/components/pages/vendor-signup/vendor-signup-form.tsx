"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
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
import { BusinessInformationSection } from "./business-information-section";
import { EventSettingsSection } from "./event-settings-section";
import { ExhibitorKitSection } from "./exhibitor-kit-section";
import { TeamMembersSection } from "./team-members-section";
import { VendorSignupEventSidebar } from "./vendor-signup-event-sidebar";

interface EventInfo {
	id: number;
	title: string;
	description: string | null;
	start_date: string | null;
	end_date: string | null;
	booth_types: string[];
}

interface GroupInfo {
	id: number;
	name: string;
}

interface VendorSignupFormProps {
	token: string;
	event?: EventInfo;
	group?: GroupInfo | null;
	vendorType?: "Exhibitor" | "Merchant";
	useExhibitorKit?: boolean;
	guidelinesPdfUrl?: string | null;
	teamMemberLimit?: number | null;
	extraTeamMemberFee?: number | null;
	onSuccess: (eventTitle: string) => void;
	onBack: () => void;
}

export function VendorSignupForm({
	token,
	event,
	group,
	vendorType,
	useExhibitorKit = false,
	guidelinesPdfUrl,
	teamMemberLimit,
	extraTeamMemberFee,
	onSuccess,
	onBack,
}: VendorSignupFormProps) {
	const setUser = useUserSessionStore((state) => state.setUser);
	const setSessionCredentials = useUserSessionStore(
		(state) => state.setSessionCredentials,
	);

	// Team members state for exhibitor kit
	const [teamMembers, setTeamMembers] = useState<
		{ full_name: string; email: string; phone: string }[]
	>([]);

	// Vendor profile image state
	const [profileImage, setProfileImage] = useState<File | null>(null);

	const registerMutation = useMutation({
		mutationFn: registerInvitedVendor,
		onSuccess: (response) => {
			// Auto-login: Save user and session credentials to store
			const { user, access_token, expires_at } = response.data;

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
				expiresAt: new Date(expires_at).getTime(),
			});

			onSuccess(response.data.event_vendor.event_title);
			toast.success("Registration successful!", {
				description:
					"Your vendor account has been created and you're now logged in.",
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
			company_profile: "",
			redirect_url: "",
			poster_url: "",
			// Exhibitor kit fields
			booth_number: "",
			booth_type: "",
			booth_dimensions: "",
			side_wall_left_required: false,
			side_wall_right_required: false,
			name_on_fascia: "",
			fascia_upgrade_required: false,
			company_name: "",
			company_address: "",
			pic_full_name: "",
			pic_contact_number: "",
			pic_email_address: "",
		},
		onSubmit: async ({ value }) => {
			if (value.password !== value.password_confirmation) {
				toast.error("Passwords do not match");
				return;
			}

			// Validate exhibitor kit required fields
			if (useExhibitorKit) {
				if (!value.pic_full_name || !value.pic_contact_number) {
					toast.error("Please fill in required PIC details");
					return;
				}
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
					// Use exhibitor kit's PIC name and company address if available, otherwise use form values
					person_in_charge: useExhibitorKit
						? value.pic_full_name || value.person_in_charge || undefined
						: value.person_in_charge || undefined,
					address: useExhibitorKit
						? value.company_address || value.vendor_address || undefined
						: value.vendor_address || undefined,
					notes: value.vendor_notes || undefined,
					company_profile: value.company_profile || undefined,
					image: profileImage || undefined,
				},
				event_vendor: {
					redirect_url: value.redirect_url || undefined,
					poster_url: value.poster_url || undefined,
				},
				// Include exhibitor kit only when event uses exhibitor kit
				...(useExhibitorKit && {
					exhibitor_kit: {
						booth_number: value.booth_number || undefined,
						booth_type: value.booth_type || undefined,
						booth_dimensions: value.booth_dimensions || undefined,
						side_wall_left_required: value.side_wall_left_required || undefined,
						side_wall_right_required: value.side_wall_right_required || undefined,
						name_on_fascia: value.name_on_fascia || undefined,
						fascia_upgrade_required: value.fascia_upgrade_required || undefined,
						company_name: value.company_name || undefined,
						company_address: value.company_address || undefined,
						pic_full_name: value.pic_full_name,
						pic_contact_number: value.pic_contact_number,
						pic_email_address: value.pic_email_address || undefined,
						exhibitor_team_members_attributes:
							teamMembers.length > 0 ? teamMembers : undefined,
					},
				}),
			});
		},
	});

	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			<VendorSignupEventSidebar
				event={event}
				group={group}
				vendorType={vendorType}
				useExhibitorKit={useExhibitorKit}
			/>

			<PatternedLayout centered={false}>
				<div className="mx-auto w-full max-w-7xl py-6 lg:py-10">
					{/* Header */}
					<div className="mb-6 rounded-none border bg-background p-5">
						<p className="mb-1 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
							Vendor Registration
						</p>
						<h1 className="font-bold text-2xl tracking-tight">
							Create your account
						</h1>
						<p className="mt-2 text-muted-foreground text-sm">
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
									<form.Field
										name="email"
										validators={accountInfoValidators.email}
									>
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


						{/* Business Details Section - Show different sections based on exhibitor kit */}
						{useExhibitorKit ? (
							<div className="rounded-none border bg-background p-5">
							<form.Field name="vendor_category">
								{(categoryField) => (
									<form.Field name="custom_category">
										{(customCategoryField) => (
											<form.Field name="vendor_description">
												{(descriptionField) => (
													<form.Field name="company_profile">
														{(companyProfileField) => (
															<form.Field name="vendor_notes">
																{(notesField) => (
																	<BusinessInformationSection
																		categoryField={categoryField}
																		customCategoryField={customCategoryField}
																		descriptionField={descriptionField}
																		companyProfileField={companyProfileField}
																		notesField={notesField}
																		image={profileImage}
																		onImageChange={setProfileImage}
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
						) : (
						<div className="rounded-none border bg-background p-5">
							<form.Field name="vendor_category">
								{(categoryField) => (
									<form.Field name="custom_category">
										{(customCategoryField) => (
											<form.Field name="person_in_charge">
												{(personInChargeField) => (
													<form.Field name="vendor_description">
														{(descriptionField) => (
															<form.Field name="company_profile">
																{(companyProfileField) => (
																	<form.Field name="vendor_address">
																		{(addressField) => (
																			<form.Field name="vendor_notes">
																				{(notesField) => (
																					<BusinessDetailsSection
																						categoryField={categoryField}
																						customCategoryField={customCategoryField}
																						personInChargeField={personInChargeField}
																						descriptionField={descriptionField}
																						companyProfileField={companyProfileField}
																						addressField={addressField}
																						notesField={notesField}
																						image={profileImage}
																						onImageChange={setProfileImage}
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
								)}
							</form.Field>
						</div>
						)}
						{/* Exhibitor Kit Section - Only when event uses exhibitor kit */}
								{useExhibitorKit && (
							<div className="rounded-none border bg-background p-5">
								<ExhibitorKitSection
									form={form}
									guidelinesPdfUrl={guidelinesPdfUrl}
									customBoothTypes={event?.booth_types}
								/>
							</div>
						)}

						{/* Team Members Section - Only when event uses exhibitor kit */}
						{useExhibitorKit && (
							<div className="rounded-none border bg-background p-5">
								<TeamMembersSection
									teamMembers={teamMembers}
									onTeamMembersChange={setTeamMembers}
									teamMemberLimit={teamMemberLimit}
									extraTeamMemberFee={extraTeamMemberFee}
								/>
							</div>
						)}

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
										className="h-12 flex-1 rounded-none font-medium text-base"
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
