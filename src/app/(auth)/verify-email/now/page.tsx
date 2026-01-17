"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "@/components/ui/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/auth/use-auth";
import { sendVerificationCode, verifyEmail } from "@/lib/api/auth";
import type { Route } from "next"; // Import Route

export default function VerifyEmailPage() {
	const router = useRouter();
    const searchParams = useSearchParams(); // Get search params
    const redirectPath = searchParams.get("redirect"); // Get redirect path
	const { user } = useAuth();
	const [isResending, setIsResending] = useState(false);
	const [cooldown, setCooldown] = useState(0);

	const form = useForm({
		defaultValues: {
			code: "",
		},
		validators: {
			onSubmit: z.object({
				code: z.string().length(6, "Please enter the full 6-digit code"),
			}),
		},
		onSubmit: async ({ value }) => {
			try {
				await verifyEmail(value.code);
				toast.success("Email verified successfully!");
				router.push((redirectPath as Route) || "/dashboard"); // Use redirectPath
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Verification failed",
				);
			}
		},
	});

	if (!user) {
		return null;
	}

	const handleResend = async () => {
		if (cooldown > 0) return;

		setIsResending(true);
		try {
			await sendVerificationCode();
			toast.success("Verification code sent to your email");
			setCooldown(60); // 60 seconds cooldown

			// Start cooldown timer
			const interval = setInterval(() => {
				setCooldown((prev) => {
					if (prev <= 1) {
						clearInterval(interval);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to resend code",
			);
		} finally {
			setIsResending(false);
		}
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="space-y-1">
				<CardTitle className="font-bold text-2xl">Verify Your Email</CardTitle>
				<CardDescription className="text-justify text-sm">
					In order to access the platform, you are required to verify your
					email. Enter the 6-digit code sent to <strong>{user.email}</strong>
				</CardDescription>
			</CardHeader>
			<CardContent className="w-full">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-8"
				>
					<FieldGroup className="flex w-full flex-col items-center justify-center">
						<FieldSet>
							<form.Field
								name="code"
								validators={{
									onChange: ({ value }) => {
										if (value.length === 6) {
											return undefined;
										}
										return "Please enter the full 6-digit code";
									},
								}}
							>
								{(field) => (
									<Field data-invalid={field.state.meta.errors.length > 0}>
										<FieldLabel>Verification Code</FieldLabel>
										<InputOTP
											maxLength={6}
											value={field.state.value}
											onChange={(value) => field.handleChange(value)}
										>
											<InputOTPGroup>
												<InputOTPSlot index={0} />
												<InputOTPSlot index={1} />
												<InputOTPSlot index={2} />
											</InputOTPGroup>
											<InputOTPSeparator />
											<InputOTPGroup>
												<InputOTPSlot index={3} />
												<InputOTPSlot index={4} />
												<InputOTPSlot index={5} />
											</InputOTPGroup>
										</InputOTP>
										{field.state.meta.errors.length > 0 && (
											<FieldError>
												{String(field.state.meta.errors[0])}
											</FieldError>
										)}
									</Field>
								)}
							</form.Field>
						</FieldSet>
					</FieldGroup>

					<form.Subscribe>
						{(state) => (
							<FieldGroup className="w-full">
								<FieldSet className="space-y-1">
									<Button
										type="submit"
										className="w-full"
										disabled={!state.canSubmit || state.isSubmitting}
									>
										{state.isSubmitting ? (
											<>
												<Spinner className="mr-2 h-4 w-4" />
												Verifying...
											</>
										) : (
											"Verify Email"
										)}
									</Button>

									<div className="text-center text-muted-foreground text-sm">
										Didn't receive the code?{" "}
										<button
											type="button"
											onClick={handleResend}
											disabled={isResending || cooldown > 0}
											className="font-medium text-primary hover:cursor-pointer hover:underline disabled:cursor-not-allowed disabled:opacity-50"
										>
											{isResending
												? "Sending..."
												: cooldown > 0
													? `Resend in ${cooldown}s`
													: "Resend code"}
										</button>
									</div>
								</FieldSet>
							</FieldGroup>
						)}
					</form.Subscribe>
				</form>
			</CardContent>
		</Card>
	);
}