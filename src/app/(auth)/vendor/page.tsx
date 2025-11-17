"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorState, LoadingState } from "@/components/data-state";
import VendorClientWrapper from "@/components/pages/vendors/vendor-client-wrapper";
import { Button } from "@/components/ui/button";
import { useHydratedStore } from "@/hooks/use-hydrated-store";
import { getVendors } from "@/lib/api/vendor";

export default function VendorPage() {
	const isHydrated = useHydratedStore();

	const {
		data: vendors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["vendors"],
		queryFn: getVendors,
		enabled: isHydrated, // Only fetch when store is hydrated
	});

	return (
		<div className="space-y-6 p-0">
			{/* Show loading state, error state, or content */}
			{isLoading ? (
				<LoadingState
					title="Loading vendors..."
					description="Please wait while we fetch your vendors..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load vendors"
					description="We couldn't load your vendors. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<VendorClientWrapper vendors={vendors || []} />
			)}
		</div>
	);
}
