"use client";

import {
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	Building2,
	CheckCircle2,
	Copy,
	ExternalLink,
	Info,
	Loader2,
	LogOut,
	Mail,
	MapPin,
	ShieldAlert,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth/use-auth";
import {
	useAcceptHostInvite,
	useHostInviteDetails,
} from "@/hooks/use-business-matching-public";
import { checkAccount } from "@/lib/api/auth";
import { useUserSessionStore } from "@/stores/new-auth-store";

export function InviteHostContent({
	token,
	selfPath,
}: {
	token: string | null;
	selfPath: string;
}) {
	const router = useRouter();
	const { user, isAuthenticated, isInitialized, logout, forceRefresh } =
		useAuth();
	const { mutate: acceptInvite, isPending } = useAcceptHostInvite();
	const {
		data: inviteDetails,
		isLoading: isLoadingDetails,
		isError: isDetailsError,
	} = useHostInviteDetails(token);

	const [isSuccess, setIsSuccess] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [copied, setCopied] = useState(false);

	// Single email entry state for frictionless onboarding
	const [emailInput, setEmailInput] = useState("");
	const [isCheckingEmail, setIsCheckingEmail] = useState(false);
	const [emailError, setEmailError] = useState<string | null>(null);

	const handleEmailContinue = async (e: React.FormEvent) => {
		e.preventDefault();
		setEmailError(null);

		const trimmedEmail = emailInput.trim().toLowerCase();
		if (!trimmedEmail) {
			setEmailError("Please enter your business email");
			return;
		}

		// Simple RFC 5322 regex for email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(trimmedEmail)) {
			setEmailError("Please enter a valid email address");
			return;
		}

		setIsCheckingEmail(true);
		try {
			const res = await checkAccount(trimmedEmail);
			const redirectPath = encodeURIComponent(selfPath);
			const encodedEmail = encodeURIComponent(trimmedEmail);

			if (res.data?.exists) {
				toast.info("Account found! Please sign in to claim your table.");
				router.push(
					`/auth?login&email=${encodedEmail}&redirect=${redirectPath}&existing=true`,
				);
			} else {
				toast.info("New host detected! Create a password to claim your table.");
				router.push(
					`/auth?register&email=${encodedEmail}&redirect=${redirectPath}`,
				);
			}
		} catch {
			// Fallback: If network check fails, route to login with email prefilled
			const redirectPath = encodeURIComponent(selfPath);
			const encodedEmail = encodeURIComponent(trimmedEmail);
			router.push(`/auth?login&email=${encodedEmail}&redirect=${redirectPath}`);
		} finally {
			setIsCheckingEmail(false);
		}
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			toast.success("Invitation link copied to clipboard!");
			setTimeout(() => setCopied(false), 2500);
		} catch {
			toast.error("Failed to copy link");
		}
	};

	const handleSwitchAccount = async () => {
		setIsLoggingOut(true);
		try {
			await logout();
			const redirectPath = encodeURIComponent(selfPath);
			router.push(`/auth?login&redirect=${redirectPath}`);
		} catch {
			toast.error("Failed to sign out. Please try again.");
		} finally {
			setIsLoggingOut(false);
		}
	};

	const handleAccept = () => {
		if (!token) return;
		acceptInvite(
			{ token },
			{
				onSuccess: async () => {
					// Pre-emptively ensure local session user is marked verified
					const store = useUserSessionStore.getState();
					if (store.user && !store.user.email_verified) {
						store.setUser({
							...store.user,
							email_verified: true,
						});
					}
					await forceRefresh();
					toast.success("Successfully joined as Business Host!");
					setIsSuccess(true);
				},
				onError: (error) => {
					toast.error("Failed to join", { description: error.message });
				},
			},
		);
	};

	if (!isInitialized || isLoadingDetails) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-muted-foreground text-sm">
					Loading invitation details...
				</p>
			</div>
		);
	}

	if (!token || isDetailsError || !inviteDetails) {
		return (
			<div className="container mx-auto max-w-md px-4 py-16">
				<Card className="border-destructive/30 shadow-sm">
					<CardHeader className="text-center">
						<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
							<AlertTriangle className="h-6 w-6" />
						</div>
						<CardTitle className="text-destructive">
							Invalid or Expired Invitation
						</CardTitle>
						<CardDescription className="pt-2 text-sm leading-relaxed">
							This invite link is either expired, invalid, or has already been
							revoked. Please contact the event organizer for a fresh link.
						</CardDescription>
					</CardHeader>
					<CardFooter className="flex justify-center">
						<Link href="/dashboard" passHref>
							<Button variant="outline" size="sm">
								Go to Dashboard
							</Button>
						</Link>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// 1. Not Authenticated State
	if (!isAuthenticated) {
		const redirectPath = encodeURIComponent(selfPath);
		return (
			<div className="container mx-auto max-w-md px-4 py-16">
				<Card className="shadow-md">
					<CardHeader className="text-center">
						{inviteDetails.event_logo_url && (
							<div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full border">
								<Image
									src={inviteDetails.event_logo_url}
									alt={inviteDetails.event_title}
									width={64}
									height={64}
									className="h-full w-full object-cover"
								/>
							</div>
						)}
						<Badge variant="outline" className="mx-auto mb-2">
							Business Host Invitation
						</Badge>
						<CardTitle className="text-xl font-bold">
							{inviteDetails.session_title}
						</CardTitle>
						<CardDescription className="text-sm">
							at <strong className="text-foreground">{inviteDetails.event_title}</strong>
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="space-y-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
							{inviteDetails.session_location && (
								<div className="flex items-center gap-2">
									<MapPin className="h-3.5 w-3.5 text-primary" />
									<span>{inviteDetails.session_location}</span>
								</div>
							)}
							<div className="flex items-center gap-2">
								<Building2 className="h-3.5 w-3.5 text-primary" />
								<span>
									{inviteDetails.slot_duration}-minute meeting slots
								</span>
							</div>
						</div>

						{/* Single Email Entry Form */}
						<form onSubmit={handleEmailContinue} className="space-y-3 pt-1">
							<div className="space-y-1.5">
								<label
									htmlFor="host-invite-email"
									className="text-xs font-medium text-foreground"
								>
									Enter your email to claim this host table:
								</label>
								<div className="relative">
									<Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										id="host-invite-email"
										type="email"
										autoComplete="email"
										autoFocus
										placeholder="e.g. name@company.com"
										value={emailInput}
										onChange={(e) => {
											setEmailInput(e.target.value);
											if (emailError) setEmailError(null);
										}}
										className="pl-9 text-sm"
										disabled={isCheckingEmail}
									/>
								</div>
								{emailError && (
									<p className="text-xs text-destructive">{emailError}</p>
								)}
								<p className="text-[11px] text-muted-foreground">
									We will check if you have an account or guide you to set up your host profile.
								</p>
							</div>

							<Button
								type="submit"
								className="w-full gap-2"
								disabled={isCheckingEmail}
							>
								{isCheckingEmail ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Checking account...
									</>
								) : (
									<>
										Continue
										<ArrowRight className="h-4 w-4" />
									</>
								)}
							</Button>
						</form>
					</CardContent>

					<CardFooter className="flex flex-col gap-2 pt-0">
						<div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
							<Link
								href={`/auth?login&redirect=${redirectPath}`}
								className="underline hover:text-foreground"
							>
								Sign In manually
							</Link>
							<span>•</span>
							<Link
								href={`/auth?register&redirect=${redirectPath}`}
								className="underline hover:text-foreground"
							>
								Create Account manually
							</Link>
						</div>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// 2. Successful Claim State
	if (isSuccess) {
		return (
			<div className="container mx-auto max-w-md px-4 py-16">
				<Card className="border-green-200 bg-green-50/20 text-center shadow-md dark:border-green-900 dark:bg-green-950/20">
					<CardHeader>
						<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
							<CheckCircle2 className="h-6 w-6" />
						</div>
						<CardTitle className="text-xl text-green-700 dark:text-green-300">
							Invitation Accepted!
						</CardTitle>
						<CardDescription className="text-sm">
							You are now the Business Host for{" "}
							<strong>{inviteDetails.session_title}</strong> at{" "}
							<strong>{inviteDetails.event_title}</strong>.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-xs text-muted-foreground">
						You can now set up your company bio, sourcing capabilities, and view
						pre-scheduled buyer meetings.
					</CardContent>
					<CardFooter>
						<Button
							className="w-full"
							onClick={() =>
								router.push(
									`/event/${inviteDetails.event_id}/business-matching`,
								)
							}
						>
							Go to Business Matching Dashboard
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	const isOrganizerOrAdmin =
		inviteDetails.is_current_user_admin ||
		user?.role === "org_owner" ||
		user?.role === "organizer";

	// 3. Organizer / Admin Viewing State
	// Solves the core UX confusion where event creators test their own links
	if (isOrganizerOrAdmin) {
		return (
			<div className="container mx-auto max-w-lg px-4 py-12">
				<Card className="border-amber-300 shadow-md dark:border-amber-800">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<Badge
								variant="outline"
								className="border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
							>
								<ShieldAlert className="mr-1 h-3.5 w-3.5" />
								Organizer View
							</Badge>
							<span className="text-xs text-muted-foreground">
								Logged in as Admin
							</span>
						</div>
						<CardTitle className="pt-2 text-lg">
							Host Invitation Preview: {inviteDetails.session_title}
						</CardTitle>
						<CardDescription className="text-xs">
							Event: {inviteDetails.event_title}
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<Alert className="border-amber-200 bg-amber-50/60 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
							<Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
							<AlertTitle className="text-sm font-semibold">
								You are viewing this as an Event Organizer
							</AlertTitle>
							<AlertDescription className="mt-1 text-xs leading-relaxed">
								You are logged in with <strong>{user?.email}</strong>. Organizers
								manage the event and <strong>cannot</strong> join tables as a
								Business Host. Do not accept this invitation with your admin
								account.
							</AlertDescription>
						</Alert>

						<div className="space-y-2 rounded-lg border bg-muted/40 p-3 text-xs">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Assigned Table:</span>
								<span className="font-medium text-foreground">
									{inviteDetails.session_title}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Table Status:</span>
								<span className="font-medium text-foreground">
									{inviteDetails.is_assigned ? (
										<span className="text-amber-600">
											Claimed by {inviteDetails.current_host_name || inviteDetails.current_host_email}
										</span>
									) : (
										<span className="text-green-600">Available to claim</span>
									)}
								</span>
							</div>
							{inviteDetails.session_location && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Location:</span>
									<span className="text-foreground">
										{inviteDetails.session_location}
									</span>
								</div>
							)}
						</div>

						<div className="space-y-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
							<p className="font-medium text-foreground">
								How to test or send this link:
							</p>
							<ul className="list-inside list-disc space-y-1">
								<li>
									<strong>Send to Host/Seller:</strong> Copy this link and send it
									via WhatsApp or Email to your seller.
								</li>
								<li>
									<strong>Test Seller Experience:</strong> Copy the link and open
									it in an <strong>Incognito / Private Window</strong>.
								</li>
							</ul>
						</div>
					</CardContent>

					<CardFooter className="flex flex-col gap-2">
						<Button
							className="w-full gap-2"
							onClick={handleCopyLink}
							variant="default"
						>
							<Copy className="h-4 w-4" />
							{copied ? "Link Copied!" : "Copy Invitation Link"}
						</Button>

						<div className="flex w-full gap-2 pt-1">
							<Button
								variant="outline"
								className="flex-1 text-xs"
								onClick={handleSwitchAccount}
								disabled={isLoggingOut}
							>
								{isLoggingOut ? (
									<Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
								) : (
									<LogOut className="mr-1 h-3.5 w-3.5" />
								)}
								Log Out & Test as Seller
							</Button>

							<Link
								href={`/event/${inviteDetails.event_id}/business-matching`}
								className="flex-1"
							>
								<Button variant="ghost" className="w-full text-xs">
									<ArrowLeft className="mr-1 h-3.5 w-3.5" />
									Back to Dashboard
								</Button>
							</Link>
						</div>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// 4. Already Claimed by Current User
	if (
		inviteDetails.is_current_user_host ||
		(inviteDetails.is_assigned &&
			inviteDetails.current_host_email?.toLowerCase() ===
				user?.email?.toLowerCase())
	) {
		return (
			<div className="container mx-auto max-w-md px-4 py-16">
				<Card className="border-blue-200 text-center shadow-md dark:border-blue-900">
					<CardHeader>
						<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
							<CheckCircle2 className="h-6 w-6" />
						</div>
						<CardTitle className="text-xl">Table Already Claimed</CardTitle>
						<CardDescription className="text-sm">
							You are already assigned as the Business Host for{" "}
							<strong>{inviteDetails.session_title}</strong>.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-xs text-muted-foreground">
						Signed in as <strong>{user?.email}</strong>. You do not need to accept
						this invitation again.
					</CardContent>
					<CardFooter className="flex flex-col gap-2">
						<Button
							className="w-full"
							onClick={() =>
								router.push(
									`/event/${inviteDetails.event_id}/business-matching`,
								)
							}
						>
							Open Host Portal
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="text-xs text-muted-foreground"
							onClick={handleSwitchAccount}
							disabled={isLoggingOut}
						>
							{isLoggingOut ? "Signing out..." : "Sign in with a different account"}
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// 5. Already Claimed by Another User
	if (inviteDetails.is_assigned) {
		return (
			<div className="container mx-auto max-w-md px-4 py-16">
				<Card className="border-amber-300 text-center shadow-md dark:border-amber-800">
					<CardHeader>
						<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
							<AlertTriangle className="h-6 w-6" />
						</div>
						<CardTitle className="text-xl">Table Unavailable</CardTitle>
						<CardDescription className="text-sm">
							<strong>{inviteDetails.session_title}</strong> has already been
							claimed by another business host.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-xs text-muted-foreground">
						<p>
							Each table can only be assigned to one business host. If you
							believe this table belongs to you, please contact the organizer of{" "}
							<strong>{inviteDetails.event_title}</strong>.
						</p>
						<div className="rounded-md bg-muted p-2.5 text-xs">
							Signed in as: <strong className="text-foreground">{user?.email}</strong>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col gap-2">
						<Button
							variant="outline"
							className="w-full"
							onClick={handleSwitchAccount}
							disabled={isLoggingOut}
						>
							{isLoggingOut ? "Signing out..." : "Switch Account"}
						</Button>
						<Link href="/dashboard" className="w-full">
							<Button variant="ghost" className="w-full text-xs">
								Go to Dashboard
							</Button>
						</Link>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// 6. Normal Business Host Claim State (Authenticated & Eligible)
	return (
		<div className="container mx-auto max-w-md px-4 py-16">
			<Card className="shadow-md">
				<CardHeader className="text-center">
					{inviteDetails.event_logo_url && (
						<div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full border">
							<Image
								src={inviteDetails.event_logo_url}
								alt={inviteDetails.event_title}
								width={64}
								height={64}
								className="h-full w-full object-cover"
							/>
						</div>
					)}
					<Badge variant="outline" className="mx-auto mb-2">
						Business Host Invitation
					</Badge>
					<CardTitle className="text-xl font-bold">
						{inviteDetails.session_title}
					</CardTitle>
					<CardDescription className="text-sm">
						at <strong className="text-foreground">{inviteDetails.event_title}</strong>
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="space-y-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
						{inviteDetails.session_location && (
							<div className="flex items-center gap-2">
								<MapPin className="h-3.5 w-3.5 text-primary" />
								<span>{inviteDetails.session_location}</span>
							</div>
						)}
						<div className="flex items-center gap-2">
							<Building2 className="h-3.5 w-3.5 text-primary" />
							<span>
								{inviteDetails.slot_duration}-minute meeting slots
							</span>
						</div>
					</div>

					<p className="text-xs text-muted-foreground">
						By accepting this invitation, you will be assigned to manage this table,
						configure your business profile, and receive buyer meeting bookings.
					</p>

					<div className="rounded-md bg-muted/70 p-3 text-xs">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Signed in as:</span>
							<button
								type="button"
								onClick={handleSwitchAccount}
								disabled={isLoggingOut}
								className="font-medium text-primary underline hover:text-primary/80 disabled:opacity-50"
							>
								{isLoggingOut ? "Signing out..." : "Switch account"}
							</button>
						</div>
						<p className="mt-1 truncate font-medium text-foreground">
							{user?.email}
						</p>
					</div>
				</CardContent>

				<CardFooter>
					<Button
						className="w-full"
						onClick={handleAccept}
						disabled={isPending || isLoggingOut}
					>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Accept Invitation & Claim Table
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
