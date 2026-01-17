"use client";

import { use } from "react";
import { ErrorState } from "@/components/data-state";
import { ContractorProfileView } from "@/components/pages/event-exhibitor-contractor/contractor-profile-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function ContractorProfilePage({
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

	// Only exhibition contractors can access this page
	if (user?.role !== "exhibition_contractor") {
		return (
			<ErrorState
				title="Access Denied"
				description="This page is only accessible to exhibition contractor users."
				action={<Button onClick={() => window.history.back()}>Go Back</Button>}
			/>
		);
	}

	return <ContractorProfileView eventId={event_id} />;
}
