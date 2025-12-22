"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PatternedLayout } from "@/components/patterned-layout";
import { Button } from "@/components/ui/button";
import { VendorSignupEventSidebar } from "./vendor-signup-event-sidebar";

interface EventInfo {
	id: number;
	title: string;
	description: string | null;
	start_date: string | null;
	end_date: string | null;
}

interface AlreadyAssignedCardProps {
	event: EventInfo | undefined;
}

export function AlreadyAssignedCard({ event }: AlreadyAssignedCardProps) {
	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			<VendorSignupEventSidebar event={event} />

			<PatternedLayout>
				<div className="w-full max-w-md space-y-4">
					{/* Header */}
					<div className="rounded-none border bg-background p-5 text-center">
						<div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
							<CheckCircle2 className="h-7 w-7 text-blue-600" />
						</div>
						<p className="mb-1 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
							Already Registered
						</p>
						<h1 className="font-bold text-2xl tracking-tight">
							You're Already a Vendor!
						</h1>
						<p className="mt-2 text-muted-foreground text-sm">
							You've already been assigned to this event
						</p>
					</div>

					{/* Info Message */}
					<div className="space-y-3 rounded-none border border-blue-200 bg-blue-50 p-5">
						<p className="text-blue-800 text-sm">
							You can manage your vendor settings and view event details from
							your dashboard.
						</p>
						<ul className="space-y-2 text-blue-700 text-sm">
							<li className="flex items-start gap-2">
								<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
								Update your redirect URL and poster
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
								View your QR code and analytics
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
								Manage vouchers and promotions
							</li>
						</ul>
					</div>

					{/* CTA */}
					<Button
						asChild
						size="lg"
						className="h-12 w-full rounded-none font-medium text-base"
					>
						<Link href="/dashboard">
							Go to Dashboard
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>

					{/* Footer note */}
					<p className="text-center text-muted-foreground text-xs">
						Need help? Contact the event organizer
					</p>
				</div>
			</PatternedLayout>
		</div>
	);
}
