"use client";

import { use } from "react";
import { VendorProfileView } from "@/components/pages/event-vendors/vendor-profile-view";
import { useAuth } from "@/hooks/use-auth";
import { ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyProfilePage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { user, isHydrated } = useAuth();

	// Show loading while auth is hydrating
	if (!isHydrated) {
		return (
			<div className="space-y-6 p-6">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	// Only vendors can access this page
	if (user?.role !== "vendor") {
		return (
			<ErrorState
				title="Access Denied"
				description="This page is only accessible to vendor users."
				action={
					<Button onClick={() => window.history.back()}>Go Back</Button>
				}
			/>
		);
	}

	return <VendorProfileView eventId={event_id} />;
}
