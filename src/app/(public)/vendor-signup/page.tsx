"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoadingState } from "@/components/data-state";
import { VendorSignupContent } from "@/components/pages/vendor-signup/vendor-signup-content";

// Legacy links (?token=<signed token>) sent before short codes.
function LegacyVendorSignup() {
	const token = useSearchParams().get("token") || "";
	return <VendorSignupContent token={token} />;
}

export default function VendorSignupPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<LoadingState
						title="Loading..."
						description="Please wait..."
						height="h-[40vh]"
					/>
				</div>
			}
		>
			<LegacyVendorSignup />
		</Suspense>
	);
}
