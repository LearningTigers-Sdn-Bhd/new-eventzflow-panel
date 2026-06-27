"use client";

import { useQuery } from "@tanstack/react-query";
import { Send, SquarePen } from "lucide-react";
import { use } from "react";
import { LoadingState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import { CertificateParticipants } from "@/components/pages/certificates/certificate-participants";
import { CertificatesDesigner } from "@/components/pages/certificates/certificates-designer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { getCertificateTemplate } from "@/lib/api/certificate";
import { getEventById } from "@/lib/api/event";

export default function CertificatesPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { canManageEventVendors, isEventVendor } =
		useEventPermissions(event_id);

	const { data: event, isLoading } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
	});

	const { data: template } = useQuery({
		queryKey: ["event", event_id, "certificate-template"],
		queryFn: () => getCertificateTemplate(event_id),
		enabled: event?.use_certificate === true && canManageEventVendors,
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading certificates..."
				description="Please wait while we load the certificate designer."
			/>
		);
	}

	// Gate behind the feature flag and event-admin permission.
	if (event?.use_certificate !== true || !canManageEventVendors) {
		return (
			<FeatureLockedState
				isEventVendor={isEventVendor}
				featureName="E-Certificates"
			/>
		);
	}

	return (
		<Tabs defaultValue="design" className="w-full">
			<div className="w-full border-y border-dashed">
				<TabsList className="flex h-12 w-full rounded-none">
					<TabsTrigger
						value="design"
						className="flex flex-1 items-center justify-center gap-2 rounded-none"
					>
						<SquarePen className="size-4" />
						Design Certificate
					</TabsTrigger>
					<TabsTrigger
						value="send"
						className="flex flex-1 items-center justify-center gap-2 rounded-none"
					>
						<Send className="size-4" />
						Send &amp; Track
					</TabsTrigger>
				</TabsList>
			</div>

			<div className="mt-6">
				<TabsContent value="design" className="mt-0">
					<CertificatesDesigner eventId={event_id} />
				</TabsContent>
				<TabsContent value="send" className="mt-0">
					<CertificateParticipants
						eventId={event_id}
						canSend={template?.status === "ready"}
					/>
				</TabsContent>
			</div>
		</Tabs>
	);
}
