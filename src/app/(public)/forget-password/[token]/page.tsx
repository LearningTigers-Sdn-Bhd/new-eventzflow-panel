"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
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
			await resetPassword(parsed.data);
			router.push("/login");
		},
	});

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
