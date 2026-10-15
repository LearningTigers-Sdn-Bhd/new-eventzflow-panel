"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { InviteHostContent } from "@/components/pages/invite/invite-host-content";

// Legacy links (?token=<signed token>) sent before short codes.
function LegacyInvite() {
	const token = useSearchParams().get("token");
	return (
		<InviteHostContent
			token={token}
			selfPath={`/invite/host?token=${encodeURIComponent(token ?? "")}`}
		/>
	);
}

export default function InviteHostPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<Loader2 className="animate-spin" />
				</div>
			}
		>
			<LegacyInvite />
		</Suspense>
	);
}
