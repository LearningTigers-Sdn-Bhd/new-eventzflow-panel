"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
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

	const form = useForm({
		defaultValues: { email: "" },
		onSubmit: async ({ value }) => {
			// Validate with Zod
			const parsed = requestResetPasswordSchema.safeParse(value);
			if (!parsed.success) {
				// Let TanStack Form show a generic error
				throw new Error(parsed.error.issues[0]?.message || "Invalid email");
			}
			await requestPasswordReset(parsed.data.email);
			router.push("/login");
		},
	});

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
