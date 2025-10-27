import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useAuthForm } from "@/hooks/use-auth-form";
import { emailSchema, passwordSchema } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "./ui/input-group";
import { Label } from "./ui/label";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const { isLoading, error, handleLogin } = useAuthForm();
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			remember: false,
		},
		onSubmit: async ({ value }) => {
			await handleLogin(value.email, value.password);
		},
	});

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader />
			</div>
		);
	}

	return (
		<div className="grid min-h-screen grid-cols-1 bg-muted/30 lg:grid-cols-5">
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
							Manage every event effortlessly with real-time insights.
						</h2>
					</div>
					<div className="space-y-3 text-primary-foreground/70 text-sm">
						<p>Plan. Launch. Measure. Repeat.</p>
						<p>Trusted by teams running unforgettable experiences.</p>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-center p-6 lg:col-span-3">
				<div className="w-full max-w-md space-y-8">
					<div className="space-y-2 text-center">
						<p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">
							Welcome back
						</p>
						<h1 className="font-semibold text-3xl tracking-tight">
							Sign in to EventzFlow
						</h1>
						<p className="text-muted-foreground text-sm">
							Access analytics, manage attendees, and keep your events in sync.
						</p>
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
							className="space-y-6"
						>
							<form.Field
								name="email"
								validators={{
									onChange: ({ value }) => {
										const result = emailSchema.safeParse(value);
										if (!result.success) {
											return result.error.issues[0]?.message;
										}
										return undefined;
									},
									onBlur: ({ value }) => {
										const result = emailSchema.safeParse(value);
										if (!result.success) {
											return result.error.issues[0]?.message;
										}
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name} className="font-medium text-sm">
											Email address
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
												<Mail className="h-4 w-4" />
											</InputGroupAddon>
											<InputGroupInput
												id={field.name}
												name={field.name}
												type="email"
												placeholder="you@example.com"
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
										<Label htmlFor={field.name} className="font-medium text-sm">
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
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>

							<div className="flex items-center justify-between text-sm">
								<form.Field name="remember">
									{(field) => (
										<label
											htmlFor="remember"
											className="flex items-center gap-2 text-muted-foreground"
										>
											<Checkbox
												id="remember"
												checked={field.state.value}
												onCheckedChange={(checked) =>
													field.handleChange(Boolean(checked))
												}
											/>
											<span>Remember me</span>
										</label>
									)}
								</form.Field>
								<Button variant="link" type="button" className="px-0 text-sm">
									Forgot password?
								</Button>
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
												<span className="mr-2">Signing in</span>
												<span className="inline-block animate-pulse">...</span>
											</>
										) : (
											"Sign in"
										)}
									</Button>
								)}
							</form.Subscribe>
						</form>

						<div className="flex flex-col gap-4">
							<div className="flex items-center justify-center gap-4">
								<div className="h-px w-20 bg-linear-to-r from-transparent to-muted-foreground/30 sm:w-30" />
								<span className="text-center font-medium text-muted-foreground/80 text-xs uppercase tracking-wider">
									New to EventzFlow?
								</span>
								<div className="h-px w-20 bg-linear-to-l from-transparent to-muted-foreground/30 sm:w-30" />
							</div>
							<Button
								variant="outline"
								type="button"
								className="group relative w-full overflow-hidden border-muted-foreground/20 font-semibold transition-all hover:border-primary/50 hover:bg-primary/5"
								onClick={onSwitchToSignUp}
							>
								<span className="relative z-10">Create account</span>
								<div className="absolute inset-0 z-0 bg-linear-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
							</Button>
						</div>
					</div>

					<p className="text-center text-muted-foreground text-xs">
						By continuing, you agree to our Terms and Privacy Policy.
					</p>
				</div>
			</div>
		</div>
	);
}
