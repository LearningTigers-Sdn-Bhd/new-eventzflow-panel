"use client";

import { useForm } from "@tanstack/react-form";
import { CheckCircle2 } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/api/auth";
import { requestResetPasswordSchema } from "@/lib/api/auth/request";

export default function RequestPasswordResetPage() {
	const router = useRouter();
	const [isSuccess, setIsSuccess] = useState(false);
	const [countdown, setCountdown] = useState(3);

	const form = useForm({
		defaultValues: { email: "" },
		onSubmit: async ({ value }) => {
			// Validate with Zod
			const parsed = requestResetPasswordSchema.safeParse(value);
			if (!parsed.success) {
				// Let TanStack Form show a generic error
				throw new Error(parsed.error.issues[0]?.message || "Invalid email");
			}

			const response = await requestPasswordReset(parsed.data.email);

			// Show success state
			setIsSuccess(true);

			// Show toast notification
			toast.success("Reset link sent!", {
				description:
					response.message ||
					"Check your email for password reset instructions.",
			});

			// Start countdown
			setCountdown(3);
		},
	});

	// Handle countdown and redirect
	useEffect(() => {
		if (!isSuccess) return;

		const timer = setInterval(() => {
			setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
		}, 1000);

		return () => clearInterval(timer);
	}, [isSuccess]);

	// Navigate when countdown ends (avoid side effects inside state updater)
	useEffect(() => {
		if (isSuccess && countdown === 0) {
			router.push("/auth?login" as Route);
		}
	}, [isSuccess, countdown, router]);

	// Show success state
	if (isSuccess) {
		return (
			<Card className="w-full max-w-md">
				<CardContent className="flex flex-col items-center justify-center py-12 text-center">
					<CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
					<CardTitle className="mb-2 font-bold text-2xl">
						Reset link sent!
					</CardTitle>
					<CardDescription className="mb-6 text-base">
						Check your email for password reset instructions.
					</CardDescription>
					<p className="text-muted-foreground text-sm">
						Redirecting to login in {countdown} seconds...
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="space-y-1">
				<CardTitle className="font-bold text-2xl">
					Request password reset
				</CardTitle>
				<CardDescription>
					Enter your email to receive a password reset link.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<label htmlFor={field.name} className="font-medium text-sm">
									Email
								</label>
								<Input
									id={field.name}
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="you@example.com"
									required
								/>
								{field.state.meta.errors?.[0] ? (
									<p className="text-destructive text-sm">
										{field.state.meta.errors[0]}
									</p>
								) : null}
							</div>
						)}
					</form.Field>
					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								className="w-full"
								disabled={!state.canSubmit || state.isSubmitting}
							>
								{state.isSubmitting ? "Sending..." : "Send reset link"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</CardContent>
		</Card>
	);
}
