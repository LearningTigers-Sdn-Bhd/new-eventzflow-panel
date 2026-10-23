"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/auth/use-auth";

export default function VerifyEmailLandingPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectPath = searchParams.get("redirect");
	const { user } = useAuth();

	if (!user) {
		return null;
	}

	// If user is already verified, immediately redirect to destination or dashboard
	if (user.email_verified) {
		router.replace((redirectPath ? redirectPath : "/dashboard") as Route);
		return null;
	}

	const handleVerifyNow = () => {
		router.push(
			redirectPath
				? `/verify-email/now?redirect=${encodeURIComponent(redirectPath)}`
				: ("/verify-email/now" as Route),
		);
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="space-y-1">
				<CardTitle className="font-bold text-2xl">
					Email Verification Required
				</CardTitle>
				<CardDescription>
					Your account is not verified yet. Please verify your email to
					continue.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<Button onClick={handleVerifyNow} className="w-full" size="lg">
					Verify Now
				</Button>

				{redirectPath && (
					<Button
						variant="outline"
						onClick={() => router.push(redirectPath as Route)}
						className="w-full"
					>
						Return to Invitation
					</Button>
				)}

				<div className="pt-2 text-center text-muted-foreground text-sm">
					Need to change your email?{" "}
					<button
						type="button"
						onClick={() => router.push("/settings")}
						className="font-medium text-primary hover:underline"
					>
						Update email
					</button>
				</div>
			</CardContent>
		</Card>
	);
}
