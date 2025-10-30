"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resetPassword, verifyResetPasswordRequest } from "@/lib/api/auth";
import { resetPasswordSchema } from "@/lib/api/auth/request";

export default function ResetPasswordPage() {
	const router = useRouter();
	const params = useParams<{ token: string }>();
	const token = useMemo(() => String(params?.token ?? ""), [params]);
	const [isResetSuccess, setIsResetSuccess] = useState(false);
	const [countdown, setCountdown] = useState(3);

	const { isLoading, isError, isSuccess } = useQuery({
		queryKey: ["verify-reset-token", token],
		queryFn: () => verifyResetPasswordRequest(token),
		enabled: Boolean(token),
		retry: false,
	});

	useEffect(() => {
		if (isError) {
			const t = setTimeout(() => {
				router.replace("/");
			}, 3000);
			return () => clearTimeout(t);
		}
		return;
	}, [isError, router]);

	const form = useForm({
		defaultValues: {
			token,
			password: "",
			password_confirmation: "",
		},
		onSubmit: async ({ value }) => {
			const parsed = resetPasswordSchema.safeParse(value);
			if (!parsed.success) {
				throw new Error(parsed.error.issues[0]?.message || "Invalid data");
			}

			const response = await resetPassword(parsed.data);

			// Show success state
			setIsResetSuccess(true);

			// Show toast notification
			toast.success("Password reset successful!", {
				description: response.message || "Your password has been updated.",
			});

			// Start countdown
			setCountdown(3);
		},
	});

	// Handle countdown and redirect
	useEffect(() => {
		if (!isResetSuccess) return;

		const timer = setInterval(() => {
			setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
		}, 1000);

		return () => clearInterval(timer);
	}, [isResetSuccess]);

	// Navigate when countdown ends (avoid side effects inside state updater)
	useEffect(() => {
		if (isResetSuccess && countdown === 0) {
			router.push("/auth?mode=login" as Route);
		}
	}, [isResetSuccess, countdown, router]);

	// Show success state after password reset
	if (isResetSuccess) {
		return (
			<Card className="w-full max-w-md">
				<CardContent className="flex flex-col items-center justify-center py-12 text-center">
					<CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
					<CardTitle className="mb-2 font-bold text-2xl">
						Password reset successful!
					</CardTitle>
					<CardDescription className="mb-6 text-base">
						Your password has been updated successfully.
					</CardDescription>
					<p className="text-muted-foreground text-sm">
						Redirecting to login in {countdown} seconds...
					</p>
				</CardContent>
			</Card>
		);
	}

	if (isLoading || (!isSuccess && !isError)) {
		return (
			<Card>
				<LoadingState
					title="Verifying reset link..."
					description="Please wait while we validate your reset request."
					height="h-[40vh]"
				/>
			</Card>
		);
	}

	if (isError) {
		return (
			<Card>
				<ErrorState
					title="You are not allowed to reset password"
					description="The reset link is invalid or expired. Redirecting to home in 3 seconds..."
					height="h-[40vh]"
				/>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="space-y-1">
				<CardTitle className="font-bold text-2xl">Reset password</CardTitle>
				<CardDescription>
					Enter a new password for your account.
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
					<input type="hidden" name="token" value={token} />

					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<label htmlFor={field.name} className="font-medium text-sm">
									New password
								</label>
								<Input
									id={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="••••••••"
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

					<form.Field name="password_confirmation">
						{(field) => (
							<div className="space-y-2">
								<label htmlFor={field.name} className="font-medium text-sm">
									Confirm password
								</label>
								<Input
									id={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="••••••••"
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
								{state.isSubmitting ? "Resetting..." : "Reset password"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</CardContent>
		</Card>
	);
}
