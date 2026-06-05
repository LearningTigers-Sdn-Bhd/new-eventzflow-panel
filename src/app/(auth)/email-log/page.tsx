"use client";

import { ErrorState } from "@/components/data-state";
import { EmailDeliveriesView } from "@/components/pages/email-deliveries/email-deliveries-view";
import { useAuth } from "@/hooks/auth/use-auth";

export default function EmailLogPage() {
	const { user, isInitialized } = useAuth();

	if (!isInitialized) {
		return null;
	}

	if (user?.role !== "org_owner") {
		return (
			<ErrorState
				title="Access denied"
				description="Only org owners can access email logs."
			/>
		);
	}

	return <EmailDeliveriesView />;
}
