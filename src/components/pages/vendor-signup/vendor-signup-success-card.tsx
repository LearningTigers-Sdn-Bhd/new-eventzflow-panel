"use client";

import { ArrowRight, CheckCircle2, Store } from "lucide-react";
import Link from "next/link";
import { PatternedLayout } from "@/components/patterned-layout";
import { Button } from "@/components/ui/button";

interface VendorSignupSuccessCardProps {
	eventTitle: string;
	isExistingVendor?: boolean;
}

export function VendorSignupSuccessCard({
	eventTitle,
	isExistingVendor = false,
}: VendorSignupSuccessCardProps) {
	return (
		<div className="min-h-screen bg-background">
			<PatternedLayout opacity={0.15}>
				<div className="w-full max-w-md space-y-4">
					{/* Success Header */}
					<div className="rounded-none border bg-background p-6 text-center">
						<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
							<CheckCircle2 className="h-8 w-8 text-green-600" />
						</div>
						<h1 className="mb-2 font-bold text-2xl tracking-tight">
							{isExistingVendor ? "You're In!" : "Welcome Aboard!"}
						</h1>
						<p className="text-muted-foreground text-sm">
							{isExistingVendor
								? "You've successfully joined the event!"
								: "Your registration is complete!"}
						</p>
					</div>

					{/* Event Info */}
					<div className="rounded-none border bg-background p-5">
						<div className="mb-3 flex items-center gap-2">
							<Store className="h-4 w-4 text-primary" />
							<p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
								You're now a vendor for
							</p>
						</div>
						<h2 className="font-semibold text-lg">{eventTitle}</h2>
					</div>

					{/* Next Steps */}
					<div className="rounded-none border bg-background p-5">
						<p className="mb-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
							What's Next?
						</p>
						<ul className="space-y-3">
							<li className="flex items-start gap-3">
								<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-xs">
									1
								</span>
								<span className="text-muted-foreground text-sm">
									Go to your dashboard to view the event
								</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-xs">
									2
								</span>
								<span className="text-muted-foreground text-sm">
									Update your event settings if needed
								</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-xs">
									3
								</span>
								<span className="text-muted-foreground text-sm">
									Get ready for the event!
								</span>
							</li>
						</ul>
					</div>

					{/* CTA */}
					<Button asChild size="lg" className="w-full rounded-none">
						<Link href="/dashboard">
							Go to Dashboard
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</PatternedLayout>
		</div>
	);
}
