import { useForm } from "@tanstack/react-form";
import {
	Check,
	ChevronLeft,
	Eye,
	EyeOff,
	Lock,
	Mail,
	Phone,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthForm } from "@/hooks/auth/use-auth-form";
import {
	checkAccount,
	emailSchema,
	nameSchema,
	passwordSchema,
	phoneSchema,
} from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import Loader from "./loader";
import { Button } from "./ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "./ui/input-group";
import { Label } from "./ui/label";

interface SignUpFormProps {
	onSwitchToSignIn: () => void;
	onExistingAccount?: (email: string) => void;
	initialEmail?: string;
}

export default function SignUpForm({
	onSwitchToSignIn,
	onExistingAccount,
	initialEmail = "",
}: SignUpFormProps) {
	const { isLoading, error, setError, handleRegister } = useAuthForm();
	const [step, setStep] = useState<"check_email" | "register">("check_email");
	const [emailToCheck, setEmailToCheck] = useState(initialEmail);
	const [confirmedEmail, setConfirmedEmail] = useState(initialEmail);
	const [isCheckingEmail, setIsCheckingEmail] = useState(false);
	const [emailValidationError, setEmailValidationError] = useState<
		string | null
	>(null);
	const [emailCheckError, setEmailCheckError] = useState<string | null>(null);

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	useEffect(() => {
		if (initialEmail) {
			setEmailToCheck(initialEmail);
		}
	}, [initialEmail]);

	const form = useForm({
		defaultValues: {
			name: "",
			email: confirmedEmail,
			phone: "",
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			if (value.password !== value.confirmPassword) {
				setError("Passwords do not match");
				return;
			}

			await handleRegister({
				email: confirmedEmail || value.email,
				password: value.password,
				password_confirmation: value.confirmPassword,
				full_name: value.name,
				phone: value.phone,
			});
		},
	});

	const handleCheckEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setEmailCheckError(null);

		const trimmedEmail = emailToCheck.trim().toLowerCase();
		const validationResult = emailSchema.safeParse(trimmedEmail);
		if (!validationResult.success) {
			setEmailValidationError(
				validationResult.error.issues[0]?.message || "Invalid email address",
			);
			return;
		}

		setEmailValidationError(null);
		setIsCheckingEmail(true);

		try {
			const res = await checkAccount(trimmedEmail);
			if (res.data.exists) {
				if (onExistingAccount) {
					onExistingAccount(trimmedEmail);
				} else {
					onSwitchToSignIn();
				}
			} else {
				setConfirmedEmail(trimmedEmail);
				form.setFieldValue("email", trimmedEmail);
				setStep("register");
			}
		} catch (err) {
			const msg =
				err instanceof Error
					? err.message
					: "Failed to verify email. Please try again.";
			setEmailCheckError(msg);
		} finally {
			setIsCheckingEmail(false);
		}
	};

	const handleBackToEmailCheck = () => {
		setEmailToCheck(confirmedEmail);
		setEmailValidationError(null);
		setEmailCheckError(null);
		setStep("check_email");
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader />
			</div>
		);
	}

	return (
		<div className="grid min-h-screen grid-cols-1 bg-muted/30 lg:grid-cols-5">
			{/* Left Hero Sidebar */}
			<div className="relative hidden overflow-hidden lg:col-span-2 lg:flex">
				<div className="absolute inset-0 bg-linear-to-br from-primary via-primary/90 to-background" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)] opacity-70" />
				<div className="relative z-10 flex w-full flex-col justify-between p-10 text-primary-foreground">
					<div>
						<div className="flex items-center gap-3 font-semibold text-lg">
							<span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10">
								<span className="text-2xl">⚡</span>
							</span>
							<span>EventzFlow</span>
						</div>
						<h2 className="mt-16 max-w-sm font-semibold text-3xl leading-tight">
							Join us and start managing amazing events today.
						</h2>
					</div>
					<div className="space-y-3 text-primary-foreground/70 text-sm">
						<p>Create. Manage. Succeed.</p>
						<p>Join teams running unforgettable experiences worldwide.</p>
					</div>
				</div>
			</div>

			{/* Right Content Area */}
			{step === "check_email" ? (
				<div className="flex items-center justify-center p-6 lg:col-span-3">
					<div className="w-full max-w-md space-y-8">
						<div>
							<Button
								variant="ghost"
								size="sm"
								type="button"
								onClick={onSwitchToSignIn}
								className="mb-4 -ml-3 inline-flex cursor-pointer items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
							>
								<ChevronLeft className="h-4 w-4" />
								<span>Back to sign in</span>
							</Button>
							<div className="space-y-2 text-center">
								<p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">
									Get started
								</p>
								<h1 className="font-semibold text-3xl tracking-tight">
									Continue with email
								</h1>
								<p className="text-muted-foreground text-sm">
									We'll check if you already have an account, or guide you to
									set one up if you're new.
								</p>
							</div>
						</div>

						<div className="space-y-8">
							{emailCheckError && (
								<div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
									{emailCheckError}
								</div>
							)}
							<form onSubmit={handleCheckEmailSubmit} className="space-y-5">
								<div className="space-y-2">
									<Label
										htmlFor="check-email-input"
										className="font-medium text-sm"
									>
										Email address
									</Label>
									<InputGroup
										className={cn(
											"h-12 bg-background/80 backdrop-blur",
											emailValidationError
												? "border-red-500 ring-2 ring-red-500/10"
												: "border-muted-foreground/20 ring-0",
										)}
									>
										<InputGroupAddon>
											<Mail className="h-4 w-4" />
										</InputGroupAddon>
										<InputGroupInput
											id="check-email-input"
											name="email"
											type="email"
											autoFocus
											placeholder="you@example.com"
											value={emailToCheck}
											onChange={(e) => {
												setEmailToCheck(e.target.value);
												if (emailValidationError) setEmailValidationError(null);
												if (emailCheckError) setEmailCheckError(null);
											}}
											aria-invalid={Boolean(emailValidationError)}
										/>
									</InputGroup>
									{emailValidationError && (
										<p className="text-red-500 text-sm">
											{emailValidationError}
										</p>
									)}
								</div>

								<Button
									type="submit"
									className="w-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
									size="lg"
									disabled={isCheckingEmail}
								>
									{isCheckingEmail ? (
										<>
											<span className="mr-2">Checking</span>
											<span className="inline-block animate-pulse">...</span>
										</>
									) : (
										"Continue"
									)}
								</Button>
							</form>

							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-center gap-4">
									<div className="h-px w-20 bg-linear-to-r from-transparent to-muted-foreground/30 sm:w-30" />
									<span className="text-center font-medium text-muted-foreground/80 text-xs uppercase tracking-wider">
										Already have an account?
									</span>
									<div className="h-px w-20 bg-linear-to-l from-transparent to-muted-foreground/30 sm:w-30" />
								</div>
								<Button
									variant="outline"
									type="button"
									className="group relative w-full overflow-hidden border-muted-foreground/20 font-semibold transition-all hover:border-primary/50 hover:bg-primary/5"
									onClick={onSwitchToSignIn}
								>
									<span className="relative z-10">Sign in</span>
									<div className="absolute inset-0 z-0 bg-linear-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
								</Button>
							</div>
						</div>

						<p className="text-center text-muted-foreground text-xs">
							By continuing, you agree to our Terms and Privacy Policy.
						</p>
					</div>
				</div>
			) : (
				<div className="flex items-center justify-center p-6 lg:col-span-3">
					<div className="w-full max-w-2xl space-y-8">
						<div>
							<Button
								variant="ghost"
								size="sm"
								type="button"
								onClick={handleBackToEmailCheck}
								className="mb-4 -ml-3 inline-flex cursor-pointer items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
							>
								<ChevronLeft className="h-4 w-4" />
								<span>Change email</span>
							</Button>
							<div className="space-y-2 text-center">
								<p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">
									Get started
								</p>
								<h1 className="font-semibold text-3xl tracking-tight">
									Create your EventzFlow account
								</h1>
								<p className="text-muted-foreground text-sm">
									Fill in your details to get started with event management.
								</p>
							</div>
						</div>

						<div className="space-y-8">
							{error && (
								<div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
									{error}
								</div>
							)}
							<form
								onSubmit={(e) => {
									e.preventDefault();
									e.stopPropagation();
									form.handleSubmit();
								}}
								className="space-y-5"
							>
								{/* Full Name - Full Width */}
								<form.Field
									name="name"
									validators={{
										onChange: ({ value }) => {
											const result = nameSchema.safeParse(value);
											if (!result.success) {
												return result.error.issues[0]?.message;
											}
											return undefined;
										},
										onBlur: ({ value }) => {
											const result = nameSchema.safeParse(value);
											if (!result.success) {
												return result.error.issues[0]?.message;
											}
											return undefined;
										},
									}}
								>
									{(field) => (
										<div className="space-y-2">
											<Label
												htmlFor={field.name}
												className="font-medium text-sm"
											>
												Full name
											</Label>
											<InputGroup
												className={cn(
													"h-12 bg-background/80 backdrop-blur",
													field.state.meta.errors.length > 0
														? "border-red-500 ring-2 ring-red-500/10"
														: "border-muted-foreground/20 ring-0",
												)}
											>
												<InputGroupAddon>
													<User className="h-4 w-4" />
												</InputGroupAddon>
												<InputGroupInput
													id={field.name}
													name={field.name}
													type="text"
													placeholder="John Doe"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={field.state.meta.errors.length > 0}
												/>
											</InputGroup>
											{field.state.meta.errors.length > 0 && (
												<p className="text-red-500 text-sm">
													{field.state.meta.errors[0]}
												</p>
											)}
										</div>
									)}
								</form.Field>

								{/* Email (Read-Only) and Phone - Two Columns */}
								<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
									<form.Field name="email">
										{(field) => (
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<Label
														htmlFor={field.name}
														className="font-medium text-sm"
													>
														Email address
													</Label>
													<span className="flex items-center gap-1 font-medium text-emerald-600 text-xs">
														<Check className="h-3 w-3" />
														Available
													</span>
												</div>
												<InputGroup className="h-12 border-muted-foreground/20 bg-muted/40 ring-0">
													<InputGroupAddon>
														<Mail className="h-4 w-4 text-muted-foreground" />
													</InputGroupAddon>
													<InputGroupInput
														id={field.name}
														name={field.name}
														type="email"
														readOnly
														tabIndex={-1}
														value={confirmedEmail || field.state.value}
														className="cursor-default bg-transparent text-muted-foreground selection:bg-none focus-visible:ring-0"
													/>
												</InputGroup>
												<div className="pt-0.5">
													<button
														type="button"
														onClick={handleBackToEmailCheck}
														className="cursor-pointer font-medium text-primary text-xs underline underline-offset-4 transition-colors hover:text-primary/80"
													>
														Change email
													</button>
												</div>
											</div>
										)}
									</form.Field>

									<form.Field
										name="phone"
										validators={{
											onChange: ({ value }) => {
												const result = phoneSchema.safeParse(value);
												if (!result.success) {
													return result.error.issues[0]?.message;
												}
												return undefined;
											},
											onBlur: ({ value }) => {
												const result = phoneSchema.safeParse(value);
												if (!result.success) {
													return result.error.issues[0]?.message;
												}
												return undefined;
											},
										}}
									>
										{(field) => (
											<div className="space-y-2">
												<Label
													htmlFor={field.name}
													className="font-medium text-sm"
												>
													Phone number
												</Label>
												<InputGroup
													className={cn(
														"h-12 bg-background/80 backdrop-blur",
														field.state.meta.errors.length > 0
															? "border-red-500 ring-2 ring-red-500/10"
															: "border-muted-foreground/20 ring-0",
													)}
												>
													<InputGroupAddon>
														<Phone className="h-4 w-4" />
													</InputGroupAddon>
													<InputGroupInput
														id={field.name}
														name={field.name}
														type="tel"
														placeholder="+1234567890"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														aria-invalid={field.state.meta.errors.length > 0}
													/>
												</InputGroup>
												{field.state.meta.errors.length > 0 && (
													<p className="text-red-500 text-sm">
														{String(field.state.meta.errors[0])}
													</p>
												)}
											</div>
										)}
									</form.Field>
								</div>

								{/* Password and Confirm Password - Two Columns */}
								<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
									<form.Field
										name="password"
										validators={{
											onChange: ({ value }) => {
												const result = passwordSchema.safeParse(value);
												if (!result.success) {
													return result.error.issues[0]?.message;
												}
												return undefined;
											},
											onBlur: ({ value }) => {
												const result = passwordSchema.safeParse(value);
												if (!result.success) {
													return result.error.issues[0]?.message;
												}
												return undefined;
											},
										}}
									>
										{(field) => (
											<div className="space-y-2">
												<Label
													htmlFor={field.name}
													className="font-medium text-sm"
												>
													Password
												</Label>
												<InputGroup
													className={cn(
														"h-12 bg-background/80 backdrop-blur",
														field.state.meta.errors.length > 0
															? "border-red-500 ring-2 ring-red-500/10"
															: "border-muted-foreground/20 ring-0",
													)}
												>
													<InputGroupAddon>
														<Lock className="h-4 w-4" />
													</InputGroupAddon>
													<InputGroupInput
														id={field.name}
														name={field.name}
														type={showPassword ? "text" : "password"}
														placeholder="••••••••"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														aria-invalid={field.state.meta.errors.length > 0}
													/>
													<InputGroupAddon align="inline-end">
														<InputGroupButton
															variant="ghost"
															size="icon-sm"
															type="button"
															onClick={() => setShowPassword((prev) => !prev)}
														>
															{showPassword ? (
																<EyeOff className="h-4 w-4" />
															) : (
																<Eye className="h-4 w-4" />
															)}
														</InputGroupButton>
													</InputGroupAddon>
												</InputGroup>
												{field.state.meta.errors.length > 0 && (
													<p className="text-red-500 text-sm">
														{String(field.state.meta.errors[0])}
													</p>
												)}
											</div>
										)}
									</form.Field>

									<form.Field
										name="confirmPassword"
										validators={{
											onChange: ({ value }) => {
												const result = passwordSchema.safeParse(value);
												if (!result.success) {
													return result.error.issues[0]?.message;
												}
												return undefined;
											},
											onBlur: ({ value }) => {
												const result = passwordSchema.safeParse(value);
												if (!result.success) {
													return result.error.issues[0]?.message;
												}
												return undefined;
											},
										}}
									>
										{(field) => (
											<div className="space-y-2">
												<Label
													htmlFor={field.name}
													className="font-medium text-sm"
												>
													Confirm password
												</Label>
												<InputGroup
													className={cn(
														"h-12 bg-background/80 backdrop-blur",
														field.state.meta.errors.length > 0
															? "border-red-500 ring-2 ring-red-500/10"
															: "border-muted-foreground/20 ring-0",
													)}
												>
													<InputGroupAddon>
														<Lock className="h-4 w-4" />
													</InputGroupAddon>
													<InputGroupInput
														id={field.name}
														name={field.name}
														type={showConfirmPassword ? "text" : "password"}
														placeholder="••••••••"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														aria-invalid={field.state.meta.errors.length > 0}
													/>
													<InputGroupAddon align="inline-end">
														<InputGroupButton
															variant="ghost"
															size="icon-sm"
															type="button"
															onClick={() =>
																setShowConfirmPassword((prev) => !prev)
															}
														>
															{showConfirmPassword ? (
																<EyeOff className="h-4 w-4" />
															) : (
																<Eye className="h-4 w-4" />
															)}
														</InputGroupButton>
													</InputGroupAddon>
												</InputGroup>
												{field.state.meta.errors.length > 0 && (
													<p className="text-red-500 text-sm">
														{String(field.state.meta.errors[0])}
													</p>
												)}
											</div>
										)}
									</form.Field>
								</div>

								<form.Subscribe>
									{(state) => (
										<Button
											type="submit"
											className="w-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
											size="lg"
											disabled={!state.canSubmit || state.isSubmitting}
										>
											{state.isSubmitting ? (
												<>
													<span className="mr-2">Creating account</span>
													<span className="inline-block animate-pulse">
														...
													</span>
												</>
											) : (
												"Create account"
											)}
										</Button>
									)}
								</form.Subscribe>
							</form>

							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-center gap-4">
									<div className="h-px w-20 bg-linear-to-r from-transparent to-muted-foreground/30 sm:w-40" />
									<span className="text-center font-medium text-muted-foreground/80 text-xs uppercase tracking-wider">
										Already have an account?
									</span>
									<div className="h-px w-20 bg-linear-to-l from-transparent to-muted-foreground/30 sm:w-40" />
								</div>
								<Button
									variant="outline"
									type="button"
									className="group relative w-full overflow-hidden border-muted-foreground/20 font-semibold transition-all hover:border-primary/50 hover:bg-primary/5"
									onClick={onSwitchToSignIn}
								>
									<span className="relative z-10">Sign in</span>
									<div className="absolute inset-0 z-0 bg-linear-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
								</Button>
							</div>
						</div>

						<p className="text-center text-muted-foreground text-xs">
							By continuing, you agree to our Terms and Privacy Policy.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
