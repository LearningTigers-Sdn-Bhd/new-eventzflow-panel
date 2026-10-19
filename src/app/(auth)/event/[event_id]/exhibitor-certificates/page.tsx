"use client";

import { useQuery } from "@tanstack/react-query";
import { Send, SquarePen } from "lucide-react";
import { use } from "react";
import { LoadingState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import {
	ExhibitorCertificateDesigner,
	exhibitorTemplatesKey,
} from "@/components/pages/certificates/exhibitor-certificate-designer";
import { ExhibitorCertificatesPanel } from "@/components/pages/certificates/exhibitor-certificates-panel";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCertificateTemplates } from "@/lib/api/certificate";
import { getEventById } from "@/lib/api/event";

export default function ExhibitorCertificatesPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { permissions } = useEventSidebarContext();
	const { canManageEventVendors, isEventVendor } = permissions;

	const { data: event, isLoading } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
	});

	const enabled =
		event?.use_certificate === true &&
		event?.use_exhibitor_kit === true &&
		canManageEventVendors;

	const { data: templates } = useQuery({
		queryKey: exhibitorTemplatesKey(event_id),
		queryFn: () => getCertificateTemplates(event_id, "exhibitor"),
		enabled,
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading certificates..."
				description="Please wait while we load the certificate designer."
			/>
		);
	}

	if (!enabled) {
		return (
			<FeatureLockedState
				isEventVendor={isEventVendor}
				featureName="Exhibitor E-Certificates"
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
					<ExhibitorCertificateDesigner eventId={event_id} />
				</TabsContent>
				<TabsContent value="send" className="mt-0">
					<ExhibitorCertificatesPanel
						eventId={event_id}
						canSend={templates?.[0]?.status === "ready"}
					/>
				</TabsContent>
			</div>
		</Tabs>
	);
}
