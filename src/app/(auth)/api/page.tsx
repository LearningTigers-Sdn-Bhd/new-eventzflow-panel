"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/data-state";
import ApiKeysClientWrapper from "@/components/pages/api/api-keys-client-wrapper";
import { ApiKeysSkeleton } from "@/components/pages/api/skeleton/api-keys-skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { getApiKeys } from "@/lib/api/api-keys";

export default function ApiPage() {
	const { isInitialized } = useAuth();

	const {
		data: apiKeys,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["api-keys"],
		queryFn: getApiKeys,
		enabled: isInitialized, // Only fetch when store is hydrated
	});

	return (
		<div className="space-y-6 p-0">
			{/* Show skeleton while loading or error state */}
			{isLoading ? (
				<ApiKeysSkeleton />
			) : error ? (
				<ErrorState
					title="Failed to load API keys"
					description="We couldn't load your API keys. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<ApiKeysClientWrapper apiKeys={apiKeys || []} />
			)}
		</div>
	);
}
