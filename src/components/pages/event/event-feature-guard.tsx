"use client";

import { Settings2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/data-state";
import { useEventSidebarContextSafe } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Button } from "@/components/ui/button";

interface EventFeatureGuardProps {
	/** The event toggle that must be on. */
	feature: "use_rfid" | "use_people_counter";
	/** What the feature is called to people, e.g. "RFID". */
	name: string;
	children: ReactNode;
}

/**
 * Keeps a page that an event hasn't turned on out of reach, even by typing its
 * address. The sidebar already hides the menu item; this covers direct links.
 */
export function EventFeatureGuard({
	feature,
	name,
	children,
}: EventFeatureGuardProps) {
	const context = useEventSidebarContextSafe();

	// Outside the event sidebar there is nothing to check against.
	if (!context) return <>{children}</>;
	// Wait for the event so the page doesn't flash and then vanish.
	if (context.isLoading || !context.currentEvent) return null;
	if (context.currentEvent[feature] === true) return <>{children}</>;

	return (
		<EmptyState
			title={`${name} is turned off for this event`}
			description="An organizer can turn it on under Event Information, in Event Modules & Integrations."
			icon={<Settings2 />}
			height="h-64"
			action={
				<Button asChild variant="outline" className="rounded-none">
					<Link href={`/event/${context.eventId}/details`}>
						Open Event Information
					</Link>
				</Button>
			}
		/>
	);
}
