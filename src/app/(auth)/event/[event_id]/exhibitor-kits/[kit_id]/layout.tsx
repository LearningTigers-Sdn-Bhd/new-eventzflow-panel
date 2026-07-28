"use client";

import { use } from "react";
import { useCurrentUserEventVendorId } from "@/hooks/use-event-vendors";

export default function ExhibitorKitLayout({
	children,
	params,
}: LayoutProps<"/event/[event_id]/exhibitor-kits/[kit_id]">) {
	const { event_id, kit_id } = use(params);
	const { eventVendor, isLoading } = useCurrentUserEventVendorId(
		Number(event_id),
	);

	if (isLoading)
		return <p className="p-4 text-muted-foreground">Loading booth...</p>;
	if (!eventVendor?.exhibitor_kits.some((kit) => kit.id === Number(kit_id))) {
		return <p className="p-4 text-muted-foreground">Booth not found.</p>;
	}

	return children;
}
