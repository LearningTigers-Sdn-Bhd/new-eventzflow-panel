"use client";

import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatternedLayout } from "@/components/patterned-layout";
import { VendorSignupEventSidebar } from "./vendor-signup-event-sidebar";

interface EventInfo {
	id: number;
	title: string;
	description: string | null;
	start_date: string | null;
	end_date: string | null;
}

interface CheckAccountFormProps {
	event: EventInfo | undefined;
	onSignIn: () => void;
	onCreateAccount: () => void;
}

export function CheckAccountForm({
	event,
	onSignIn,
	onCreateAccount,
}: CheckAccountFormProps) {
	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			<VendorSignupEventSidebar event={event} />

			<PatternedLayout>
				<div className="w-full max-w-md space-y-4">
					{/* Header */}
					<div className="rounded-none border bg-background p-5 text-center">
						<p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
							Get Started
						</p>
						<h1 className="text-2xl font-bold tracking-tight">
							Ready to join as a vendor?
						</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							Let us know if you already have an account with us
						</p>
					</div>

					{/* Options */}
					<div className="rounded-none border bg-background p-5 space-y-4">
						<Button
							variant="default"
							className="h-14 w-full rounded-none text-base"
							size="lg"
							onClick={onSignIn}
						>
							<LogIn className="mr-2 h-5 w-5" />
							Yes, I have an account
						</Button>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									or
								</span>
							</div>
						</div>

						<Button
							variant="outline"
							className="h-14 w-full rounded-none text-base"
							size="lg"
							onClick={onCreateAccount}
						>
							<UserPlus className="mr-2 h-5 w-5" />
							No, I'm new here
						</Button>
					</div>

					{/* Footer note */}
					<p className="text-center text-muted-foreground text-xs">
						Creating an account takes just a few minutes
					</p>
				</div>
			</PatternedLayout>
		</div>
	);
}
