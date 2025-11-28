"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { PatternedLayout } from "@/components/patterned-layout";
import { VendorSignupEventSidebar } from "./vendor-signup-event-sidebar";

interface EventInfo {
	id: number;
	title: string;
	description: string | null;
	start_date: string | null;
	end_date: string | null;
}

interface VendorSignInFormProps {
	event: EventInfo | undefined;
	onSuccess: (accessToken: string, refreshToken: string) => void;
	onBack: () => void;
}

export function VendorSignInForm({
	event,
	onSuccess,
	onBack,
}: VendorSignInFormProps) {
	const [showPassword, setShowPassword] = useState(false);

	const loginMutation = useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) =>
			login(email, password),
		onSuccess: (response) => {
			if (response.data.user.role !== "vendor") {
				toast.error("Invalid account type", {
					description: "Please use a vendor account to join this event.",
				});
				return;
			}
			onSuccess(response.data.access_token, response.data.refresh_token);
		},
		onError: (error: Error) => {
			toast.error("Sign in failed", {
				description: error.message || "Invalid email or password.",
			});
		},
	});

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await loginMutation.mutateAsync({
				email: value.email,
				password: value.password,
			});
		},
	});

	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			<VendorSignupEventSidebar event={event} />

			<PatternedLayout>
				<div className="w-full max-w-md space-y-4">
					{/* Back button */}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="rounded-none"
						onClick={onBack}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to options
					</Button>

					{/* Header */}
					<div className="rounded-none border bg-background p-5">
						<p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
							Sign In
						</p>
						<h1 className="text-2xl font-bold tracking-tight">
							Welcome back!
						</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							Sign in to join {event?.title} as a vendor
						</p>
					</div>

					{/* Form */}
					<div className="rounded-none border bg-background p-5">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-4"
						>
							<form.Field name="email">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Email</Label>
										<InputGroup
											className={cn(
												"h-12 border-input bg-background",
												field.state.meta.errors.length > 0 &&
													"border-destructive",
											)}
										>
											<InputGroupAddon>
												<Mail className="h-4 w-4" />
											</InputGroupAddon>
											<InputGroupInput
												id={field.name}
												type="email"
												placeholder="vendor@example.com"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												autoFocus
											/>
										</InputGroup>
									</div>
								)}
							</form.Field>

							<form.Field name="password">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Password</Label>
										<InputGroup
											className={cn(
												"h-12 border-input bg-background",
												field.state.meta.errors.length > 0 &&
													"border-destructive",
											)}
										>
											<InputGroupAddon>
												<Lock className="h-4 w-4" />
											</InputGroupAddon>
											<InputGroupInput
												id={field.name}
												type={showPassword ? "text" : "password"}
												placeholder="Enter your password"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
											/>
											<InputGroupButton
												type="button"
												onClick={() => setShowPassword(!showPassword)}
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</InputGroupButton>
										</InputGroup>
									</div>
								)}
							</form.Field>

							<div className="pt-2">
								<Button
									type="submit"
									className="h-12 w-full rounded-none"
									size="lg"
									disabled={loginMutation.isPending}
								>
									{loginMutation.isPending ? "Signing in..." : "Sign In"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</PatternedLayout>
		</div>
	);
}
