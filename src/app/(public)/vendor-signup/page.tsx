"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { AlreadyAssignedCard } from "@/components/pages/vendor-signup/already-assigned-card";
import { CheckAccountForm } from "@/components/pages/vendor-signup/check-account-form";
import { JoinEventForm } from "@/components/pages/vendor-signup/join-event-form";
import { UnauthorizedCard } from "@/components/pages/vendor-signup/unauthorized-card";
import { VendorSignInForm } from "@/components/pages/vendor-signup/vendor-signin-form";
import { VendorSignupForm } from "@/components/pages/vendor-signup/vendor-signup-form";
import { VendorSignupSuccessCard } from "@/components/pages/vendor-signup/vendor-signup-success-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { verifyVendorInviteToken } from "@/lib/api/vendor-invitation";
import { useUserSessionStore } from "@/stores/new-auth-store";

type PageState =
	| "loading"
	| "invalid_token"
	| "unauthorized"
	| "already_assigned"
	| "check_account"
	| "sign_in"
	| "join_event"
	| "registration_form"
	| "success";

function VendorSignupContent() {
	const searchParams = useSearchParams();
	const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

	const [pageState, setPageState] = useState<PageState>("loading");
	const [eventTitle, setEventTitle] = useState<string>("");
	const [eventId, setEventId] = useState<number | null>(null);
	const [accessToken, setAccessToken] = useState<string>("");
	const [isExistingVendor, setIsExistingVendor] = useState<boolean>(false);

	const { user, isLoading: isAuthLoading } = useAuth();
	// Also get sessionCredentials directly if needed for access token
	const sessionCredentials = useUserSessionStore(
		(state) => state.sessionCredentials,
	);

	const isInitialized = !isAuthLoading;

	// Decode event_id from token
	useEffect(() => {
		if (token) {
			try {
				const parts = token.split("--");
				if (parts.length >= 1) {
					const decoded = atob(parts[0]);
					const parsed = JSON.parse(decoded);
					if (parsed.event_id) {
						setEventId(parsed.event_id);
					}
				}
			} catch {
				setEventId(1);
			}
		}
	}, [token]);

	// Get stored access token if user is logged in as vendor
	const storedAccessToken = useMemo(() => {
		if (
			isInitialized &&
			sessionCredentials?.accessToken &&
			user?.role === "vendor"
		) {
			return sessionCredentials.accessToken;
		}
		return undefined;
	}, [isInitialized, sessionCredentials, user]);

	// Verify token (pass access token if logged in to check assignment)
	const {
		data: verifyData,
		isLoading: isVerifying,
		isError: isVerifyError,
		error: verifyError,
	} = useQuery({
		queryKey: ["verify-vendor-invite", eventId, token, storedAccessToken],
		queryFn: () =>
			verifyVendorInviteToken(eventId as number, token, storedAccessToken),
		enabled: Boolean(token) && Boolean(eventId) && isInitialized,
		retry: false,
	});

	// Check if user is logged in with non-vendor role
	const isNonVendorAuthenticated = useMemo(() => {
		if (isInitialized && sessionCredentials?.accessToken && user) {
			return user.role !== "vendor";
		}
		return false;
	}, [isInitialized, sessionCredentials, user]);

	// Update page state based on verification result
	useEffect(() => {
		// Don't override state if we're already in a "final" or "in-progress" state
		// This prevents the query re-run from overriding user actions
		if (
			pageState === "success" ||
			pageState === "registration_form" ||
			pageState === "sign_in" ||
			pageState === "join_event"
		) {
			return;
		}

		if (!token) {
			setPageState("invalid_token");
		} else if (!isInitialized || isVerifying || !eventId) {
			setPageState("loading");
		} else if (isNonVendorAuthenticated) {
			// User is logged in but not as a vendor
			setPageState("unauthorized");
		} else if (isVerifyError) {
			setPageState("invalid_token");
		} else if (verifyData) {
			if (verifyData.data?.event?.title) {
				setEventTitle(verifyData.data.event.title);
			}

			// Check if vendor is already assigned to this event
			if (verifyData.data?.is_assigned) {
				setPageState("already_assigned");
			}
			// Check if vendor is authenticated but not assigned - skip to join form
			else if (verifyData.data?.is_authenticated && storedAccessToken) {
				setAccessToken(storedAccessToken);
				setPageState("join_event");
			}
			// Not authenticated - show account check form
			else {
				setPageState("check_account");
			}
		}
	}, [
		token,
		isInitialized,
		isVerifying,
		isVerifyError,
		verifyData,
		eventId,
		storedAccessToken,
		pageState,
		isNonVendorAuthenticated,
	]);

	const event = verifyData?.data?.event;
	const group = verifyData?.data?.group;
	const vendorType = verifyData?.data?.vendor_type;
	const useExhibitorKit = verifyData?.data?.use_exhibitor_kit ?? false;
	const guidelinesPdfUrl = verifyData?.data?.guidelines_pdf_url ?? null;
	const teamMemberLimit = verifyData?.data?.team_member_limit ?? null;
	const extraTeamMemberFee = verifyData?.data?.extra_team_member_fee ?? null;

	const handleSignIn = () => {
		setPageState("sign_in");
	};

	const handleCreateAccount = () => {
		setPageState("registration_form");
	};

	const handleSignInSuccess = async (newAccessToken: string) => {
		setAccessToken(newAccessToken);
		// Re-verify token with new access token to check if already assigned
		setPageState("loading");
		try {
			const result = await verifyVendorInviteToken(
				eventId as number,
				token,
				newAccessToken,
			);
			if (result.data?.is_assigned) {
				setPageState("already_assigned");
			} else {
				setPageState("join_event");
			}
		} catch {
			// If verification fails, still try to join
			setPageState("join_event");
		}
	};

	const handleBackToOptions = () => {
		setPageState("check_account");
	};

	const handleJoinSuccess = () => {
		setIsExistingVendor(true);
		setPageState("success");
	};

	const handleRegistrationSuccess = (title: string) => {
		setEventTitle(title);
		setIsExistingVendor(false);
		setPageState("success");
	};

	// Render based on state
	switch (pageState) {
		case "loading":
			return (
				<div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
					<Card className="w-full max-w-lg shadow-lg">
						<LoadingState
							title="Verifying invitation..."
							description="Please wait while we validate your invitation link."
							height="h-[40vh]"
						/>
					</Card>
				</div>
			);

		case "invalid_token": {
			const errorMessage =
				verifyError instanceof Error
					? verifyError.message
					: !token
						? "No invitation token provided. Please use a valid invitation link from your event organizer."
						: "This invitation link is invalid or has expired.";

			return (
				<div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
					<Card className="w-full max-w-lg shadow-lg">
						<ErrorState
							title="Invalid Invitation"
							description={errorMessage}
							height="h-[40vh]"
						/>
						<CardContent className="pt-0">
							<div className="flex justify-center">
								<Button variant="outline" asChild>
									<Link href="/">Go to Homepage</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			);
		}

		case "unauthorized":
			return <UnauthorizedCard />;

		case "already_assigned":
			return <AlreadyAssignedCard event={event} />;

		case "check_account":
			return (
				<CheckAccountForm
					event={event}
					group={group}
					vendorType={vendorType}
					useExhibitorKit={useExhibitorKit}
					onSignIn={handleSignIn}
					onCreateAccount={handleCreateAccount}
				/>
			);

		case "sign_in":
			return (
				<VendorSignInForm
					event={event}
					group={group}
					vendorType={vendorType}
					useExhibitorKit={useExhibitorKit}
					onSuccess={handleSignInSuccess}
					onBack={handleBackToOptions}
				/>
			);

		case "join_event":
			return (
				<JoinEventForm
					event={event}
					group={group}
					vendorType={vendorType}
					useExhibitorKit={useExhibitorKit}
					guidelinesPdfUrl={guidelinesPdfUrl}
					teamMemberLimit={teamMemberLimit}
					extraTeamMemberFee={extraTeamMemberFee}
					token={token}
					accessToken={accessToken}
					onSuccess={handleJoinSuccess}
				/>
			);

		case "registration_form":
			return (
				<VendorSignupForm
					token={token}
					event={event}
					group={group}
					vendorType={vendorType}
					useExhibitorKit={useExhibitorKit}
					guidelinesPdfUrl={guidelinesPdfUrl}
					teamMemberLimit={teamMemberLimit}
					extraTeamMemberFee={extraTeamMemberFee}
					onSuccess={handleRegistrationSuccess}
					onBack={handleBackToOptions}
				/>
			);

		case "success":
			return (
				<VendorSignupSuccessCard
					eventTitle={eventTitle || event?.title || "Event"}
					isExistingVendor={isExistingVendor}
				/>
			);

		default:
			return null;
	}
}

export default function VendorSignupPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<LoadingState
						title="Loading..."
						description="Please wait..."
						height="h-[40vh]"
					/>
				</div>
			}
		>
			<VendorSignupContent />
		</Suspense>
	);
}
