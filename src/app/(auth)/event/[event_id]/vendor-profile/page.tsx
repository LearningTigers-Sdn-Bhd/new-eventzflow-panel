"use client";

import { use } from "react";
import { ErrorState } from "@/components/data-state";
import { VendorProfileView } from "@/components/pages/event-vendors/vendor-profile-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth/use-auth";

export default function MyProfilePage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { user, isInitialized } = useAuth();

	// Show loading while auth is hydrating
	if (!isInitialized) {
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
				action={<Button onClick={() => window.history.back()}>Go Back</Button>}
			/>
		);
	}

	return <VendorProfileView eventId={event_id} />;
}
