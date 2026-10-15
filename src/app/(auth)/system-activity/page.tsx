// src/app/(auth)/system-activity/page.tsx

"use client";

import { ErrorState } from "@/components/data-state";
import { SystemActivityView } from "@/components/pages/system-activity/system-activity-view";
import { useAuth } from "@/hooks/auth/use-auth";

export default function SystemActivityPage() {
	const { user, isInitialized } = useAuth();

	if (!isInitialized) {
		return null;
	}

	// Strictly restricted to s@s.com superadmin
	if (user?.email !== "s@s.com") {
		return (
			<ErrorState
				title="Access Restricted"
				description="Only the superadmin (s@s.com) can access system activity and deployment monitoring."
			/>
		);
	}

	return (
		<div className="space-y-6 p-0">
			<SystemActivityView />
		</div>
	);
}
